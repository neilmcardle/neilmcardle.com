"use client";
import { useEffect } from "react";
import { setFocusEffect } from "../editor/registry";

export function useTypewriterMode(enabled: boolean) {
  useEffect(() => {
    setFocusEffect("typewriter", enabled);
    return () => setFocusEffect("typewriter", false);
  }, [enabled]);
}

export function useParagraphFocus(enabled: boolean) {
  useEffect(() => {
    setFocusEffect("paragraphFocus", enabled);
    return () => setFocusEffect("paragraphFocus", false);
  }, [enabled]);
}
