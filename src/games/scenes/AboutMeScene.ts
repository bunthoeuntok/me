import Phaser from "phaser";
import { Spiderman } from "../objects/Spiderman";
import { Background } from "./Background";
import { ComicUI } from "../ui/ComicUI";
import { COMIC_BLUE, COMIC_BLACK, COMIC_WHITE, CSS_RED, CSS_BLUE } from "../constants";

const BIO    = "Passionate developer crafting web experiences\nwith modern technologies and creative flair.";
const SKILLS = ["TypeScript", "React", "Node.js", "Phaser", "PostgreSQL", "Docker"];

export class AboutMeScene extends Phaser.Scene {
  private spiderman!: Spiderman;

  constructor() {
    super({ key: "AboutMeScene" });
  }

  preload(): void {
    Spiderman.preload(this);
  }

  create(): void {
    new Background(this);

    this.cameras.main.fadeIn(600, 0, 0, 0);

    const { width, height } = this.scale;

    ComicUI.captionBar(this, COMIC_BLUE, "About Me", "The Origin Story", "#ffffff");
    ComicUI.infoStrip(this, "← A  /  D →  |  I: Interact");

    // --- Bio card ---
    const cardX = width * 0.08;
    const cardY = height * 0.13;
    const cardW = width * 0.56;
    const cardH = height * 0.72;
    const gfx = this.add.graphics();

    gfx.fillStyle(COMIC_WHITE, 1);
    gfx.fillRoundedRect(cardX, cardY, cardW, cardH, 8);
    gfx.lineStyle(3, COMIC_BLACK, 1);
    gfx.strokeRoundedRect(cardX, cardY, cardW, cardH, 8);
    gfx.setDepth(5);

    // BIO label
    this.add
      .text(cardX + 16, cardY + 14, "BIO", {
        fontFamily: "Impact, Arial Black, sans-serif",
        fontSize: "14px",
        color: CSS_RED,
        letterSpacing: 3,
      })
      .setDepth(6);

    // Bio text
    this.add
      .text(cardX + 16, cardY + 36, BIO, {
        fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive",
        fontSize: "13px",
        color: "#222222",
        wordWrap: { width: cardW - 32 },
        lineSpacing: 4,
      })
      .setDepth(6);

    // SKILLS label
    this.add
      .text(cardX + 16, cardY + 108, "SKILLS", {
        fontFamily: "Impact, Arial Black, sans-serif",
        fontSize: "14px",
        color: CSS_BLUE,
        letterSpacing: 3,
      })
      .setDepth(6);

    // Skill chips
    const chipPadX   = 10;
    const chipPadY   = 5;
    const chipGap    = 8;
    const chipsPerRow = 3;
    const chipFont = {
      fontFamily: "Impact, Arial Black, sans-serif",
      fontSize: "12px",
      color: "#ffffff",
      letterSpacing: 1,
    };

    SKILLS.forEach((skill, i) => {
      const col = i % chipsPerRow;
      const row = Math.floor(i / chipsPerRow);

      const labelObj = this.add.text(0, 0, skill, chipFont).setVisible(false);
      const cw = labelObj.width + chipPadX * 2;
      const ch = labelObj.height + chipPadY * 2;
      labelObj.destroy();

      const colW = (cardW - 32) / chipsPerRow;
      const cx   = cardX + 16 + col * colW;
      const cy   = cardY + 136 + row * (ch + chipGap);

      const cg = this.add.graphics().setDepth(6);
      cg.fillStyle(0x003B8E, 1);
      cg.fillRect(cx, cy, cw, ch);
      cg.lineStyle(2.5, COMIC_BLACK, 1);
      cg.strokeRect(cx, cy, cw, ch);

      this.add
        .text(cx + chipPadX, cy + chipPadY, skill, chipFont)
        .setDepth(7);
    });

    // --- Spiderman ---
    this.spiderman = new Spiderman(this);
    this.spiderman.say("Press I to interact!");
    this.spiderman.playWarmup(width * 0.78);

    this.spiderman.onLeftEdge(() => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("BootScene");
      });
    });

    this.spiderman.onRightEdge(() => {
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
