import Phaser from "phaser";

const SCALE = 0.3;
const FRAME_RATE = 12;
const SPEED = 500;

// Actual character body half-size within the frame (excluding transparent padding)
const BODY_HW = 30;

// Measured from spritesheet pixel data:
//   warmup frame 0  → character center X at +(-3)px on screen
//   wallCrawl last frame → character center X at +(173)px on screen
// Total shift the character visually travels across the full animation = 176px.
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
  private tooltip: Phaser.GameObjects.Text | null = null;
  private sayMessage: string = "";
  private onRightEdgeCb?: () => void;
  private rightEdgeFired = false;
  private onLeftEdgeCb?: () => void;
  private leftEdgeFired = false;
  private wallCrawlActive = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const { height } = scene.scale;
    const groundY = height;

    this.sprite = scene.add.sprite(-100, groundY, "spiderman");
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

    if (!this.leftEdgeFired && this.sprite.x <= BODY_HW && this.onLeftEdgeCb) {
      this.leftEdgeFired = true;
      this.onLeftEdgeCb();
    } else if (this.leftEdgeFired && this.sprite.x > BODY_HW) {
      this.leftEdgeFired = false;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.interact)) {
      this.showTooltip();
    }

    this.syncTooltip();

    const currentAnim = this.sprite.anims.currentAnim?.key;

    if (this.keys.up.isDown) {
      if (!this.wallCrawlActive) this.playWallCrawl();
    } else {
      if (this.wallCrawlActive) {
        // Apply X correction proportional to how far through the animation we are,
        // so sprite.x lands exactly where the character visually appears to be.
        const progress =
          this.sprite.anims.getProgress() > 0.6
            ? 0.6
            : this.sprite.anims.getProgress();
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

  say(message: string): void {
    this.sayMessage = message;
  }

  onRightEdge(cb: () => void): void {
    this.onRightEdgeCb = cb;
  }

  onLeftEdge(cb: () => void): void {
    this.onLeftEdgeCb = cb;
  }

  private showTooltip(): void {
    if (!this.sayMessage) return;

    if (this.tooltip) {
      this.tooltip.destroy();
      this.tooltip = null;
      return;
    }

    this.tooltip = this.scene.add.text(0, 0, this.sayMessage, {
      fontSize: "12px",
      color: "#ffffff",
      backgroundColor: "#000000cc",
      padding: { x: 8, y: 6 },
    });
    this.tooltip.setDepth(10);
    this.syncTooltip();
  }

  private syncTooltip(): void {
    if (!this.tooltip) return;
    this.tooltip.setPosition(
      this.sprite.x - this.tooltip.width / 2,
      this.sprite.y - this.sprite.displayHeight / 2 - this.tooltip.height + 40,
    );
  }
}
