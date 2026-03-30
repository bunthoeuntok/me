import Phaser from "phaser";
import { Spiderman } from "../objects/Spiderman";
import { Background } from "./Background";
import { ComicUI } from "../ui/ComicUI";
import { COMIC_RED, COMIC_BLACK, COMIC_WHITE } from "../constants";

const INTERACT_RANGE = 140;

const CONTACTS = [
  {
    icon: "✉",
    label: "bunthoeun.code@gmail.com",
    url: "",
  },
  {
    icon: "⬡",
    label: "github.com/bunthoeuntok",
    url: "https://github.com/bunthoeuntok",
  },
  {
    icon: "in",
    label: "LinkedIn — Bunthoeun Tok",
    url: "https://www.linkedin.com/in/bunthoeun-tok",
  },
];

export class ContactScene extends Phaser.Scene {
  private spiderman!: Spiderman;
  private cardCenters: number[] = [];

  constructor() {
    super({ key: "ContactScene" });
  }

  preload(): void {
    Spiderman.preload(this);
  }

  create(): void {
    new Background(this);

    this.cameras.main.fadeIn(600, 0, 0, 0);

    const { width, height } = this.scale;

    ComicUI.captionBar(this, COMIC_RED, "Contact", "Send a web");
    ComicUI.infoStrip(this, "← / →  |  I: Open link");

    // --- Contact cards (stacked vertically in centre) ---
    const cardW = width * 0.5;
    const cardH = 56;
    const cardGap = 14;
    const startY = height * 0.2;
    const cardX = (width - cardW) / 2;

    this.cardCenters = [];

    CONTACTS.forEach(({ icon, label }, i) => {
      const cy = startY + i * (cardH + cardGap);
      this.cardCenters.push(cardX + cardW / 2);

      const gfx = this.add.graphics();
      gfx.fillStyle(COMIC_WHITE, 1);
      gfx.fillRoundedRect(cardX, cy, cardW, cardH, 6);
      gfx.lineStyle(3, COMIC_BLACK, 1);
      gfx.strokeRoundedRect(cardX, cy, cardW, cardH, 6);

      // Icon
      this.add
        .text(cardX + 16, cy + cardH / 2, icon, {
          fontFamily: "Impact, Arial Black, sans-serif",
          fontSize: "20px",
          color: "#000000",
        })
        .setOrigin(0, 0.5);

      // Label
      this.add
        .text(cardX + 52, cy + cardH / 2, label, {
          fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive",
          fontSize: "13px",
          color: "#111111",
        })
        .setOrigin(0, 0.5);
    });

    // --- Spiderman ---
    this.spiderman = new Spiderman(this);
    this.spiderman.say("Let's work together!");
    this.spiderman.playWarmup(width * 0.78);

    this.spiderman.onInteract(() => {
      const spiderX = this.spiderman.getX();
      const idx = this.cardCenters.findIndex(
        (cx) => Math.abs(spiderX - cx) < INTERACT_RANGE,
      );
      if (idx >= 0 && CONTACTS[idx].url) {
        window.open(CONTACTS[idx].url, "_blank");
      }
    });

    this.spiderman.onLeftEdge(() => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("ProjectsScene");
      });
    });
  }

  update(_time: number, delta: number): void {
    this.spiderman.update(delta);
  }
}
