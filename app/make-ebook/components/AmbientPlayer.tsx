"use client";
import { media } from "@/lib/media";
import { useEffect, useRef } from "react";
import type { AmbientSound } from "../hooks/useFocusMode";

interface AmbientPlayerProps {
  sound: AmbientSound;
  volume: number;
  active: boolean;
}

function buildPinkNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const duration = 45;
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(2, length, sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0;
    let peak = 0;

    for (let i = 0; i < length; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856;
      b4 = 0.55 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.016898;
      const s = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) / 7;
      b6 = w * 0.115926;
      data[i] = s;
      if (Math.abs(s) > peak) peak = Math.abs(s);
    }

    const norm = peak > 0 ? 0.7 / peak : 1;
    for (let i = 0; i < length; i++) data[i] *= norm;

    const fade = Math.floor(sampleRate * 2);
    for (let i = 0; i < fade; i++) {
      const t = i / fade;
      data[i] = data[i] * t + data[length - fade + i] * (1 - t);
    }
  }

  return buffer;
}

export function AmbientPlayer({ sound, volume, active }: AmbientPlayerProps) {
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!active || sound !== "pink-noise") {
      if (sourceRef.current) {
        try {
          sourceRef.current.stop();
        } catch {}
        sourceRef.current = null;
      }
      ctxRef.current?.close();
      ctxRef.current = null;
      return;
    }

    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const gain = ctx.createGain();
    gain.gain.value = volume * 0.18;
    gainRef.current = gain;
    gain.connect(ctx.destination);

    const buffer = buildPinkNoiseBuffer(ctx);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    src.connect(gain);
    src.start();
    sourceRef.current = src;

    return () => {
      try {
        src.stop();
      } catch {}
      gain.disconnect();
      ctx.close();
      ctxRef.current = null;
      gainRef.current = null;
      sourceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, sound]);

  useEffect(() => {
    if (gainRef.current && sound === "pink-noise") {
      gainRef.current.gain.value = volume * 0.18;
    }
  }, [volume, sound]);

  const fileSrc =
    sound === "rain-light"
      ? media("/audio/rain-light.mp3")
      : sound === "rain-medium"
        ? media("/audio/rain-medium.mp3")
        : sound === "waves"
          ? media("/audio/waves.mp3")
          : sound === "fire"
            ? media("/audio/fire.mp3")
            : sound === "train"
              ? media("/audio/train.mp3")
              : sound === "custom"
                ? "/audio/ambient-custom.mp3"
                : null;

  useEffect(() => {
    if (!fileSrc || !active) return;

    const audio = new Audio(fileSrc);
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    audio.play().catch(() => {
      // Autoplay blocked or file not found — fail silently
    });

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileSrc, active]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  return null;
}
