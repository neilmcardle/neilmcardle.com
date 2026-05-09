import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { GameScene } from "./scenes/GameScene";

export function createGameConfig(parent: HTMLDivElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    backgroundColor: "#f8f8f7",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1280,
      height: 800,
    },
    render: {
      antialias: true,
      pixelArt: false,
    },
    // 30fps halves CPU vs the default 60. Bumps back up if the day-night
    // cycle in Phase 5 needs smoother colour transitions.
    fps: { target: 30, forceSetTimeOut: false },
    // No audio in Phase 1, so don't initialise the Web Audio context.
    // Phase 6 flips this off.
    audio: { noAudio: true },
    banner: false,
    scene: [BootScene, GameScene],
  };
}
