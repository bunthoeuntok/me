import Phaser from "phaser";
import { Spiderman } from "../objects/Spiderman";
import { Background } from "./Background";
import { ComicUI } from "../ui/ComicUI";
import {
  COMIC_RED,
  COMIC_BLUE,
  COMIC_BLACK,
  COMIC_WHITE,
  CSS_RED,
  CSS_BLUE,
  CSS_YELLOW,
} from "../constants";

const EXPERIENCES = [
  {
    num: "01",
    company: "TECHBODIA",
    role: "Full-stack Developer",
    period: "Mar 2023 – Present",
    desc: "ASP.NET MVC & .NET Core APIs, SQL Server optimization, GitLab CI/CD pipelines. Code reviews & stakeholder coordination.",
    color: COMIC_RED,
    cssColor: CSS_RED,
  },
  {
    num: "02",
    company: "WINTECH",
    role: "Web Developer",
    period: "2019 – 2022",
    desc: "Built school mgmt, POS & registration portals using PHP, Laravel & Vue.js. Created RESTful APIs for mobile apps.",
    color: COMIC_BLUE,
    cssColor: CSS_BLUE,
  },
  {
    num: "03",
    company: "BLUE TECHNOLOGY",
    role: "NAV Consultant",
    period: "Jan – Apr 2019",
    desc: "Customized Microsoft Dynamics NAV (ERP) for retail & distribution clients. Bridged business requirements and dev teams.",
    color: 0x555555,
    cssColor: "#555555",
  },
];

export class ExperienceScene extends Phaser.Scene {
  private spiderman!: Spiderman;
  private descTexts: Phaser.GameObjects.Text[] = [];
  private hintTexts: Phaser.GameObjects.Text[] = [];
  private separators: Phaser.GameObjects.Graphics[] = [];
  private cardCenters: number[] = [];
  private activeIdx = -1;
  private interactRange = 0;

  constructor() {
    super({ key: "ExperienceScene" });
  }

  preload(): void {
    Spiderman.preload(this);
  }

  create(): void {
    new Background(this);
    this.cameras.main.fadeIn(600, 0, 0, 0);

    this.descTexts = [];
    this.hintTexts = [];
    this.separators = [];
    this.cardCenters = [];
    this.activeIdx = -1;

    const { width, height } = this.scale;

    ComicUI.captionBar(this, COMIC_RED, "Experience", "The Career Arc");
    ComicUI.infoStrip(this, "← / →  Navigate  |  I: Discover");

    const numCards = EXPERIENCES.length;
    const gapBetween = 12;
    const cardW = Math.floor((width * 0.88 - gapBetween * (numCards - 1)) / numCards);
    const cardH = Math.min(Math.max(110, height * 0.27), 140);
    const cardX0 = Math.floor((width - (cardW * numCards + gapBetween * (numCards - 1))) / 2);
    const cardY = height * 0.14;

    this.interactRange = cardW / 2 + 20;

    EXPERIENCES.forEach(({ num, company, role, period, desc, color, cssColor }, i) => {
      const cx = cardX0 + i * (cardW + gapBetween);
      this.cardCenters.push(cx + cardW / 2);

      const gfx = this.add.graphics().setDepth(5);

      // Card background + border
      gfx.fillStyle(COMIC_WHITE, 1);
      gfx.fillRoundedRect(cx, cardY, cardW, cardH, 6);
      gfx.lineStyle(3, COMIC_BLACK, 1);
      gfx.strokeRoundedRect(cx, cardY, cardW, cardH, 6);

      // Left accent bar
      gfx.fillStyle(color, 1);
      gfx.fillRect(cx + 2, cardY + 2, 6, cardH - 4);

      const textX = cx + 18;

      // Number badge
      this.add
        .text(cx + cardW - 10, cardY + 8, num, {
          fontFamily: "Impact, Arial Black, sans-serif",
          fontSize: "22px",
          color: "#dddddd",
          letterSpacing: 1,
        })
        .setOrigin(1, 0)
        .setDepth(6);

      // Company name
      this.add
        .text(textX, cardY + 10, company, {
          fontFamily: "Impact, Arial Black, sans-serif",
          fontSize: "13px",
          color: cssColor,
          letterSpacing: 1,
          wordWrap: { width: cardW - 40 },
        })
        .setDepth(6);

      // Role
      this.add
        .text(textX, cardY + 30, role, {
          fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive",
          fontSize: "11px",
          color: "#333333",
        })
        .setDepth(6);

      // Period
      this.add
        .text(textX, cardY + 47, period, {
          fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive",
          fontSize: "10px",
          color: "#888888",
        })
        .setDepth(6);

      // Separator line (hidden initially, shown when expanded)
      const sep = this.add.graphics().setDepth(6).setVisible(false);
      sep.lineStyle(1, COMIC_BLACK, 0.25);
      sep.beginPath();
      sep.moveTo(cx + 12, cardY + 64);
      sep.lineTo(cx + cardW - 12, cardY + 64);
      sep.strokePath();
      this.separators.push(sep);

      // "Press I" hint
      const hint = this.add
        .text(cx + cardW / 2, cardY + 68, "▶  Press I to discover", {
          fontFamily: "Impact, Arial Black, sans-serif",
          fontSize: "10px",
          color: "#aaaaaa",
          letterSpacing: 1,
        })
        .setOrigin(0.5, 0)
        .setDepth(6);
      this.hintTexts.push(hint);

      // Description (hidden initially)
      const descText = this.add
        .text(textX, cardY + 68, desc, {
          fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive",
          fontSize: "11px",
          color: "#222222",
          wordWrap: { width: cardW - 30 },
          lineSpacing: 3,
        })
        .setVisible(false)
        .setDepth(6);
      this.descTexts.push(descText);
    });

    // Comic action word
    this.add
      .text(width * 0.5, height * 0.65, "ZAP!", {
        fontFamily: "Impact, Arial Black, sans-serif",
        fontSize: "34px",
        color: CSS_YELLOW,
        letterSpacing: 2,
      })
      .setAngle(-8)
      .setStroke("#000000", 6)
      .setAlpha(0.35);

    this.spiderman = new Spiderman(this);
    this.spiderman.say("Walk to a card & press I!");
    this.spiderman.playWarmup(width * 0.5);

    this.spiderman.onInteract(() => {
      const spiderX = this.spiderman.getX();
      const idx = this.cardCenters.findIndex(
        (cx) => Math.abs(spiderX - cx) < this.interactRange,
      );
      if (idx < 0) return;

      if (this.activeIdx === idx) {
        // Collapse
        this.descTexts[idx].setVisible(false);
        this.hintTexts[idx].setVisible(true);
        this.separators[idx].setVisible(false);
        this.activeIdx = -1;
      } else {
        // Collapse previously active
        if (this.activeIdx >= 0) {
          this.descTexts[this.activeIdx].setVisible(false);
          this.hintTexts[this.activeIdx].setVisible(true);
          this.separators[this.activeIdx].setVisible(false);
        }
        // Expand new
        this.descTexts[idx].setVisible(true);
        this.hintTexts[idx].setVisible(false);
        this.separators[idx].setVisible(true);
        this.activeIdx = idx;
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
        this.scene.start("ProjectsScene");
      });
    });
  }

  update(_time: number, delta: number): void {
    this.spiderman.update(delta);
  }
}
