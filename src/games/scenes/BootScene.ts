import Phaser from "phaser";
import { Spiderman } from "../objects/Spiderman";
import { Background } from "./Background";
import { ComicUI } from "../ui/ComicUI";
import { relayoutOnResize, type RelayoutData } from "../relayout";
import { COMIC_RED } from "../constants";
import { profile } from "../../content";

export class BootScene extends Phaser.Scene {
  private spiderman!: Spiderman;

  constructor() {
    super({ key: "BootScene" });
  }

  preload(): void {
    Spiderman.preload(this);
  }

  create(data: RelayoutData = {}): void {
    new Background(this);

    ComicUI.captionBar(this, COMIC_RED, profile.name, profile.title);
    ComicUI.infoStrip(this, "→  Walk right to continue");

    this.spiderman = new Spiderman(this);
    this.spiderman.playWarmup(data.heroX);
    relayoutOnResize(this, () => this.spiderman.getX());
    this.spiderman.say("Your friendly neighborhood dev!!");
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
