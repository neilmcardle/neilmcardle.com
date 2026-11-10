"use client";
import { useRef } from "react";
import {
  bookSwitch,
  initialBookSwitch,
  isCurrentSwitch,
} from "../state/bookSwitch";

interface UseBookSwitchParams {
  beforeSwitch: () => Promise<unknown>;
  editorSessionRef: React.MutableRefObject<number>;
}

export type SwitchBook = <T>(steps: {
  flush: boolean;
  prepare: () => Promise<T | null>;
  apply: (prepared: T) => void;
}) => Promise<boolean>;

export function useBookSwitch({
  beforeSwitch,
  editorSessionRef,
}: UseBookSwitchParams) {
  const stateRef = useRef(initialBookSwitch);

  function begin() {
    stateRef.current = bookSwitch(stateRef.current, { type: "begin" });
    return stateRef.current.token;
  }

  const switchBook: SwitchBook = async ({ flush, prepare, apply }) => {
    const token = begin();
    if (flush) await beforeSwitch();
    if (!isCurrentSwitch(stateRef.current, token)) return false;
    const prepared = await prepare();
    if (!isCurrentSwitch(stateRef.current, token)) return false;
    if (prepared === null) {
      stateRef.current = bookSwitch(stateRef.current, {
        type: "applied",
        token,
      });
      return false;
    }
    editorSessionRef.current += 1;
    apply(prepared);
    stateRef.current = bookSwitch(stateRef.current, { type: "applied", token });
    return true;
  };

  function cancelPendingSwitch() {
    const token = begin();
    stateRef.current = bookSwitch(stateRef.current, { type: "applied", token });
  }

  return { switchBook, cancelPendingSwitch };
}
