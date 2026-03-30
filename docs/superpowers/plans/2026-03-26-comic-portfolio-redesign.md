# Comic Book Portfolio Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the 2D Phaser.js portfolio as a Comic Book Action experience using the Classic Spiderman palette across all 4 scenes.

**Architecture:** A shared `ComicUI` helper provides Phaser drawing primitives (caption bar, speech bubble, info strip). Background, Buildings, and Road are each updated in-place for comic styling. Two new scenes (ProjectsScene, ContactScene) follow the same pattern as existing scenes. The React wrapper gains CSS for the paper-page frame.

**Tech Stack:** Phaser 3, TypeScript, React, Vite

---

## File Map

| Action | File                                  | Responsibility                                      |
| ------ | ------------------------------------- | --------------------------------------------------- |
| Modify | `src/games/constants.ts`              | Add comic colour constants (int + hex string)       |
| Create | `src/games/ui/ComicUI.ts`             | Static helpers: captionBar, speechBubble, infoStrip |
| Modify | `src/games/scenes/Background.ts`      | Halftone sky rect + tile sprite                     |
| Modify | `src/games/objects/Buildings.ts`      | Black outline per building, yellow windows          |
| Modify | `src/games/objects/Road.ts`           | Black top border line                               |
| Modify | `src/games/objects/Spiderman.ts`      | Always-visible speech bubble, onInteract, getX      |
| Modify | `src/components/phaser-container.tsx` | Paper bg + thick comic border + dog-ear CSS         |
| Modify | `src/style.css`                       | Comic page layout styles                            |
| Modify | `src/games/scenes/BootScene.ts`       | Comic caption bar, remove old text objects          |
| Modify | `src/games/scenes/AboutMeScene.ts`    | Comic caption bar, restyled bio card + skill chips  |
| Create | `src/games/scenes/ProjectsScene.ts`   | Projects scene with project card + I-key link       |
| Create | `src/games/scenes/ContactScene.ts`    | Contact scene with 3 cards + proximity I-key        |
| Modify | `src/games/index.ts`                  | Register ProjectsScene + ContactScene               |

---

## Task 1: Add Comic Colour Constants

**Files:**

- Modify: `src/games/constants.ts`

- [ ] **Step 1: Add constants**

Replace the entire file content:

```typescript
// Road
export const ROAD_H = 60;

// Comic palette — integer form for Phaser graphics
export const COMIC_RED = 0xe23636;
export const COMIC_BLUE = 0x003b8e;
export const COMIC_YELLOW = 0xffd700;
export const COMIC_BLACK = 0x000000;
export const COMIC_WHITE = 0xffffff;
export const COMIC_NIGHT = 0x0d1b4b;

// CSS hex strings for Phaser text / HTML
export const CSS_RED = "#E23636";
export const CSS_BLUE = "#003B8E";
export const CSS_YELLOW = "#FFD700";
export const CSS_PAPER = "#f0ece4";
export const CSS_NIGHT = "#0d1b4b";
```

- [ ] **Step 2: Type-check**

```bash
cd /Volumes/DATA/my-projects/2d-portfolio && npx tsc --noEmit
```

Expected: no output (no errors).

- [ ] **Step 3: Commit**

```bash
git add src/games/constants.ts
git commit -m "feat: add comic colour constants"
```

---

## Task 2: Create ComicUI Helper

**Files:**

- Create: `src/games/ui/ComicUI.ts`

- [ ] **Step 1: Create the file**

```typescript
import Phaser from "phaser";
import { COMIC_BLACK, COMIC_WHITE, CSS_YELLOW } from "../constants";

const CAPTION_FONT = "Impact, Arial Black, sans-serif";
const BUBBLE_FONT = "'Comic Sans MS', 'Chalkboard SE', cursive";

export class ComicUI {
  /**
   * Draws a full-width caption bar at the top of the canvas.
   * @param bgColor  Phaser integer colour (e.g. COMIC_RED)
   * @param line1    Main label (large)
   * @param line2    Subtitle label (small) — pass '' to omit
   * @param subtitleCss  CSS colour string for line2, defaults to '#FFD700'
   */
  static captionBar(
    scene: Phaser.Scene,
    bgColor: number,
    line1: string,
    line2: string,
    subtitleCss = CSS_YELLOW,
  ): void {
    const { width } = scene.scale;
    const barH = line2 ? 52 : 36;

    const gfx = scene.add.graphics();
    gfx.fillStyle(bgColor);
    gfx.fillRect(0, 0, width, barH);
    gfx.lineStyle(4, COMIC_BLACK, 1);
    gfx.strokeRect(0, 0, width, barH);
    gfx.setDepth(20);

    scene.add
      .text(width / 2, line2 ? 10 : 10, line1.toUpperCase(), {
        fontFamily: CAPTION_FONT,
        fontSize: "20px",
        color: "#ffffff",
        letterSpacing: 3,
      })
      .setOrigin(0.5, 0)
      .setDepth(21);

    if (line2) {
      scene.add
        .text(width / 2, 32, line2.toUpperCase(), {
          fontFamily: CAPTION_FONT,
          fontSize: "11px",
          color: subtitleCss,
          letterSpacing: 3,
        })
        .setOrigin(0.5, 0)
        .setDepth(21);
    }
  }

  /**
   * Creates an always-visible speech bubble container.
   * Call `.setPosition(x, y)` on the returned Container to move it.
   * The tail points downward from the bottom-left of the bubble.
   */
  static speechBubble(
    scene: Phaser.Scene,
    message: string,
  ): Phaser.GameObjects.Container {
    const pad = 10;
    const r = 12; // border-radius
    const tail = 10; // tail height

    // Measure text first to size the bubble
    const tmp = scene.add
      .text(0, 0, message, {
        fontFamily: BUBBLE_FONT,
        fontSize: "12px",
        color: "#000000",
      })
      .setVisible(false);
    const tw = tmp.width + pad * 2;
    const th = tmp.height + pad * 2;
    tmp.destroy();

    const gfx = scene.add.graphics();

    // Fill
    gfx.fillStyle(COMIC_WHITE, 1);
    gfx.fillRoundedRect(0, 0, tw, th, r);

    // Tail (filled triangle, down-left)
    gfx.fillTriangle(14, th, 28, th, 14, th + tail);

    // Outline
    gfx.lineStyle(3, COMIC_BLACK, 1);
    gfx.strokeRoundedRect(0, 0, tw, th, r);
    // Tail outline (two lines only — sides of triangle)
    gfx.beginPath();
    gfx.moveTo(14, th);
    gfx.lineTo(14, th + tail);
    gfx.lineTo(28, th);
    gfx.strokePath();

    const label = scene.add.text(pad, pad, message, {
      fontFamily: BUBBLE_FONT,
      fontSize: "12px",
      color: "#000000",
    });

    const container = scene.add.container(0, 0, [gfx, label]);
    container.setDepth(15);
    return container;
  }

  /**
   * Draws a full-width info strip at the bottom of the canvas.
   * Shows keyboard hints for this scene.
   */
  static infoStrip(scene: Phaser.Scene, hint: string): void {
    const { width, height } = scene.scale;
    const stripH = 28;
    const y = height - stripH;

    const gfx = scene.add.graphics();
    gfx.fillStyle(COMIC_WHITE, 1);
    gfx.fillRect(0, y, width, stripH);
    gfx.lineStyle(3, COMIC_BLACK, 1);
    gfx.strokeRect(0, y, width, stripH);
    gfx.setDepth(20);

    scene.add
      .text(width / 2, y + 14, hint.toUpperCase(), {
        fontFamily: CAPTION_FONT,
        fontSize: "11px",
        color: "#000000",
        letterSpacing: 2,
      })
      .setOrigin(0.5)
      .setDepth(21);
  }
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/games/ui/ComicUI.ts
git commit -m "feat: add ComicUI static helper (captionBar, speechBubble, infoStrip)"
```

---

## Task 3: Halftone Sky in Background

**Files:**

- Modify: `src/games/scenes/Background.ts`

- [ ] **Step 1: Add sky + halftone before buildings**

Replace the `Background` constructor body — add sky rect and halftone tileSprite at the very beginning, before `new Buildings(scene)`:

```typescript
import Phaser from "phaser";
import { Buildings } from "../objects/Buildings";
import { Road } from "../objects/Road";
import { Car } from "../objects/Car";
import { ROAD_H, COMIC_NIGHT } from "../constants";

export class Background {
  constructor(scene: Phaser.Scene) {
    const { width, height } = scene.scale;

    // --- Sky ---
    const skyH = height - ROAD_H;
    const gfxSky = scene.add.graphics();
    gfxSky.fillStyle(COMIC_NIGHT);
    gfxSky.fillRect(0, 0, width, skyH);

    // Halftone dot overlay
    const dotKey = 'halftone-dot';
    if (!scene.textures.exists(dotKey)) {
      const canvas = scene.textures.createCanvas(dotKey, 6, 6)!;
      const ctx = canvas.getContext();
      ctx.clearRect(0, 0, 6, 6);
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.beginPath();
      ctx.arc(3, 3, 1, 0, Math.PI * 2);
      ctx.fill();
      canvas.refresh();
    }
    scene.add.tileSprite(0, 0, width, skyH, dotKey).setOrigin(0, 0);

    new Buildings(scene);
    new Road(scene);
    this.spawnCars(scene, width, height);
    this.drawSpiderWeb(scene, 0, 0, "left");
    this.drawSpiderWeb(scene, width, 0, "right");
  }

  // ... keep spawnCars and drawSpiderWeb unchanged ...
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 3: Start dev server and verify sky visually**

```bash
npm run dev
```

Open browser. The sky should be dark blue (`#0d1b4b`) with a subtle halftone dot grid overlay. Buildings and road should still appear.

- [ ] **Step 4: Commit**

```bash
git add src/games/scenes/Background.ts
git commit -m "feat: halftone sky in Background (night blue + dot tile)"
```

---

## Task 4: Comic Building Outlines

**Files:**

- Modify: `src/games/objects/Buildings.ts`

- [ ] **Step 1: Add black outlines and yellow windows**

Replace the entire file:

```typescript
import Phaser from "phaser";
import { COMIC_BLACK, COMIC_YELLOW } from "../constants";

export class Buildings {
  constructor(scene: Phaser.Scene) {
    const { width, height } = scene.scale;
    const gfx = scene.add.graphics();
    const groundY = height;

    const buildings = [
      { x: 0, w: 90, h: 260 },
      { x: 80, w: 60, h: 200 },
      { x: 130, w: 110, h: 320 },
      { x: 220, w: 70, h: 230 },
      { x: 280, w: 80, h: 280 },
      { x: 350, w: 50, h: 180 },
      { x: width - 400, w: 60, h: 200 },
      { x: width - 350, w: 90, h: 290 },
      { x: width - 270, w: 70, h: 240 },
      { x: width - 210, w: 100, h: 330 },
      { x: width - 120, w: 60, h: 210 },
      { x: width - 70, w: 80, h: 260 },
    ];

    buildings.forEach(({ x, w, h }) => {
      // Building fill
      gfx.fillStyle(0x0a0a1a);
      gfx.fillRect(x, groundY - h, w, h);

      // Black outline
      gfx.lineStyle(3, COMIC_BLACK, 1);
      gfx.strokeRect(x, groundY - h, w, h);

      // Window grid — yellow with black border
      const winW = 6;
      const winH = 8;
      const cols = Math.floor((w - 10) / 14);
      const rows = Math.floor((h - 20) / 18);
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (Math.random() > 0.55) {
            const wx = x + 8 + col * 14;
            const wy = groundY - h + 16 + row * 18;
            gfx.fillStyle(COMIC_YELLOW, 0.85);
            gfx.fillRect(wx, wy, winW, winH);
            gfx.lineStyle(1.5, COMIC_BLACK, 1);
            gfx.strokeRect(wx, wy, winW, winH);
          }
        }
      }
    });
  }
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 3: Visual check in browser**

Buildings should have thick black outlines. Lit windows should be yellow with thin black borders. Shadow layer removed (no longer needed with outlines).

- [ ] **Step 4: Commit**

```bash
git add src/games/objects/Buildings.ts
git commit -m "feat: comic building outlines and yellow windows"
```

---

## Task 5: Comic Road Border

**Files:**

- Modify: `src/games/objects/Road.ts`

- [ ] **Step 1: Add black top border to road**

Replace the entire file:

```typescript
import Phaser from "phaser";
import { ROAD_H, COMIC_BLACK } from "../constants";

export class Road {
  constructor(scene: Phaser.Scene) {
    const { width, height } = scene.scale;
    const gfx = scene.add.graphics();
    const roadY = height - ROAD_H;

    // Road surface
    gfx.fillStyle(0x1a1a1a);
    gfx.fillRect(0, roadY, width, ROAD_H);

    // Black top border
    gfx.lineStyle(4, COMIC_BLACK, 1);
    gfx.beginPath();
    gfx.moveTo(0, roadY);
    gfx.lineTo(width, roadY);
    gfx.strokePath();

    // Centre dashed line — yellow
    const dashW = 40;
    const gapW = 30;
    const lineY = roadY + ROAD_H / 2 - 2;
    for (let x = 0; x < width; x += dashW + gapW) {
      gfx.fillStyle(0xffd700, 0.85);
      gfx.fillRect(x, lineY, dashW, 4);
    }
  }
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/games/objects/Road.ts
git commit -m "feat: comic road with black top border"
```

---

## Task 6: Spiderman — Speech Bubble + onInteract + getX

**Files:**

- Modify: `src/games/objects/Spiderman.ts`

The tooltip toggle system is replaced with an always-visible ComicUI speech bubble. An `onInteract` callback replaces the tooltip toggle on I. A `getX()` getter is added for proximity detection in ContactScene.

- [ ] **Step 1: Replace Spiderman.ts**

```typescript
import Phaser from "phaser";
import { ComicUI } from "../ui/ComicUI";

const SCALE = 0.3;
const FRAME_RATE = 12;
const SPEED = 500;
const BODY_HW = 30;

// Measured from spritesheet: visual character travels ~176px across wallCrawl.
// User-tuned to 300 with progress capped at 0.6 for best visual feel.
const WALL_CRAWL_X_SHIFT = 300;

const ANIMS = {
  warmup: { start: 0, end: 34, repeat: -1 },
  run: { start: 35, end: 58, repeat: -1 },
  jump: { start: 59, end: 80, repeat: 0 },
  land: { start: 65, end: 80, repeat: 0 },
  wallCrawl: { start: 102, end: 124, repeat: 0 },
} as const;

type AnimKey = keyof typeof ANIMS;

export class Spiderman {
  private sprite: Phaser.GameObjects.Sprite;
  private scene: Phaser.Scene;
  private keys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    interact: Phaser.Input.Keyboard.Key;
  };
  private bubble: Phaser.GameObjects.Container | null = null;
  private onRightEdgeCb?: () => void;
  private rightEdgeFired = false;
  private onLeftEdgeCb?: () => void;
  private leftEdgeFired = false;
  private onInteractCb?: () => void;
  private wallCrawlActive = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const { height } = scene.scale;

    this.sprite = scene.add.sprite(-100, height, "spiderman");
    this.sprite.setScale(SCALE);

    const kb = scene.input.keyboard!;
    this.keys = {
      up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      interact: kb.addKey(Phaser.Input.Keyboard.KeyCodes.I),
    };

    this.registerAnims();
  }

  update(delta: number): void {
    const speed = (SPEED * delta) / 1000;
    let dx = 0;

    if (this.keys.left.isDown) dx -= speed;
    if (this.keys.right.isDown) dx += speed;

    const { width } = this.scene.scale;

    this.sprite.x = Phaser.Math.Clamp(
      this.sprite.x + dx,
      BODY_HW,
      width - BODY_HW,
    );

    // Right edge
    if (
      !this.rightEdgeFired &&
      this.sprite.x >= width - BODY_HW &&
      this.onRightEdgeCb
    ) {
      this.rightEdgeFired = true;
      this.onRightEdgeCb();
    } else if (this.rightEdgeFired && this.sprite.x < width - BODY_HW) {
      this.rightEdgeFired = false;
    }

    // Left edge
    if (!this.leftEdgeFired && this.sprite.x <= BODY_HW && this.onLeftEdgeCb) {
      this.leftEdgeFired = true;
      this.onLeftEdgeCb();
    } else if (this.leftEdgeFired && this.sprite.x > BODY_HW) {
      this.leftEdgeFired = false;
    }

    // Interact
    if (Phaser.Input.Keyboard.JustDown(this.keys.interact)) {
      this.onInteractCb?.();
    }

    this.syncBubble();

    const currentAnim = this.sprite.anims.currentAnim?.key;

    if (this.keys.up.isDown) {
      if (!this.wallCrawlActive) this.playWallCrawl();
    } else {
      if (this.wallCrawlActive) {
        const progress = Math.min(this.sprite.anims.getProgress(), 0.6);
        const dir = this.sprite.flipX ? -1 : 1;
        this.sprite.x += dir * Math.round(WALL_CRAWL_X_SHIFT * progress);
        this.wallCrawlActive = false;
      }

      if (this.keys.down.isDown) {
        if (currentAnim !== "jump") this.sprite.play("jump");
      } else if (dx < 0) {
        this.sprite.setFlipX(true);
        if (currentAnim !== "run") this.sprite.play("run");
      } else if (dx > 0) {
        this.sprite.setFlipX(false);
        if (currentAnim !== "run") this.sprite.play("run");
      } else {
        if (currentAnim !== "warmup") this.sprite.play("warmup");
      }
    }
  }

  static preload(scene: Phaser.Scene): void {
    scene.load.spritesheet("spiderman", "spiderman-spritesheet.png", {
      frameWidth: 1200,
      frameHeight: 480,
    });
  }

  private registerAnims(): void {
    (Object.keys(ANIMS) as AnimKey[]).forEach((key) => {
      if (this.scene.anims.exists(key)) return;
      const { start, end, repeat } = ANIMS[key];
      this.scene.anims.create({
        key,
        frames: this.scene.anims.generateFrameNumbers("spiderman", {
          start,
          end,
        }),
        frameRate: FRAME_RATE,
        repeat,
      });
    });
  }

  playWarmup(x = 0): void {
    const { height } = this.scene.scale;
    this.sprite.setPosition(x, height - 75);
    this.sprite.setFlipX(false);
    this.sprite.play("warmup");
  }

  private playWallCrawl(): void {
    this.wallCrawlActive = true;
    this.sprite.play("wallCrawl");
  }

  /** Set the speech bubble message (always visible). Pass '' to hide. */
  say(message: string): void {
    if (this.bubble) {
      this.bubble.destroy();
      this.bubble = null;
    }
    if (message) {
      this.bubble = ComicUI.speechBubble(this.scene, message);
    }
    this.syncBubble();
  }

  onRightEdge(cb: () => void): void {
    this.onRightEdgeCb = cb;
  }
  onLeftEdge(cb: () => void): void {
    this.onLeftEdgeCb = cb;
  }
  onInteract(cb: () => void): void {
    this.onInteractCb = cb;
  }

  /** Current sprite X — used for proximity detection in scenes. */
  getX(): number {
    return this.sprite.x;
  }

  private syncBubble(): void {
    if (!this.bubble) return;
    // Position above sprite, tail pointing down toward it
    this.bubble.setPosition(
      this.sprite.x - 20,
      this.sprite.y - this.sprite.displayHeight / 2 - 55,
    );
  }
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 3: Visual check**

Run dev server. BootScene should show a Comic Sans speech bubble above Spiderman at all times (no I key needed to reveal it).

- [ ] **Step 4: Commit**

```bash
git add src/games/objects/Spiderman.ts
git commit -m "feat: replace tooltip with always-visible comic speech bubble; add onInteract + getX"
```

---

## Task 7: Comic Page Frame — PhaserContainer + CSS

**Files:**

- Modify: `src/components/phaser-container.tsx`
- Modify: `src/style.css`

- [ ] **Step 1: Update style.css**

Replace entire file:

```css
* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

body {
  background: #f0ece4;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

#comic-page {
  position: relative;
  display: inline-block;
  background: #f0ece4;
}

#phaser-container {
  display: block;
  border: 4px solid #000;
  box-shadow: 6px 6px 0 #000;
}

/* Dog-ear corner decoration */
#comic-page::after {
  content: "";
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #bbb 50%, #f0ece4 50%);
  pointer-events: none;
}
```

- [ ] **Step 2: Update phaser-container.tsx**

Replace the return value to wrap the canvas in the `#comic-page` div:

```tsx
import { useEffect, useRef } from "react";
import { createGame } from "../games";

export function PhaserContainer() {
  const phaserRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!phaserRef.current) return;
    const game = createGame(phaserRef.current);
    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div id="comic-page">
      <div
        id="phaser-container"
        ref={phaserRef}
        style={{ width: "900px", height: "540px" }}
      />
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 4: Visual check**

The game canvas should be centred on a paper-coloured page with a thick black border, offset drop-shadow, and a dog-ear in the bottom-right corner.

- [ ] **Step 5: Commit**

```bash
git add src/components/phaser-container.tsx src/style.css
git commit -m "feat: comic page frame — paper bg, thick border, box-shadow, dog-ear"
```

---

## Task 8: Restyle BootScene

**Files:**

- Modify: `src/games/scenes/BootScene.ts`

Remove the old floating text objects. Add ComicUI caption bar (red) and info strip.

- [ ] **Step 1: Replace BootScene.ts**

```typescript
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

    ComicUI.captionBar(
      this,
      COMIC_RED,
      "Bunthoeun Tok",
      "Full-Stack Developer",
    );
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
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 3: Visual check**

BootScene should show: red caption bar at top with "BUNTHOEUN TOK / FULL-STACK DEVELOPER", speech bubble above Spiderman, info strip at bottom. No floating white text.

- [ ] **Step 4: Commit**

```bash
git add src/games/scenes/BootScene.ts
git commit -m "feat: BootScene comic restyle — red caption bar + info strip"
```

---

## Task 9: Restyle AboutMeScene

**Files:**

- Modify: `src/games/scenes/AboutMeScene.ts`

Add blue caption bar, restyle bio/skills card with comic aesthetics.

- [ ] **Step 1: Replace AboutMeScene.ts**

```typescript
import Phaser from "phaser";
import { Spiderman } from "../objects/Spiderman";
import { Background } from "./Background";
import { ComicUI } from "../ui/ComicUI";
import {
  COMIC_BLUE,
  COMIC_RED,
  COMIC_BLACK,
  COMIC_WHITE,
  CSS_RED,
  CSS_BLUE,
} from "../constants";

const BIO =
  "Passionate developer crafting web experiences\nwith modern technologies and creative flair.";
const SKILLS = [
  "TypeScript",
  "React",
  "Node.js",
  "Phaser",
  "PostgreSQL",
  "Docker",
];

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

    ComicUI.captionBar(
      this,
      COMIC_BLUE,
      "About Me",
      "The Origin Story",
      "#ffffff",
    );
    ComicUI.infoStrip(this, "← / →  |  I: Interact");

    // --- Bio card ---
    const cardX = width * 0.08;
    const cardY = height * 0.13;
    const cardW = width * 0.56;
    const cardH = height * 0.72;
    const gfx = this.add.graphics();

    // Card background
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
    const chipPadX = 10;
    const chipPadY = 5;
    const chipGap = 8;
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
      const cx = cardX + 16 + col * colW;
      const cy = cardY + 136 + row * (ch + chipGap);

      const cg = this.add.graphics().setDepth(6);
      cg.fillStyle(0x003b8e, 1);
      cg.fillRect(cx, cy, cw, ch);
      cg.lineStyle(2.5, COMIC_BLACK, 1);
      cg.strokeRect(cx, cy, cw, ch);

      this.add.text(cx + chipPadX, cy + chipPadY, skill, chipFont).setDepth(7);
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
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 3: Visual check**

AboutMeScene: blue caption bar, white rounded bio card with BIO label + bio text, blue skill chips, Spiderman on right with speech bubble. Walking right should navigate to ProjectsScene (will be a blank scene until Task 10).

- [ ] **Step 4: Commit**

```bash
git add src/games/scenes/AboutMeScene.ts
git commit -m "feat: AboutMeScene comic restyle — blue caption, bio card, skill chips"
```

---

## Task 10: Create ProjectsScene

**Files:**

- Create: `src/games/scenes/ProjectsScene.ts`

- [ ] **Step 1: Create the file**

```typescript
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
    const cardH = height * 0.48;
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
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/games/scenes/ProjectsScene.ts
git commit -m "feat: ProjectsScene — project card with GITHUB button and POW! decoration"
```

---

## Task 11: Create ContactScene

**Files:**

- Create: `src/games/scenes/ContactScene.ts`

- [ ] **Step 1: Create the file**

```typescript
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
    url: "", // email — no external link
  },
  {
    icon: "⬡",
    label: "github.com/bunthoeuntok",
    url: "https://github.com/bunthoeuntok",
  },
  {
    icon: "in",
    label: "LinkedIn — Bunthoeun Tok",
    url: "https://www.linkedin.com/in/bunthoeun-tok-8487ba206",
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
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/games/scenes/ContactScene.ts
git commit -m "feat: ContactScene — 3 contact cards with proximity I-key link opener"
```

---

## Task 12: Register New Scenes in index.ts

**Files:**

- Modify: `src/games/index.ts`

- [ ] **Step 1: Add ProjectsScene and ContactScene**

```typescript
import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { AboutMeScene } from "./scenes/AboutMeScene";
import { ProjectsScene } from "./scenes/ProjectsScene";
import { ContactScene } from "./scenes/ContactScene";

export function createGame(parent: HTMLElement): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    backgroundColor: "#f0ece4",
    scene: [BootScene, AboutMeScene, ProjectsScene, ContactScene],
    scale: {
      mode: Phaser.Scale.RESIZE,
      parent,
      width: "100%",
      height: "100%",
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };
  return new Phaser.Game(config);
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 3: Full end-to-end visual check**

```bash
npm run dev
```

Walk through all 4 scenes:

- Boot → red caption "BUNTHOEUN TOK / FULL-STACK DEVELOPER", speech bubble, walk right → About
- About → blue caption "ABOUT ME / THE ORIGIN STORY", bio card, skill chips, walk right → Projects
- Projects → yellow caption "PROJECTS / WEB-SLINGING SOME CODE", project card, POW!, walk right → Contact
- Contact → red caption "CONTACT / SEND A WEB", 3 contact cards, walk left → Projects
- Walk left from About → Boot; halftone sky, comic buildings, road border visible in all scenes

- [ ] **Step 4: Commit**

```bash
git add src/games/index.ts
git commit -m "feat: register ProjectsScene and ContactScene"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement                               | Task                               |
| ---------------------------------------------- | ---------------------------------- |
| Red caption bar — Boot                         | Task 8                             |
| Blue caption bar — About                       | Task 9                             |
| Yellow caption bar — Projects                  | Task 10                            |
| Red caption bar — Contact                      | Task 11                            |
| Speech bubbles replace tooltip                 | Task 6                             |
| Halftone sky                                   | Task 3                             |
| Comic building outlines + yellow windows       | Task 4                             |
| Comic road top border                          | Task 5                             |
| Skill chips — blue bg + black border           | Task 9                             |
| POW! action word                               | Task 10                            |
| Info strips with keyboard hints                | Tasks 8–11 (via ComicUI.infoStrip) |
| Project card — GITHUB + LIVE buttons           | Task 10                            |
| Contact cards — email, GitHub, LinkedIn        | Task 11                            |
| I key proximity → open link                    | Tasks 10, 11                       |
| Paper bg + thick comic border + dog-ear        | Task 7                             |
| Scene order: Boot → About → Projects → Contact | Tasks 8–12                         |
| Camera fade 500ms on transitions               | Tasks 8–11                         |
| No changes to Car or Spiderman controls        | N/A — preserved                    |

**Placeholder scan:** None found.

**Type consistency:**

- `ComicUI.captionBar` defined in Task 2 — used identically in Tasks 8–11 ✓
- `ComicUI.infoStrip` defined in Task 2 — used identically in Tasks 8–11 ✓
- `ComicUI.speechBubble` defined in Task 2 — called inside `Spiderman.say()` in Task 6 ✓
- `spiderman.onInteract` defined in Task 6 — called in Tasks 10, 11 ✓
- `spiderman.getX()` defined in Task 6 — called in Tasks 10, 11 ✓
- `COMIC_*` constants defined in Task 1 — used throughout ✓
