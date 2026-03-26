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
    const gapW  = 30;
    const lineY = roadY + ROAD_H / 2 - 2;
    for (let x = 0; x < width; x += dashW + gapW) {
      gfx.fillStyle(0xffd700, 0.85);
      gfx.fillRect(x, lineY, dashW, 4);
    }
  }
}
