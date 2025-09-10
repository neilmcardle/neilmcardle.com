import React from "react";
import { signInWithPopup, GoogleAuthProvider, getAuth } from "firebase/auth";

export function SignInButton() {
  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      // Handle error
      alert("Sign-in error: " + error);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      className="px-6 py-2 rounded-full bg-[#15161a] text-white font-semibold hover:bg-[#23242a] transition text-base shadow"
    >
      Sign in with Google
    </button>
  );
}