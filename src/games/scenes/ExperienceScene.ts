import Phaser from "phaser";
import { Spiderman } from "../objects/Spiderman";
import { Background } from "./Background";
import { ComicUI } from "../ui/ComicUI";
import { relayoutOnResize, type RelayoutData } from "../relayout";
import { INTERACT_KEY, PRESS_INTERACT } from "../controls";
import {
  COMIC_RED,
  COMIC_BLUE,
  COMIC_BLACK,
  COMIC_WHITE,
  CSS_RED,
  CSS_BLUE,
  CSS_YELLOW,
  FONT_HEADING,
  FONT_BODY,
  NARROW_WIDTH,
} from "../constants";
import { profile } from "../../content";

// Accent colours for the job cards, most recent first.
const CARD_ACCENTS = [
  { color: COMIC_RED, cssColor: CSS_RED },
  { color: COMIC_BLUE, cssColor: CSS_BLUE },
  { color: 0x555555, cssColor: "#555555" },
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

  create(data: RelayoutData = {}): void {
    new Background(this);
    if (!data.relayout) this.cameras.main.fadeIn(600, 0, 0, 0);

    this.descTexts = [];
    this.hintTexts = [];
    this.separators = [];
    this.cardCenters = [];
    this.activeIdx = -1;

    const { width, height } = this.scale;

    ComicUI.captionBar(this, COMIC_RED, "Experience", "The Career Arc");
    ComicUI.infoStrip(this, `← / →  Navigate  |  ${INTERACT_KEY}: Discover`);

    const numCards = profile.jobs.length;
    const gapBetween = 12;
    const cardW = Math.floor((width * 0.88 - gapBetween * (numCards - 1)) / numCards);
    const cardX0 = Math.floor((width - (cardW * numCards + gapBetween * (numCards - 1))) / 2);
    const cardY = height * 0.14;
    const narrow = width < NARROW_WIDTH;

    this.interactRange = cardW / 2 + 20;

    // Text flows down each card from measured heights (narrow cards wrap more),
    // then every card is drawn at the height of the tallest expanded one.
    const cards: { x: number; color: number }[] = [];
    let contentBottom = 0;

    profile.jobs.forEach(({ company, role, period, summary }, i) => {
      const num = String(i + 1).padStart(2, "0");
      const { color, cssColor } = CARD_ACCENTS[i % CARD_ACCENTS.length];
      const cx = cardX0 + i * (cardW + gapBetween);
      this.cardCenters.push(cx + cardW / 2);
      cards.push({ x: cx, color });

      const textX = cx + 18;
      const textW = cardW - 30;

      // Number badge
      this.add
        .text(cx + cardW - 10, cardY + 8, num, {
          fontFamily: FONT_HEADING,
          fontSize: "22px",
          color: "#dddddd",
          letterSpacing: 1,
        })
        .setOrigin(1, 0)
        .setDepth(6);

      // Company name (leaves room for the badge)
      const companyText = this.add
        .text(textX, cardY + 10, company.toUpperCase(), {
          fontFamily: FONT_HEADING,
          fontSize: "13px",
          color: cssColor,
          letterSpacing: 1,
          wordWrap: { width: cardW - 50 },
        })
        .setDepth(6);

      // Role
      const roleText = this.add
        .text(textX, companyText.y + companyText.height + 4, role, {
          fontFamily: FONT_BODY,
          fontSize: "11px",
          color: "#333333",
          wordWrap: { width: textW },
        })
        .setDepth(6);

      // Period
      const periodText = this.add
        .text(textX, roleText.y + roleText.height + 3, period, {
          fontFamily: FONT_BODY,
          fontSize: "10px",
          color: "#888888",
          wordWrap: { width: textW },
        })
        .setDepth(6);

      const detailY = periodText.y + periodText.height + 10;

      // Separator line (hidden initially, shown when expanded)
      const sep = this.add.graphics().setDepth(6).setVisible(false);
      sep.lineStyle(1, COMIC_BLACK, 0.25);
      sep.beginPath();
      sep.moveTo(cx + 12, detailY - 4);
      sep.lineTo(cx + cardW - 12, detailY - 4);
      sep.strokePath();
      this.separators.push(sep);

      // Interact hint
      const hint = this.add
        .text(cx + cardW / 2, detailY, narrow ? `▶ ${PRESS_INTERACT}` : `▶  ${PRESS_INTERACT} to discover`, {
          fontFamily: FONT_HEADING,
          fontSize: "10px",
          color: "#aaaaaa",
          letterSpacing: 1,
        })
        .setOrigin(0.5, 0)
        .setDepth(6);
      this.hintTexts.push(hint);

      // Description (hidden initially)
      const descText = this.add
        .text(textX, detailY, summary, {
          fontFamily: FONT_BODY,
          fontSize: "11px",
          color: "#222222",
          wordWrap: { width: textW },
          lineSpacing: 3,
        })
        .setVisible(false)
        .setDepth(6);
      this.descTexts.push(descText);

      contentBottom = Math.max(contentBottom, descText.y + descText.height);
    });

    const cardH = Math.max(110, contentBottom - cardY + 12);
    cards.forEach(({ x, color }) => {
      const gfx = this.add.graphics().setDepth(5);

      // Card background + border
      gfx.fillStyle(COMIC_WHITE, 1);
      gfx.fillRoundedRect(x, cardY, cardW, cardH, 6);
      gfx.lineStyle(3, COMIC_BLACK, 1);
      gfx.strokeRoundedRect(x, cardY, cardW, cardH, 6);

      // Left accent bar
      gfx.fillStyle(color, 1);
      gfx.fillRect(x + 2, cardY + 2, 6, cardH - 4);
    });

    // Comic action word
    this.add
      .text(width * 0.5, height * 0.65, "ZAP!", {
        fontFamily: FONT_HEADING,
        fontSize: "34px",
        color: CSS_YELLOW,
        letterSpacing: 2,
      })
      .setAngle(-8)
      .setStroke("#000000", 6)
      .setAlpha(0.35);

    this.spiderman = new Spiderman(this);
    this.spiderman.say(`Walk to a card & ${PRESS_INTERACT[0].toLowerCase()}${PRESS_INTERACT.slice(1)}!`);
    this.spiderman.playWarmup(data.heroX ?? width * 0.5);
    relayoutOnResize(this, () => this.spiderman.getX());

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
