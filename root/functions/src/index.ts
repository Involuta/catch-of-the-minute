import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { v4 as uuid } from "uuid";
import { CREATURES, randomCreature, CreatureKey } from "./creatures";
import { pAttack, pDevour, stealOutcomeWeights, chooseIndexByWeights } from "./logic";

admin.initializeApp();
const db = admin.firestore();

// ---------- Scheduled: Create the next COTM every minute ----------
export const scheduleNextCOTM = functions.pubsub.schedule("* * * * *").onRun(async () => {
  const now = admin.firestore.Timestamp.now();
  const startSec = Math.floor(now.seconds / 60) * 60; // truncate to minute
  const start = new admin.firestore.Timestamp(startSec, 0);
  const end   = new admin.firestore.Timestamp(startSec + 60, 0);
  const minuteId = new Date(startSec*1000).toISOString().slice(0,16).replace(/[:\-T]/g,"");

  const species = randomCreature();
  // choose a max number > 0
  const maxNumber = Math.max(1, Math.floor(Math.random()*1000)+1); // 1..1000 to keep it fun live
  const cotmDoc = {
    minuteStart: start,
    minuteEnd: end,
    species,
    currentNumber: maxNumber,
    maxNumber,
    attacksEnabledWindow: { startOffsetSec: 10, endOffsetSec: 50 }
  };

  await db.collection("cotm").doc(minuteId).set(cotmDoc);

  // publish to Pub/Sub topic for Cloud Run worker
  const { PubSub } = await import("@google-cloud/pubsub");
  const pubsub = new PubSub();
  await pubsub.topic("cotm-started").publishMessage({
    json: { minuteId, minuteStartSec: startSec, species, maxNumber }
  });

  return null;
});

// ---------- Public: get current COTM ----------
export const getCurrentCOTM = functions.https.onCall(async (_, ctx) => {
  const now = admin.firestore.Timestamp.now().toDate();
  const minuteId = new Date(now.getTime() - (now.getSeconds()*1000)).toISOString().slice(0,16).replace(/[:\-T]/g,"");
  const snap = await db.collection("cotm").doc(minuteId).get();
  if (!snap.exists) return { exists:false };
  return { exists:true, id: snap.id, data: snap.data() };
});

// ---------- Auth helper ----------
function requireAuth(ctx: functions.https.CallableContext) {
  if (!ctx.auth) {
    throw new functions.https.HttpsError("unauthenticated","Sign in required.");
  }
  return ctx.auth.uid;
}

// ---------- Catch the COTM ----------
export const catchCreature = functions.https.onCall(async (data, ctx) => {
  const uid = requireAuth(ctx);
  const { cotmId } = data as { cotmId:string };
  const cotmRef = db.collection("cotm").doc(cotmId);
  await db.runTransaction(async tx => {
    const c = await tx.get(cotmRef);
    if (!c.exists) throw new functions.https.HttpsError("failed-precondition","COTM not found.");
    const cotm = c.data()!;
    if (cotm.currentNumber <= 0) throw new functions.https.HttpsError("failed-precondition","Creature depleted.");

    // decrement
    tx.update(cotmRef, { currentNumber: admin.firestore.FieldValue.increment(-1) });

    // award to user with the *pre-decrement* number
    const awardedNumber = cotm.currentNumber; // e.g. 2 -> you get "Lanternfish 2"
    const species = cotm.species as {key:CreatureKey; name:string; basePower:number};

    const invRef = db.collection("users").doc(uid).collection("inventory").doc(uuid());
    tx.set(invRef, {
      creatureKey: species.key,
      name: species.name,
      power: species.basePower,
      number: awardedNumber,
      caughtAt: admin.firestore.Timestamp.now(),
      alive: true
    });

    // lightweight public profile update
    tx.set(db.collection("public").doc("usersLight").collection("").doc(uid), {
      displayName: ctx.auth?.token?.name ?? "Player",
      photoURL: ctx.auth?.token?.picture ?? null,
      lastCaught: {
        creatureKey: species.key,
        name: species.name,
        number: awardedNumber,
        at: admin.firestore.Timestamp.now()
      }
    }, { merge: true });

    // event
    tx.set(cotmRef.collection("events").doc(), {
      type: "catch",
      createdAt: admin.firestore.Timestamp.now(),
      actorUid: uid,
      payload: { species: species.key, number: awardedNumber }
    });
  });
  return { ok: true };
});

// ---------- List exchange candidates (random sample) ----------
export const listExchangeCandidates = functions.https.onCall(async (data, ctx) => {
  requireAuth(ctx);
  const { limit = 8 } = data || {};
  // (Simple approach: query usersLight, client shuffles)
  const snap = await db.collection("public").doc("usersLight").listCollections();
  // We cannot list documents from a "collection group" here the way created; adjust to actual path:
  const usersLight = await db.collection("public").limit(200).get();
  const pool = usersLight.docs.map(d => ({ uid: d.id, ...d.data() }));
  // shuffle and take 'limit'
  for (let i = pool.length -1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return { users: pool.slice(0, limit) };
});

// ---------- Create an exchange (ask|give|steal) ----------
export const createExchange = functions.https.onCall(async (data, ctx) => {
  const uid = requireAuth(ctx);
  const { toUid, type, offer, request } = data as {
    toUid: string, type: "ask"|"give"|"steal",
    offer: Array<{invId:string}>,
    request: Array<{creatureKey:CreatureKey, minNumber?:number}>
  };

  if (uid === toUid) throw new functions.https.HttpsError("invalid-argument","Cannot target yourself.");

  const exRef = db.collection("exchanges").doc();
  await exRef.set({
    createdAt: admin.firestore.Timestamp.now(),
    status: "pending",
    type, fromUid: uid, toUid,
    offer, request
  });

  return { id: exRef.id };
});

// ---------- Respond to exchange (accept/reject) ----------
export const respondExchange = functions.https.onCall(async (data, ctx) => {
  const uid = requireAuth(ctx);
  const { exchangeId, action } = data as { exchangeId:string, action:"accept"|"reject"|"cancel" };
  const ref = db.collection("exchanges").doc(exchangeId);
  await db.runTransaction(async tx => {
    const exSnap = await tx.get(ref);
    if (!exSnap.exists) throw new functions.https.HttpsError("not-found","Exchange not found");
    const ex = exSnap.data()!;
    if (action==="cancel") {
      if (ex.fromUid !== uid) throw new functions.https.HttpsError("permission-denied","Only sender can cancel");
      tx.update(ref, { status:"cancelled", resolvedAt: admin.firestore.Timestamp.now() });
      return;
    }
    if (ex.toUid !== uid) throw new functions.https.HttpsError("permission-denied","Only receiver can respond");

    if (action==="reject") {
      tx.update(ref, { status:"rejected", resolvedAt: admin.firestore.Timestamp.now() });
      return;
    }

    // accept -> apply transfer atomically
    // offer: move offered creatures from their owners to the counterparty (or to toUid if ask/give)
    const fromUid = ex.fromUid;
    const toUid = ex.toUid;

    // Build lists
    const offeredByFrom = (ex.offer||[]).map((o:any)=>({ ownerUid: fromUid, invId:o.invId }));
    const offeredByTo   = (ex.type==="ask" ? [] : (ex.offer||[]).filter((o:any)=>o.ownerUid===toUid));
    // For simplicity, we implement: when accepted, we just transfer the offered inv items to the other party.
    // Requests are informational; the UI should ensure sensible offers.

    // Transfer function
    const moveItem = async (ownerUid:string, invId:string, newOwnerUid:string) => {
      const src = db.collection("users").doc(ownerUid).collection("inventory").doc(invId);
      const item = await tx.get(src);
      if (!item.exists) throw new functions.https.HttpsError("failed-precondition","Offered item not found");
      const it = item.data()!;
      if (it.alive===false) throw new functions.https.HttpsError("failed-precondition","Offered creature is dead");

      const dst = db.collection("users").doc(newOwnerUid).collection("inventory").doc(invId);
      tx.set(dst, it);
      tx.delete(src);
    };

    // Apply: sender's offered → receiver
    for (const it of offeredByFrom) { await moveItem(fromUid, it.invId, toUid); }
    // Apply: receiver's offered → sender (for give-type from receiver side)
    for (const it of offeredByTo)   { await moveItem(toUid, it.invId, fromUid); }

    tx.update(ref, { status:"applied", resolvedAt: admin.firestore.Timestamp.now() });
  });
  return { ok:true };
});

// ---------- Perform a steal ----------
export const performSteal = functions.https.onCall(async (data, ctx) => {
  const uid = requireAuth(ctx);
  const { targetUid, myInvId, targetInvId } = data as { targetUid:string, myInvId:string, targetInvId:string };
  if (uid === targetUid) throw new functions.https.HttpsError("invalid-argument","Cannot steal from yourself");

  await db.runTransaction(async tx => {
    const myRef = db.collection("users").doc(uid).collection("inventory").doc(myInvId);
    const tRef  = db.collection("users").doc(targetUid).collection("inventory").doc(targetInvId);
    const [mySnap, tSnap] = await Promise.all([tx.get(myRef), tx.get(tRef)]);
    if (!mySnap.exists || !tSnap.exists) throw new functions.https.HttpsError("failed-precondition","Items missing");
    const me = mySnap.data()!; const them = tSnap.data()!;
    if (!me.alive) throw new functions.https.HttpsError("failed-precondition","Your creature is dead");
    if (!them.alive) throw new functions.https.HttpsError("failed-precondition","Target creature already dead");

    const weights = stealOutcomeWeights(me.power, me.number);
    const idx = chooseIndexByWeights(weights);
    // 0 both; 1 die+get; 2 die+nothing; 3 myStolen+get; 4 myStolen+nothing
    const outcomes = ["BOTH","DIE_GET","DIE_NONE","MYSTOLEN_GET","MYSTOLEN_NONE"] as const;
    const outcome = outcomes[idx];

    const kill = () => tx.update(myRef, { alive: false });

    const stealToMe = () => {
      // move targetInvId to my inventory (keeping same doc id for simplicity unique per owner)
      const newRef = db.collection("users").doc(uid).collection("inventory").doc(targetInvId);
      tx.set(newRef, them);
      tx.delete(tRef);
    };

    const myBeStolen = () => {
      const newRef = db.collection("users").doc(targetUid).collection("inventory").doc(myInvId);
      tx.set(newRef, me);
      tx.delete(myRef);
    };

    if (outcome === "BOTH") { stealToMe(); /* my creature returns unchanged */ }
    if (outcome === "DIE_GET") { kill(); stealToMe(); }
    if (outcome === "DIE_NONE") { kill(); /* nothing else */ }
    if (outcome === "MYSTOLEN_GET") { myBeStolen(); stealToMe(); }
    if (outcome === "MYSTOLEN_NONE") { myBeStolen(); }

    // event
    tx.set(db.collection("cotm").doc("global").collection("events").doc(), {
      type: "steal",
      createdAt: admin.firestore.Timestamp.now(),
      actorUid: uid, targetUid,
      payload: { myInvId, targetInvId, outcome }
    });
  });

  return { ok:true };
});

// ---------- Profile ----------
export const getProfile = functions.https.onCall(async (data, ctx) => {
  const uid = requireAuth(ctx);
  const invSnap = await db.collection("users").doc(uid).collection("inventory").orderBy("caughtAt","desc").limit(500).get();
  return { inventory: invSnap.docs.map(d => ({ id: d.id, ...d.data() })) };
});
