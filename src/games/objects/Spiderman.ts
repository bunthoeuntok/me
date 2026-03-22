import Phaser from "phaser";

const SCALE = 0.3;
const FRAME_RATE = 12;
const SPEED = 100;

const ANIMS = {
  warmup: { start: 0, end: 34, repeat: -1 },
  run: { start: 35, end: 58, repeat: -1 },
  jump: { start: 59, end: 80, repeat: 0 },
  land: { start: 65, end: 80, repeat: 0 },
  wallAttach: { start: 81, end: 101, repeat: 0 },
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
  };

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
    };

    this.registerAnims();
  }

  update(delta: number): void {
    const speed = (SPEED * delta) / 1000;
    let dx = 0;
    let dy = 0;

    if (this.keys.left.isDown) dx -= speed;
    if (this.keys.right.isDown) dx += speed;
    if (this.keys.down.isDown) dy += speed;

    const { width, height } = this.scene.scale;
    const hw = this.sprite.displayWidth / 2;
    const hh = this.sprite.displayHeight / 2;

    this.sprite.x = Phaser.Math.Clamp(this.sprite.x + dx, hw, width - hw);
    this.sprite.y = Phaser.Math.Clamp(this.sprite.y + dy, hh, height - hh);

    const currentAnim = this.sprite.anims.currentAnim?.key;

    if (
      Phaser.Input.Keyboard.JustUp(this.keys.up) &&
      currentAnim === "wallCrawl"
    ) {
      this.playLand();
      return;
    }

    if (this.keys.up.isDown) {
      if (currentAnim !== "wallCrawl") this.sprite.play("wallCrawl");
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

  playWarmup(x?: number): void {
    const { height } = this.scene.scale;
    this.sprite.setPosition(x ?? this.sprite.x, height);
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

  playWallAttach(): void {
    this.sprite.play("wallAttach");
  }

  playWallCrawl(): void {
    const { height } = this.scene.scale;
    const topY = height * 0.08;

    this.sprite.play("wallCrawl");

    this.scene.tweens.add({
      targets: this.sprite,
      y: topY,
      duration: 2000,
      ease: "Linear",
      onComplete: () => {
        this.playWarmup(this.sprite.x);
      },
    });
  }

  playLand(): void {
    const { height } = this.scene.scale;
    const groundY = height;

    this.sprite.play("land");

    this.scene.tweens.add({
      targets: this.sprite,
      y: groundY,
      duration: 600,
      ease: "Linear",
    });
  }
}
