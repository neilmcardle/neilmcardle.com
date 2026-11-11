"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type Dispatch,
} from "react";
import { track } from "@vercel/analytics";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useFeatureAccess, useSubscription } from "@/lib/hooks/useSubscription";
import { useSignupConversion } from "@/lib/hooks/useSignupConversion";
import { keys, readLocal, writeLocal } from "../storage/keys";
import { useCloudSync, type SyncPort } from "../hooks/useCloudSync";
import {
  appPhase,
  initialAppPhase,
  type AppPhase,
  type AppPhaseEvent,
} from "../state/appPhase";
import {
  usePort,
  usePublishedStore,
  useStoreSelector,
  type Store,
} from "./store";

type Auth = ReturnType<typeof useAuth>;

export interface SessionState {
  user: Auth["user"];
  signOut: Auth["signOut"];
  authLoading: boolean;
  tierLoading: boolean;
  tierKnown: boolean;
  hasCloudSync: boolean;
  hasBookMind: boolean;
  isPro: boolean;
  phase: AppPhase;
  cloudSync: ReturnType<typeof useCloudSync>;
}

interface SessionInternals {
  session: SessionState;
  dispatchPhase: Dispatch<AppPhaseEvent>;
  connectSync: (handlers: Partial<SyncPort>) => void;
}

const SessionInternalsContext = createContext<SessionInternals | null>(null);
const SessionStoreContext = createContext<Store<SessionState> | null>(null);

const SYNC_FALLBACK: SyncPort = {
  openBookId: () => undefined,
  libraryChanged: () => {},
  openBookUpdated: () => {},
};

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { user, signOut, loading: authLoading } = useAuth();

  useSignupConversion();

  const {
    isLoading: tierLoading,
    tierKnown,
    expectUpgrade,
  } = useSubscription();
  const hasCloudSync = useFeatureAccess("cloud_sync");
  const hasBookMind = useFeatureAccess("book_mind_ai");

  const searchParams = useSearchParams();
  const router = useRouter();
  const [phase, dispatchPhase] = useReducer(appPhase, initialAppPhase);

  useEffect(() => {
    if (!user?.id || typeof window === "undefined") return;
    const flag = keys.editorOpened(user.id);
    if (!readLocal(flag)) {
      writeLocal(flag, "1");
      track("editor_opened_first_time");
    }
  }, [user?.id]);

  useEffect(() => {
    if (!searchParams) return;
    if (searchParams.get("checkout") === "success") {
      const type = searchParams.get("type") === "lifetime" ? "lifetime" : "pro";
      track("checkout_completed", { tier: type });
      expectUpgrade();
      router.replace("/make-ebook");
    }
  }, [searchParams, router, expectUpgrade]);

  const prevUserRef = useRef(user);
  useEffect(() => {
    if (prevUserRef.current && !user) dispatchPhase({ type: "signedOut" });
    if (!prevUserRef.current && user) dispatchPhase({ type: "signedIn" });
    prevUserRef.current = user;
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user?.id) dispatchPhase({ type: "noUser" });
  }, [authLoading, user?.id]);

  const { port, connect: connectSync } = usePort(SYNC_FALLBACK);
  const cloudSync = useCloudSync({
    user,
    hasCloudSync,
    cloudSyncKnown: !tierLoading,
    port,
  });

  const session: SessionState = {
    user,
    signOut,
    authLoading,
    tierLoading,
    tierKnown,
    hasCloudSync,
    hasBookMind,
    isPro: hasBookMind,
    phase,
    cloudSync,
  };
  const store = usePublishedStore(session);

  return (
    <SessionInternalsContext.Provider
      value={{ session, dispatchPhase, connectSync }}
    >
      <SessionStoreContext.Provider value={store}>
        {children}
      </SessionStoreContext.Provider>
    </SessionInternalsContext.Provider>
  );
}

export function useSessionInternals() {
  const value = useContext(SessionInternalsContext);
  if (!value) throw new Error("SessionProvider is missing");
  return value;
}

export function useSession<S>(
  selector: (state: SessionState) => S,
  equal?: (a: S, b: S) => boolean,
): S {
  const store = useContext(SessionStoreContext);
  if (!store) throw new Error("SessionProvider is missing");
  return useStoreSelector(store, selector, equal);
}
