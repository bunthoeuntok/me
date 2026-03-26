import Phaser from "phaser";
import { ROAD_H } from "../constants";

export class Road {
  constructor(scene: Phaser.Scene) {
    const { width, height } = scene.scale;
    const gfx = scene.add.graphics();
    const roadY = height - ROAD_H;

    // Road surface
    gfx.fillStyle(0x1a1a1a);
    gfx.fillRect(0, roadY, width, ROAD_H);

    // Sidewalk / kerb line at top of road
    gfx.fillStyle(0x888888, 0.4);
    gfx.fillRect(0, roadY, width, 3);

    // Centre dashed line
    const dashW = 40;
    const gapW = 30;
    const lineY = roadY + ROAD_H / 2 - 2;
    for (let x = 0; x < width; x += dashW + gapW) {
      gfx.fillStyle(0xffd700, 0.7);
      gfx.fillRect(x, lineY, dashW, 4);
    }
  }
}
