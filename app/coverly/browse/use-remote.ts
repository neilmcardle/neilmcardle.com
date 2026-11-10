"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  idleRemote,
  remote,
  remoteData,
  remoteFailed,
  type Remote,
  type RemoteEvent,
} from "./remote";

export function useRemote<T>(
  key: string | null,
  load: (key: string) => Promise<T>,
) {
  const [state, dispatch] = useReducer(
    remote as (s: Remote<T>, e: RemoteEvent<T>) => Remote<T>,
    idleRemote,
  );
  const loadRef = useRef(load);

  useEffect(() => {
    loadRef.current = load;
  });

  useEffect(() => {
    dispatch(key ? { type: "load", key } : { type: "clear" });
  }, [key]);

  const loadingKey = state.status === "loading" ? state.key : null;
  const attempt = state.status === "loading" ? state.attempt : -1;

  useEffect(() => {
    if (!loadingKey) return;
    let live = true;
    loadRef.current(loadingKey).then(
      (data) => {
        if (live) dispatch({ type: "ready", key: loadingKey, data });
      },
      () => {
        if (live) dispatch({ type: "fail", key: loadingKey });
      },
    );
    return () => {
      live = false;
    };
  }, [loadingKey, attempt]);

  const retry = useCallback(() => dispatch({ type: "retry" }), []);

  return {
    data: remoteData(state, key),
    failed:
      remoteFailed(state, key) ||
      (state.status === "ready" && state.key === key && state.data == null),
    retry,
  };
}
