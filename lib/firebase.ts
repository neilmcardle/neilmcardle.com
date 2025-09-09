import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCFsRYH5GO0GFy1e01XS4tNIeGP9m1IMG8",
  authDomain: "makeebook-88.firebaseapp.com",
  projectId: "makeebook-88",
  storageBucket: "makeebook-88.firebasestorage.app",
  messagingSenderId: "154345795627",
  appId: "1:154345795627:web:27069e1bb6e8eec4dfba6e",
  measurementId: "G-CZ73WW9M35"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);