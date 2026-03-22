import Phaser from "phaser";
import { Buildings } from "../objects/Buildings";
import { Road } from "../objects/Road";
import { Car } from "../objects/Car";

export class Background {
  constructor(scene: Phaser.Scene) {
    const { width, height } = scene.scale;

    new Buildings(scene);
    new Road(scene);
    this.spawnCars(scene, width, height);
    this.drawSpiderWeb(scene, 0, 0, "left");
    this.drawSpiderWeb(scene, width, 0, "right");
  }

  private spawnCars(scene: Phaser.Scene, width: number, height: number): void {
    const roadH = 60;
    const roadY = height - roadH;
    const carW = 52;

    // direction: 1 = left→right (bottom lane), -1 = right→left (top lane)
    const carDefs = [
      { startX: -carW,        laneT: 0.72, dir: 1  as const, color: 0xc0392b, speed: 90,  delay: 0    },
      { startX: width * 0.3,  laneT: 0.72, dir: 1  as const, color: 0x2980b9, speed: 110, delay: 1200 },
      { startX: width * 0.7,  laneT: 0.72, dir: 1  as const, color: 0x27ae60, speed: 80,  delay: 2800 },
      { startX: width + carW, laneT: 0.28, dir: -1 as const, color: 0xf39c12, speed: 100, delay: 400  },
      { startX: width * 0.5,  laneT: 0.28, dir: -1 as const, color: 0x8e44ad, speed: 120, delay: 2000 },
    ];

    carDefs.forEach((config) => new Car(scene, roadY, roadH, config));
  }

  private drawSpiderWeb(
    scene: Phaser.Scene,
    originX: number,
    originY: number,
    side: "left" | "right",
  ): void {
    const gfx = scene.add.graphics();
    gfx.lineStyle(1.2, 0xcccccc, 0.55);

    const rays = 5;
    const rings = 4;
    const maxLen = 280;
    const spreadAngle = Math.PI / 2; // 90°

    // Angle range: left web fans to bottom-right, right fans to bottom-left
    const baseAngle = side === "left" ? 0 : Math.PI / 2;

    // Compute ray endpoints
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i <= rays; i++) {
      const t = i / rays;
      const angle = baseAngle + t * spreadAngle;
      points.push({
        x: originX + Math.cos(angle) * maxLen,
        y: originY + Math.sin(angle) * maxLen,
      });
    }

    // Draw radial lines
    points.forEach((pt) => {
      gfx.beginPath();
      gfx.moveTo(originX, originY);
      gfx.lineTo(pt.x, pt.y);
      gfx.strokePath();
    });

    // Draw concentric arc rings connecting the rays
    for (let r = 1; r <= rings; r++) {
      const t = r / rings;
      gfx.beginPath();
      for (let i = 0; i <= rays; i++) {
        const pt = points[i];
        const px = originX + (pt.x - originX) * t;
        const py = originY + (pt.y - originY) * t;
        if (i === 0) gfx.moveTo(px, py);
        else gfx.lineTo(px, py);
      }
      gfx.strokePath();
    }
  }
}
