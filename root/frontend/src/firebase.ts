import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyDaXssJDIGYr3bsCW3WCCzdgoiDpxRfzDE",
  authDomain: "catch-of-the-minute.firebaseapp.com",
  projectId: "catch-of-the-minute",
  storageBucket: "catch-of-the-minute.firebasestorage.app",
  messagingSenderId: "1043239069257",
  appId: "1:1043239069257:web:712ae2e1955ba914bd4198",
  measurementId: "G-6CBC0HRJGG"
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, "us-central1");

export async function login(){ await signInWithPopup(auth, new GoogleAuthProvider()); }
export async function logout(){ await signOut(auth); }

// Callable functions
export const fn = {
  getCurrentCOTM: httpsCallable(functions, "getCurrentCOTM"),
  catchCreature: httpsCallable(functions, "catchCreature"),
  listExchangeCandidates: httpsCallable(functions, "listExchangeCandidates"),
  createExchange: httpsCallable(functions, "createExchange"),
  respondExchange: httpsCallable(functions, "respondExchange"),
  performSteal: httpsCallable(functions, "performSteal"),
  getProfile: httpsCallable(functions, "getProfile")
};
