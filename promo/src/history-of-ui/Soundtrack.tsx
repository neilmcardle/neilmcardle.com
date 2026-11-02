import { Audio, Sequence, staticFile } from "remotion";
import { FPS, LOCKUP_FROM, SHOTS, STARTS } from "./brand";

const LEVEL: Record<string, number> = {
  zap: 0.7,
  keyset: 0.7,
  teletype: 0.55,
  plasma: 0.5,
  beep: 0.45,
  modem: 0.5,
  ding: 0.7,
  scratch: 0.6,
  pop: 0.7,
  whoosh: 0.6,
  ping: 0.6,
  unlock: 0.8,
  glass: 0.8,
  chime: 0.7,
  stream: 0.6,
  confirm: 0.75,
};

export function Soundtrack() {
  return (
    <>
      {SHOTS.map((shot, i) => (
        <Sequence
          key={shot.id}
          from={STARTS[i] + Math.round(shot.sfxAt * FPS)}
          durationInFrames={FPS * 2}
        >
          <Audio
            src={staticFile(`history-of-ui/sfx/${shot.sfx}.wav`)}
            volume={LEVEL[shot.sfx] ?? 0.6}
          />
        </Sequence>
      ))}
      <Sequence from={LOCKUP_FROM} durationInFrames={FPS * 3}>
        <Audio src={staticFile("history-of-ui/sfx/hit.wav")} volume={0.9} />
      </Sequence>
    </>
  );
}
