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
      up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
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
    scene.load.spritesheet("spiderman", `${import.meta.env.BASE_URL}spiderman-spritesheet.png`, {
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
