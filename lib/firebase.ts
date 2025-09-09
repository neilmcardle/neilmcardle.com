import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";



const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);