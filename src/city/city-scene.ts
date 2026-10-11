import Phaser from "phaser";
import { profile } from "../content";
import { Controls, usesTouch } from "../games/controls";
import { onSettledResize } from "../games/relayout";
import { ComicUI } from "../games/ui/ComicUI";
import {
  COMIC_BLACK,
  COMIC_BLUE,
  COMIC_NIGHT,
  COMIC_RED,
  COMIC_YELLOW,
  CSS_YELLOW,
  FONT_HEADING,
} from "../games/constants";
import {
  createCity,
  districtAt,
  layout,
  relayout,
  step,
  type City,
  type DistrictId,
} from "./city-model";

/** How each District introduces itself in the caption bar. */
const DISTRICT_CAPTIONS: Record<DistrictId, { title: string; subtitle: string; color: number; subtitleCss: string }> = {
  intro: { title: profile.name, subtitle: profile.title, color: COMIC_RED, subtitleCss: CSS_YELLOW },
  about: { title: "About Me", subtitle: "The Origin Story", color: COMIC_BLUE, subtitleCss: "#ffffff" },
  experience: { title: "Experience", subtitle: "The Career Arc", color: COMIC_RED, subtitleCss: CSS_YELLOW },
  projects: { title: "Projects", subtitle: "Web-slinging some code", color: COMIC_YELLOW, subtitleCss: "#000000" },
  contact: { title: "Contact", subtitle: "Send a web", color: COMIC_RED, subtitleCss: CSS_YELLOW },
};

/** Screen height taken by the on-screen buttons and the info strip under them. */
const TOUCH_CONTROLS_HEIGHT = 100;

interface CitySceneData {
  /** The City as it was before a resize rebuilt the scene. */
  city?: City;
}

/** One continuous street of Districts; draws the City model and feeds it the Visitor's input. */
export class CityScene extends Phaser.Scene {
  private city!: City;
  private controls!: Controls;
  private hero!: Phaser.GameObjects.Container;
  private caption: Phaser.GameObjects.GameObject[] = [];
  private captionFor: DistrictId | null = null;

  constructor() {
    super({ key: "CityScene" });
  }

  create(data: CitySceneData = {}): void {
    const { width, height } = this.scale;
    const cityLayout = layout({ width, height, controlsHeight: usesTouch ? TOUCH_CONTROLS_HEIGHT : 0 }, profile);
    this.city = data.city ? relayout(data.city, cityLayout) : createCity(cityLayout);
    this.controls = new Controls(this);
    this.caption = [];
    this.captionFor = null;

    this.drawStreet();
    this.hero = drawPlaceholderHero(this);
    this.syncHero();

    const camera = this.cameras.main;
    camera.setBounds(0, 0, cityLayout.streetLength, height);
    camera.startFollow(this.hero, true, 0.12, 0.12);

    ComicUI.infoStrip(this, "← / →  Walk the city");
    this.updateCaption();

    onSettledResize(this, () => this.scene.restart({ city: this.city } satisfies CitySceneData));
  }

  update(_time: number, delta: number): void {
    this.city = step(
      this.city,
      { left: this.controls.isDown("left"), right: this.controls.isDown("right") },
      delta,
    );
    this.syncHero();
    this.updateCaption();
  }

  private syncHero(): void {
    const { hero, layout: cityLayout } = this.city;
    this.hero.setPosition(hero.x, cityLayout.groundY);
    this.hero.setScale(hero.facing === "left" ? -1 : 1, 1);
    // A little bounce in the step while walking.
    this.hero.y -= hero.walking ? Math.abs(Math.sin(this.time.now / 90)) * 4 : 0;
  }

  private updateCaption(): void {
    const here = districtAt(this.city);
    if (here.id === this.captionFor) return;

    this.captionFor = here.id;
    this.caption.forEach((part) => part.destroy());
    const { title, subtitle, color, subtitleCss } = DISTRICT_CAPTIONS[here.id];
    this.caption = ComicUI.captionBar(this, color, title, subtitle, subtitleCss);
  }

  private drawStreet(): void {
    const { streetLength, groundY, districts } = this.city.layout;
    const { height } = this.scale;

    // Sky
    this.add.rectangle(0, 0, streetLength, height, COMIC_NIGHT).setOrigin(0, 0);

    // Skyline: the same buildings every time (seeded), so a resize doesn't reshuffle the city.
    const random = seededRandom(7);
    const skyline = this.add.graphics();
    for (let x = -20; x < streetLength; ) {
      const w = 60 + random() * 70;
      const h = 140 + random() * 220;
      const top = groundY - h;
      skyline.fillStyle(0x0a0a1a, 1).fillRect(x, top, w, h);
      skyline.lineStyle(3, COMIC_BLACK, 1).strokeRect(x, top, w, h);
      skyline.fillStyle(COMIC_YELLOW, 1);
      for (let wy = top + 14; wy < groundY - 16; wy += 22) {
        for (let wx = x + 10; wx < x + w - 12; wx += 18) {
          if (random() < 0.55) skyline.fillRect(wx, wy, 6, 8);
        }
      }
      x += w - 6 + random() * 24;
    }

    // Street
    const road = this.add.graphics();
    road.fillStyle(0x1a1a1a, 1).fillRect(0, groundY, streetLength, height - groundY);
    road.lineStyle(4, COMIC_BLACK, 1).lineBetween(0, groundY, streetLength, groundY);
    road.fillStyle(COMIC_YELLOW, 1);
    for (let x = 0; x < streetLength; x += 70) road.fillRect(x, groundY + 24, 40, 4);

    // A sign post where each District begins
    for (const district of districts) {
      const { title } = DISTRICT_CAPTIONS[district.id];
      const x = district.start + 40;
      this.add.rectangle(x + 4, groundY - 70, 6, 140, 0x555555).setOrigin(0.5, 0);
      this.add
        .text(x, groundY - 150, title.toUpperCase(), {
          fontFamily: FONT_HEADING,
          fontSize: "20px",
          color: "#000000",
          backgroundColor: CSS_YELLOW,
          padding: { x: 10, y: 4 },
          letterSpacing: 2,
        })
        .setOrigin(0, 0.5)
        .setStroke("#000000", 0);
    }
  }
}

/** A stand-in Hero drawn in code until the real art arrives (ADR 0001). Feet at (0, 0). */
function drawPlaceholderHero(scene: Phaser.Scene): Phaser.GameObjects.Container {
  const body = scene.add.graphics();
  body.lineStyle(3, COMIC_BLACK, 1);
  // legs
  body.fillStyle(COMIC_BLUE, 1).fillRect(-12, -40, 10, 40).strokeRect(-12, -40, 10, 40);
  body.fillRect(2, -40, 10, 40).strokeRect(2, -40, 10, 40);
  // torso
  body.fillStyle(COMIC_RED, 1).fillRoundedRect(-16, -82, 32, 46, 6).strokeRoundedRect(-16, -82, 32, 46, 6);
  // head with eye lenses facing right
  body.fillStyle(COMIC_RED, 1).fillCircle(0, -98, 16).strokeCircle(0, -98, 16);
  body.fillStyle(0xffffff, 1).fillEllipse(8, -100, 9, 6);
  return scene.add.container(0, 0, [body]).setDepth(10);
}

/** Small deterministic PRNG (mulberry32). */
function seededRandom(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
