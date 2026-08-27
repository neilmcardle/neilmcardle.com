"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useHydrated } from "@/lib/coverly/use-hydrated";
import { toggleSound, useSoundOn } from "@/lib/coverly/sound";

export function SoundToggle() {
  const on = useSoundOn();
  const hydrated = useHydrated();

  if (!hydrated) return null;

  return (
    <button
      onClick={toggleSound}
      aria-pressed={on}
      aria-label={on ? "Mute hover sound" : "Unmute hover sound"}
      title={on ? "Mute hover sound" : "Unmute hover sound"}
      className="flex h-8 w-8 items-center justify-center rounded-full border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      {on ? (
        <Volume2 className="h-4 w-4" strokeWidth={2} />
      ) : (
        <VolumeX className="h-4 w-4" strokeWidth={2} />
      )}
    </button>
  );
}
