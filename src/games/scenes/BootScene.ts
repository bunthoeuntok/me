import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
    const sprite = this.add.sprite(400, 300, "spiderman");
    sprite.play("run");
  }

  preload(): void {
    this.load.spritesheet("spiderman", "spiderman-spritesheet.png", {
      frameWidth: 1200,
      frameHeight: 480,
    });
  }

  created(): void {
    this.anims.create({
      key: "run",
      frames: this.anims.generateFrameNames("spiderman", {
        start: 0,
        end: 124,
      }),
      frameRate: 100,
      repeat: -1,
    });
  }
}
