import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  appId: "YOUR_APP_ID"
};

export const app = initializeApp(firebaseConfig);
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
