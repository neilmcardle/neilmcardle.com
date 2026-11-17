"use client";

import React, { useEffect, useReducer, type ComponentType } from "react";

export function lazySlot<P extends object>(
  load: () => Promise<{ default: ComponentType<P> }>,
) {
  let loading: Promise<unknown> | null = null;
  let loaded: ComponentType<P> | null = null;

  const preload = () => {
    loading ??= load().then((mod) => {
      loaded = mod.default;
    });
    return loading;
  };

  function Slot(props: P) {
    const [, refresh] = useReducer((n: number) => n + 1, 0);
    const Component = loaded;

    useEffect(() => {
      if (Component) return;
      let live = true;
      void preload().then(() => {
        if (live) refresh();
      });
      return () => {
        live = false;
      };
    }, [Component]);

    return Component ? <Component {...props} /> : null;
  }

  return { preload, Slot };
}
