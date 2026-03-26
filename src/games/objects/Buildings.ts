import Phaser from "phaser";
import { COMIC_BLACK, COMIC_YELLOW } from "../constants";

export class Buildings {
  constructor(scene: Phaser.Scene) {
    const { width, height } = scene.scale;
    const gfx = scene.add.graphics();
    const groundY = height;

    const buildings = [
      { x: 0,            w: 90,  h: 260 },
      { x: 80,           w: 60,  h: 200 },
      { x: 130,          w: 110, h: 320 },
      { x: 220,          w: 70,  h: 230 },
      { x: 280,          w: 80,  h: 280 },
      { x: 350,          w: 50,  h: 180 },
      { x: width - 400,  w: 60,  h: 200 },
      { x: width - 350,  w: 90,  h: 290 },
      { x: width - 270,  w: 70,  h: 240 },
      { x: width - 210,  w: 100, h: 330 },
      { x: width - 120,  w: 60,  h: 210 },
      { x: width - 70,   w: 80,  h: 260 },
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
