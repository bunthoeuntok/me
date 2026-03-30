import Phaser from "phaser";
import { Spiderman } from "../objects/Spiderman";
import { Background } from "./Background";
import { ComicUI } from "../ui/ComicUI";
import {
  COMIC_YELLOW,
  COMIC_RED,
  COMIC_BLUE,
  COMIC_BLACK,
  COMIC_WHITE,
  CSS_YELLOW,
} from "../constants";

const GITHUB_URL = "https://github.com/bunthoeuntok";

const PROJECT = {
  title: "REPORT BUILD",
  description:
    "Customize report layouts and generate\ndocuments with real data.",
};

const INTERACT_RANGE = 200;

export class ProjectsScene extends Phaser.Scene {
  private spiderman!: Spiderman;
  private cardX = 0;

  constructor() {
    super({ key: "ProjectsScene" });
  }

  preload(): void {
    Spiderman.preload(this);
  }

  create(): void {
    new Background(this);

    this.cameras.main.fadeIn(600, 0, 0, 0);

    const { width, height } = this.scale;

    ComicUI.captionBar(
      this,
      COMIC_YELLOW,
      "Projects",
      "Web-slinging some code",
      "#000000",
    );
    ComicUI.infoStrip(this, "← / →  |  I: View project");

    // --- Project card ---
    const cardW = width * 0.5;
    const cardH = height * 0.35;
    const cardX = (width - cardW) / 2;
    const cardY = height * 0.2;
    this.cardX = cardX + cardW / 2;

    const gfx = this.add.graphics();
    gfx.fillStyle(COMIC_WHITE, 1);
    gfx.fillRoundedRect(cardX, cardY, cardW, cardH, 8);
    gfx.lineStyle(4, COMIC_BLACK, 1);
    gfx.strokeRoundedRect(cardX, cardY, cardW, cardH, 8);

    // Card title
    this.add.text(cardX + 16, cardY + 16, PROJECT.title, {
      fontFamily: "Impact, Arial Black, sans-serif",
      fontSize: "22px",
      color: "#000000",
      letterSpacing: 2,
    });

    // Separator line
    gfx.lineStyle(2, COMIC_BLACK, 0.4);
    gfx.beginPath();
    gfx.moveTo(cardX + 16, cardY + 50);
    gfx.lineTo(cardX + cardW - 16, cardY + 50);
    gfx.strokePath();

    // Description
    this.add.text(cardX + 16, cardY + 60, PROJECT.description, {
      fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive",
      fontSize: "13px",
      color: "#333333",
      wordWrap: { width: cardW - 32 },
      lineSpacing: 4,
    });

    // GITHUB button
    this.addButton(
      cardX + 16,
      cardY + cardH - 44,
      120,
      28,
      "GITHUB",
      COMIC_BLUE,
      "#ffffff",
    );

    // LIVE button (placeholder — no live URL yet)
    this.addButton(
      cardX + 148,
      cardY + cardH - 44,
      80,
      28,
      "LIVE",
      COMIC_RED,
      "#ffffff",
    );

    // POW! action word decoration
    this.add
      .text(width * 0.82, height * 0.18, "POW!", {
        fontFamily: "Impact, Arial Black, sans-serif",
        fontSize: "38px",
        color: CSS_YELLOW,
        letterSpacing: 2,
      })
      .setAngle(-12)
      .setStroke("#000000", 6);

    // --- Spiderman ---
    this.spiderman = new Spiderman(this);
    this.spiderman.say("Press I to view!");
    this.spiderman.playWarmup(width * 0.75);

    this.spiderman.onInteract(() => {
      if (Math.abs(this.spiderman.getX() - this.cardX) < INTERACT_RANGE) {
        window.open(GITHUB_URL, "_blank");
      }
    });

    this.spiderman.onLeftEdge(() => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("AboutMeScene");
      });
    });

    this.spiderman.onRightEdge(() => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("ContactScene");
      });
    });
  }

  private addButton(
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    bgColor: number,
    textColor: string,
  ): void {
    const gfx = this.add.graphics();
    gfx.fillStyle(bgColor, 1);
    gfx.fillRect(x, y, w, h);
    gfx.lineStyle(2.5, COMIC_BLACK, 1);
    gfx.strokeRect(x, y, w, h);

    this.add
      .text(x + w / 2, y + h / 2, label, {
        fontFamily: "Impact, Arial Black, sans-serif",
        fontSize: "12px",
        color: textColor,
        letterSpacing: 1,
      })
      .setOrigin(0.5);
  }

  update(_time: number, delta: number): void {
    this.spiderman.update(delta);
  }
}
