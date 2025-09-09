import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../lib/firebase";

export function SignInButton() {
  const handleSignIn = async () => {
    await signInWithPopup(auth, new GoogleAuthProvider());
  };
  return <button onClick={handleSignIn}>Sign In with Google</button>;
}