import Phaser from "phaser";
import { Spiderman } from "../objects/Spiderman";
import { Background } from "./Background";
import { ComicUI } from "../ui/ComicUI";
import { relayoutOnResize, type RelayoutData } from "../relayout";
import { INTERACT_KEY, PRESS_INTERACT } from "../controls";
import {
  COMIC_BLUE,
  COMIC_BLACK,
  COMIC_WHITE,
  CSS_RED,
  CSS_BLUE,
  FONT_HEADING,
  FONT_BODY,
  NARROW_WIDTH,
} from "../constants";
import { profile } from "../../content";


export class AboutMeScene extends Phaser.Scene {
  private spiderman!: Spiderman;

  constructor() {
    super({ key: "AboutMeScene" });
  }

  preload(): void {
    Spiderman.preload(this);
  }

  create(data: RelayoutData = {}): void {
    new Background(this);

    if (!data.relayout) this.cameras.main.fadeIn(600, 0, 0, 0);

    const { width, height } = this.scale;

    ComicUI.captionBar(
      this,
      COMIC_BLUE,
      "About Me",
      "The Origin Story",
      "#ffffff",
    );
    ComicUI.infoStrip(this, `← / →  |  ${INTERACT_KEY}: Interact`);

    // --- Bio card ---
    // Content flows top to bottom from measured text, so it fits portrait phones too.
    const narrow = width < NARROW_WIDTH;
    const cardX = width * (narrow ? 0.06 : 0.08);
    const cardY = height * 0.13;
    const cardW = width * (narrow ? 0.88 : 0.56);
    const pad = 16;
    const innerRight = cardX + cardW - pad;

    // BIO label
    const bioLabel = this.add
      .text(cardX + pad, cardY + 14, "BIO", {
        fontFamily: FONT_HEADING,
        fontSize: "14px",
        color: CSS_RED,
        letterSpacing: 3,
      })
      .setDepth(6);

    // Bio text
    const bio = this.add
      .text(cardX + pad, bioLabel.y + bioLabel.height + 6, profile.summary, {
        fontFamily: FONT_BODY,
        fontSize: "13px",
        color: "#222222",
        wordWrap: { width: cardW - pad * 2 },
        lineSpacing: 4,
      })
      .setDepth(6);

    // SKILLS label
    const skillsLabel = this.add
      .text(cardX + pad, bio.y + bio.height + 18, "SKILLS", {
        fontFamily: FONT_HEADING,
        fontSize: "14px",
        color: CSS_BLUE,
        letterSpacing: 3,
      })
      .setDepth(6);

    // Skill chips, wrapping onto new rows as needed
    const chipPadX = 10;
    const chipPadY = 5;
    const chipGap = 8;
    const chipFont = {
      fontFamily: FONT_HEADING,
      fontSize: "12px",
      color: "#ffffff",
      letterSpacing: 1,
    };

    let chipX = cardX + pad;
    let chipY = skillsLabel.y + skillsLabel.height + 10;
    let chipsBottom = chipY;
    profile.skills.forEach((skill) => {
      const label = this.add.text(0, 0, skill, chipFont).setDepth(7);
      const cw = label.width + chipPadX * 2;
      const ch = label.height + chipPadY * 2;
      if (chipX > cardX + pad && chipX + cw > innerRight) {
        chipX = cardX + pad;
        chipY += ch + chipGap;
      }
      label.setPosition(chipX + chipPadX, chipY + chipPadY);

      const cg = this.add.graphics().setDepth(6);
      cg.fillStyle(COMIC_BLUE, 1);
      cg.fillRect(chipX, chipY, cw, ch);
      cg.lineStyle(2.5, COMIC_BLACK, 1);
      cg.strokeRect(chipX, chipY, cw, ch);

      chipX += cw + chipGap;
      chipsBottom = chipY + ch;
    });

    // Card behind the content, tall enough for it
    const cardH = Math.max(height * 0.45, chipsBottom - cardY + pad);
    const gfx = this.add.graphics().setDepth(5);
    gfx.fillStyle(COMIC_WHITE, 1);
    gfx.fillRoundedRect(cardX, cardY, cardW, cardH, 8);
    gfx.lineStyle(3, COMIC_BLACK, 1);
    gfx.strokeRoundedRect(cardX, cardY, cardW, cardH, 8);

    // --- Spiderman ---
    this.spiderman = new Spiderman(this);
    this.spiderman.say(`${PRESS_INTERACT} to interact!`);
    this.spiderman.playWarmup(data.heroX ?? width * 0.78);
    relayoutOnResize(this, () => this.spiderman.getX());

    this.spiderman.onLeftEdge(() => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("BootScene");
      });
    });

    this.spiderman.onRightEdge(() => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("ExperienceScene");
      });
    });
  }

  update(_time: number, delta: number): void {
    this.spiderman.update(delta);
  }
}
