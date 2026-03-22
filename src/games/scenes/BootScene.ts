import Phaser from "phaser";
import { Spiderman } from "../objects/Spiderman";
import { Background } from "./Background";

export class BootScene extends Phaser.Scene {
  private spiderman!: Spiderman;
  private nameText!: Phaser.GameObjects.Text;
  private subtitleText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "BootScene" });
  }

  preload(): void {
    Spiderman.preload(this);
  }

  create(): void {
    new Background(this);

    const { width, height } = this.scale;
    this.nameText = this.add
      .text(width / 2, height * 0.38, "Bunthoeun Tok", {
        fontSize: "52px",
        color: "#fff",
        fontFamily: "Orbitron, sans-serif",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.subtitleText = this.add
      .text(width / 2, height * 0.48, "Full-Stack Developer", {
        fontSize: "22px",
        color: "#8ec8f7",
        fontFamily: "Inter, sans-serif",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: this.nameText,
      alpha: 1,
      duration: 1000,
      delay: 600,
      ease: "Power2",
    });

    this.tweens.add({
      targets: this.subtitleText,
      alpha: 1,
      duration: 1000,
      delay: 600,
      ease: "Power2",
    });

    this.spiderman = new Spiderman(this);
    this.spiderman.playWarmup(120);
  }

  update(_time: number, delta: number): void {
    this.spiderman.update(delta);
  }
}
