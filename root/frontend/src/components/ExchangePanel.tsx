import React, { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { fn } from "../firebase";

export default function ExchangePanel({ user }: { user: User | null }) {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res: any = await fn.listExchangeCandidates({ limit: 8 });
        setCandidates(res.data.users);
      } catch (e: any) {
        setError(e?.message ?? "Failed");
      }
      setLoading(false);
    })();
  }, [user]);

  if (!user) return <div className="card">Sign in to exchange.</div>;
  if (loading) return <div className="card">Loading users…</div>;
  if (error) return <div className="card">{error}</div>;

  return (
    <div className="grid">
      {candidates.map((u) => (
        <div className="card" key={u.uid}>
          <div className="row">
            <img
              src={u.photoURL || ""}
              alt=""
              onError={(e: any) => (e.target.style.display = "none")}
            />
            <div>
              <h3>{u.displayName || "Player"}</h3>
              {u.lastCaught ? (
                <div>
                  Last caught: {u.lastCaught.name} #{u.lastCaught.number}
                </div>
              ) : (
                <div>No catches yet</div>
              )}
            </div>
          </div>
          <div className="row">
            <button onClick={() => startAsk(u.uid)}>Ask</button>
            <button onClick={() => startGive(u.uid)}>Give</button>
            <button onClick={() => startSteal(u.uid)}>Steal</button>
          </div>
        </div>
      ))}
    </div>
  );

  async function startAsk(toUid: string) {
    // Minimal demo: request one Lanternfish, no offers
    await fn.createExchange({
      toUid,
      type: "ask",
      offer: [],
      request: [{ creatureKey: "lanternfish" }],
    });
    alert("Ask sent!");
  }
  async function startGive(toUid: string) {
    await fn.createExchange({ toUid, type: "give", offer: [], request: [] });
    alert("Give (placeholder) sent!");
  }
  async function startSteal(toUid: string) {
    // For demo we don’t pick inv IDs; normally you'd show inventory pickers
    alert(
      "Open a modal to pick your creature and target’s creature, then call performSteal."
    );
  }
}
