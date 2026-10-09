import { Composition } from "remotion";
import { DURATION, FPS, HEIGHT, WIDTH } from "./coverly/brand";
import { CoverlyFilm } from "./coverly/CoverlyFilm";

export function Root() {
  return (
    <Composition
      id="CoverlyFilm"
      component={CoverlyFilm}
      durationInFrames={DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
}
