import Phaser from "phaser";
import { Spiderman } from "../objects/Spiderman";
import { Background } from "./Background";
import { ComicUI } from "../ui/ComicUI";
import { COMIC_RED } from "../constants";

export class BootScene extends Phaser.Scene {
  private spiderman!: Spiderman;

  constructor() {
    super({ key: "BootScene" });
  }

  preload(): void {
    Spiderman.preload(this);
  }

  create(): void {
    new Background(this);

    ComicUI.captionBar(this, COMIC_RED, "Bunthoeun Tok", "Full-Stack Developer");
    ComicUI.infoStrip(this, "→  Walk right to continue");

    this.spiderman = new Spiderman(this);
    this.spiderman.playWarmup();
    this.spiderman.say("Your friendly neighborhood dev!");
    this.spiderman.onRightEdge(() => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("AboutMeScene");
      });
    });
  }

  update(_time: number, delta: number): void {
    this.spiderman.update(delta);
  }
}
