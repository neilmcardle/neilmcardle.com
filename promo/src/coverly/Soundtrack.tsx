import { getStaticFiles } from "@remotion/studio";
import { Audio, Sequence, interpolate, staticFile } from "remotion";
import { BEATS, DURATION, FPS } from "./brand";

type Cue = {
  at: number;
  file: string;
  volume: number | ((frame: number) => number);
  from?: number;
  to?: number;
};

const SAVE = BEATS.save.from;

const CUES: Cue[] = [
  { at: BEATS.wall.from, file: "audio/whoosh.mp3", volume: 0.18 },
  {
    at: BEATS.deal.from - 2,
    file: "audio/card-flick.mp3",
    volume: 0.45,
    from: 1.8,
    to: 2.1,
  },
  {
    at: BEATS.deal.from + 13,
    file: "audio/card-flick.mp3",
    volume: 0.4,
    from: 1.8,
    to: 2.1,
  },
  {
    at: BEATS.deal.from + 28,
    file: "audio/card-flick.mp3",
    volume: 0.4,
    from: 1.8,
    to: 2.1,
  },
  { at: BEATS.views.from + 55, file: "audio/tick-pop.mp3", volume: 0.3 },
  { at: BEATS.views.from + 105, file: "audio/tick-pop.mp3", volume: 0.3 },
  {
    at: SAVE - 2,
    file: "audio/card-flick.mp3",
    volume: 0.35,
    from: 1.8,
    to: 2.1,
  },
  { at: SAVE + 45, file: "audio/tick-pop.mp3", volume: 0.25 },
  { at: SAVE + 45, file: "audio/heart-beat.mp3", volume: 0.4 },
  { at: SAVE + 60, file: "audio/tick-pop.mp3", volume: 0.3 },
  { at: SAVE + 75, file: "audio/tick-pop.mp3", volume: 0.3 },
  { at: SAVE + 90, file: "audio/page-turn.mp3", volume: 0.3 },
  {
    at: BEATS.spec.from,
    file: "audio/counter.mp3",
    volume: (frame) =>
      interpolate(frame, [0, 12, 18], [0.5, 0.45, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
  },
];

function musicVolume(frame: number) {
  return (
    0.6 *
    interpolate(frame, [DURATION - 12, DURATION], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
}

export function Soundtrack() {
  const available = new Set(getStaticFiles().map((file) => file.name));
  return (
    <>
      {available.has("audio/music.mp3") ? (
        <Audio src={staticFile("audio/music.mp3")} volume={musicVolume} />
      ) : null}
      {CUES.filter((cue) => available.has(cue.file)).map((cue, index) => (
        <Sequence key={`${cue.file}-${index}`} from={cue.at} layout="none">
          <Audio
            src={staticFile(cue.file)}
            volume={cue.volume}
            trimBefore={cue.from ? Math.round(cue.from * FPS) : undefined}
            trimAfter={cue.to ? Math.round(cue.to * FPS) : undefined}
          />
        </Sequence>
      ))}
    </>
  );
}
