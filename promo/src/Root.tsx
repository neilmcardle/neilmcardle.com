import { Composition } from "remotion";
import { DURATION, FPS, HEIGHT, WIDTH } from "./coverly/brand";
import { CoverlyFilm } from "./coverly/CoverlyFilm";
import * as History from "./history-of-ui/brand";
import { HistoryFilm } from "./history-of-ui/HistoryFilm";

export function Root() {
  return (
    <>
      <Composition
        id="CoverlyFilm"
        component={CoverlyFilm}
        durationInFrames={DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="HistoryOfUiFilm"
        component={HistoryFilm}
        durationInFrames={History.DURATION}
        fps={History.FPS}
        width={History.WIDTH}
        height={History.HEIGHT}
      />
    </>
  );
}
