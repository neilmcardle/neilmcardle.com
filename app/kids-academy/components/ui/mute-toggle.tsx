"use client";

import { Volume2, VolumeX } from "lucide-react";
import { isMuted, setMuted, MUTE_EVENT } from "@/app/kids-academy/lib/sound";
import { eventStore, useBrowserStore } from "@/lib/hooks/browserStore";

const muteStore = eventStore<boolean | null>({
  events: [MUTE_EVENT],
  read: isMuted,
  server: null,
});

export function MuteToggle() {
  const stored = useBrowserStore(muteStore);
  const muted = stored ?? false;

  return (
    <button
      type="button"
      onClick={() => setMuted(!muted)}
      className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300 transition focus-visible:outline-2 focus-visible:outline-ka-brand-500"
      aria-label={muted ? "Turn sound on" : "Turn sound off"}
      aria-pressed={muted}
    >
      {stored === true ? (
        <VolumeX size={18} strokeWidth={2.25} />
      ) : (
        <Volume2 size={18} strokeWidth={2.25} />
      )}
    </button>
  );
}
