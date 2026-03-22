import Phaser from "phaser";

const SCALE = 0.3;
const FRAME_RATE = 12;
const SPEED = 100;

// Actual character body half-size within the frame (excluding transparent padding)
const BODY_HW = 30;
const BODY_HH = 50;

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
    const dy = 0;

    if (this.keys.left.isDown) dx -= speed;
    if (this.keys.right.isDown) dx += speed;

    const { width, height } = this.scene.scale;

    this.sprite.x = Phaser.Math.Clamp(
      this.sprite.x + dx,
      BODY_HW,
      width - BODY_HW,
    );
    this.sprite.y = Phaser.Math.Clamp(
      this.sprite.y + dy,
      BODY_HH,
      height - BODY_HH,
    );

    if (Phaser.Input.Keyboard.JustDown(this.keys.interact)) {
      this.showTooltip();
    }

    this.syncTooltip();

    const currentAnim = this.sprite.anims.currentAnim?.key;

    if (this.keys.up.isDown) {
      if (currentAnim !== "wallCrawl") this.playWallCrawl();
    } else if (this.keys.down.isDown) {
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

  static preload(scene: Phaser.Scene): void {
    scene.load.spritesheet("spiderman", "spiderman-spritesheet.png", {
      frameWidth: 1200,
      frameHeight: 480,
    });
  }

  private registerAnims(): void {
    (Object.keys(ANIMS) as AnimKey[]).forEach((key) => {
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

  playWarmup(): void {
    const { height } = this.scene.scale;
    this.sprite.setPosition(0, height - 75);
    this.sprite.setFlipX(false);
    this.sprite.play("warmup");
  }

  playRun(): void {
    const { width, height } = this.scene.scale;
    const groundY = height * 0.75;
    const targetX = width * 0.75;

    this.sprite.setPosition(120, groundY);
    this.sprite.setFlipX(false);
    this.sprite.play("run");

    this.scene.tweens.add({
      targets: this.sprite,
      x: targetX,
      duration: 3000,
      ease: "Linear",
    });
  }

  playJump(): void {
    const { width, height } = this.scene.scale;
    const peakY = height * 0.15;
    const wallX = width - 60;

    this.sprite.play("jump");

    this.scene.tweens.add({
      targets: this.sprite,
      x: wallX,
      y: peakY,
      duration: 800,
      ease: "Sine.easeOut",
    });
  }

  playWallCrawl(): void {
    const { height } = this.scene.scale;
    const topY = height - 75;
    this.sprite.play("wallCrawl");

    this.scene.tweens.add({
      targets: this.sprite,
      y: topY,
      duration: 2000,
      ease: "Linear",
    });
  }

  playLand(): void {
    const { height } = this.scene.scale;

    this.sprite.play("land");
    this.scene.tweens.add({
      targets: this.sprite,
      y: height,
      duration: 6000,
      ease: "Linear",
    });
  }

  say(message: string): void {
    this.sayMessage = message;
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
