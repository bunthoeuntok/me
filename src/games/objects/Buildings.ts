import Phaser from "phaser";

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

    // Building shadow layer
    gfx.fillStyle(0x000000, 0.4);
    buildings.forEach(({ x, w, h }) => {
      gfx.fillRect(x + 6, groundY - h + 6, w, h);
    });

    // Buildings
    buildings.forEach(({ x, w, h }) => {
      gfx.fillStyle(0x0a0a1a);
      gfx.fillRect(x, groundY - h, w, h);

      // Window grid
      const winW = 6;
      const winH = 8;
      const cols = Math.floor((w - 10) / 14);
      const rows = Math.floor((h - 20) / 18);
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const lit = Math.random() > 0.55;
          if (lit) {
            const warm = Math.random() > 0.4;
            gfx.fillStyle(warm ? 0xffe8a0 : 0xa0c8ff, 0.7);
            gfx.fillRect(
              x + 8 + col * 14,
              groundY - h + 16 + row * 18,
              winW,
              winH,
            );
          }
        }
      }
    });

    // Ground / street
    gfx.fillStyle(0x08080f);
    gfx.fillRect(0, groundY - 10, width, 10);
  }
}
