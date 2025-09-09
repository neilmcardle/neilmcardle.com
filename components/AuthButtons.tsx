"use client";
import { signInWithPopup, GoogleAuthProvider, signOut } from "../firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "../AuthProvider";


export function AuthButtons() {
  const { user } = useAuth();

  if (!user) return null;

  return user.isAnonymous ? (
    <button
      onClick={async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      }}
      className="px-4 py-2 rounded bg-blue-600 text-white"
    >
      Sign in with Google
    </button>
  ) : (
    <button
      onClick={() => signOut(auth)}
      className="px-4 py-2 rounded bg-gray-200"
    >
      Log out
    </button>
  );
}