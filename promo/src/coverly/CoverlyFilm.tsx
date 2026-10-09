import { AbsoluteFill, Sequence } from "remotion";
import "../fonts";
import { BEATS, COLOR } from "./brand";
import { Lockup, Spec } from "./ClosingBeats";
import { Dark, Wall } from "./OpeningBeats";
import { Deal, Views } from "./ProductBeats";
import { Save } from "./SaveBeat";
import { Soundtrack } from "./Soundtrack";

export function CoverlyFilm() {
  return (
    <AbsoluteFill style={{ background: COLOR.lightbox }}>
      <Soundtrack />
      <Sequence from={BEATS.dark.from} durationInFrames={BEATS.dark.duration}>
        <Dark />
      </Sequence>
      <Sequence from={BEATS.wall.from} durationInFrames={BEATS.wall.duration}>
        <Wall />
      </Sequence>
      <Sequence from={BEATS.deal.from} durationInFrames={BEATS.deal.duration}>
        <Deal />
      </Sequence>
      <Sequence from={BEATS.views.from} durationInFrames={BEATS.views.duration}>
        <Views />
      </Sequence>
      <Sequence from={BEATS.save.from} durationInFrames={BEATS.save.duration}>
        <Save />
      </Sequence>
      <Sequence from={BEATS.spec.from} durationInFrames={BEATS.spec.duration}>
        <Spec />
      </Sequence>
      <Sequence
        from={BEATS.lockup.from}
        durationInFrames={BEATS.lockup.duration}
      >
        <Lockup />
      </Sequence>
    </AbsoluteFill>
  );
}
