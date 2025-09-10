"use client";
import { AuthProvider } from "../components/AuthProvider";
import { PersonaProvider } from "@/contexts/persona-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <PersonaProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </PersonaProvider>
  );
}