import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    // Phase 1 has no asset preloads — placeholders are drawn at runtime.
    // Phase 2 will load the Kenney isometric sprites here.
  }

  create() {
    this.scene.start("GameScene");
  }
}
