import Phaser from "phaser";

interface CarConfig {
  startX: number;
  laneT: number;
  dir: 1 | -1;
  color: number;
  speed: number;
  delay: number;
}

export class Car {
  private container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, roadY: number, roadH: number, config: CarConfig) {
    const { startX, laneT, dir, color, speed, delay } = config;
    const carW = 52;
    const carH = 22;

    const y = roadY + roadH * laneT - carH / 2;
    this.container = scene.add.container(startX, y);

    const body = scene.add.graphics();
    body.fillStyle(color, 1);
    body.fillRoundedRect(0, 4, carW, carH - 4, 4);

    body.fillStyle(
      Phaser.Display.Color.ValueToColor(color).darken(25).color,
      1,
    );
    body.fillRoundedRect(carW * 0.2, 0, carW * 0.55, carH * 0.55, 3);

    body.fillStyle(0x87ceeb, 0.8);
    body.fillRect(carW * 0.22, 2, carW * 0.22, carH * 0.4);
    body.fillRect(carW * 0.48, 2, carW * 0.22, carH * 0.4);

    const frontX = dir === 1 ? carW - 4 : 2;
    const rearX = dir === 1 ? 2 : carW - 4;
    body.fillStyle(0xfffacd, 1);
    body.fillRect(frontX, 8, 3, 5);
    body.fillStyle(0xff2222, 1);
    body.fillRect(rearX, 8, 3, 5);

    body.fillStyle(0x111111, 1);
    body.fillCircle(10, carH + 2, 5);
    body.fillCircle(carW - 10, carH + 2, 5);
    body.fillStyle(0x555555, 1);
    body.fillCircle(10, carH + 2, 2);
    body.fillCircle(carW - 10, carH + 2, 2);

    this.container.add(body);

    if (dir === -1) {
      this.container.setScale(-1, 1);
      this.container.x = startX + carW;
    }

    const targetX = dir === 1 ? scene.scale.width + carW * 2 : -carW * 2;
    const distance = Math.abs(targetX - startX);
    const duration = (distance / speed) * 1000;

    const loop = () => {
      this.container.x = dir === 1 ? -carW : scene.scale.width + carW;
      scene.tweens.add({
        targets: this.container,
        x: targetX,
        duration,
        ease: "Linear",
        delay,
        onComplete: loop,
      });
    };

    scene.time.delayedCall(delay, () => {
      scene.tweens.add({
        targets: this.container,
        x: targetX,
        duration,
        ease: "Linear",
        onComplete: loop,
      });
    });
  }
}
