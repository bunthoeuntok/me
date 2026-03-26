import Phaser from 'phaser';
import {
  COMIC_BLACK, COMIC_WHITE,
  CSS_YELLOW,
} from '../constants';

const CAPTION_FONT = 'Impact, Arial Black, sans-serif';
const BUBBLE_FONT  = "'Comic Sans MS', 'Chalkboard SE', cursive";

export class ComicUI {
  /**
   * Draws a full-width caption bar at the top of the canvas.
   * @param bgColor  Phaser integer colour (e.g. COMIC_RED)
   * @param line1    Main label (large)
   * @param line2    Subtitle label (small) — pass '' to omit
   * @param subtitleCss  CSS colour string for line2, defaults to '#FFD700'
   */
  static captionBar(
    scene: Phaser.Scene,
    bgColor: number,
    line1: string,
    line2: string,
    subtitleCss = CSS_YELLOW,
  ): void {
    const { width } = scene.scale;
    const barH = line2 ? 52 : 36;

    const gfx = scene.add.graphics();
    gfx.fillStyle(bgColor);
    gfx.fillRect(0, 0, width, barH);
    gfx.lineStyle(4, COMIC_BLACK, 1);
    gfx.strokeRect(0, 0, width, barH);
    gfx.setDepth(20);

    scene.add
      .text(width / 2, line2 ? 10 : 10, line1.toUpperCase(), {
        fontFamily: CAPTION_FONT,
        fontSize: '20px',
        color: '#ffffff',
        letterSpacing: 3,
      })
      .setOrigin(0.5, 0)
      .setDepth(21);

    if (line2) {
      scene.add
        .text(width / 2, 32, line2.toUpperCase(), {
          fontFamily: CAPTION_FONT,
          fontSize: '11px',
          color: subtitleCss,
          letterSpacing: 3,
        })
        .setOrigin(0.5, 0)
        .setDepth(21);
    }
  }

  /**
   * Creates an always-visible speech bubble container.
   * Call `.setPosition(x, y)` on the returned Container to move it.
   * The tail points downward from the bottom-left of the bubble.
   */
  static speechBubble(
    scene: Phaser.Scene,
    message: string,
  ): Phaser.GameObjects.Container {
    const pad   = 10;
    const r     = 12;          // border-radius
    const tail  = 10;          // tail height

    // Measure text first to size the bubble
    const tmp = scene.add.text(0, 0, message, {
      fontFamily: BUBBLE_FONT,
      fontSize: '12px',
      color: '#000000',
    }).setVisible(false);
    const tw = tmp.width + pad * 2;
    const th = tmp.height + pad * 2;
    tmp.destroy();

    const gfx = scene.add.graphics();

    // Fill
    gfx.fillStyle(COMIC_WHITE, 1);
    gfx.fillRoundedRect(0, 0, tw, th, r);

    // Tail (filled triangle, down-left)
    gfx.fillTriangle(
      14, th,
      28, th,
      14, th + tail,
    );

    // Outline
    gfx.lineStyle(3, COMIC_BLACK, 1);
    gfx.strokeRoundedRect(0, 0, tw, th, r);
    // Tail outline (two lines only — sides of triangle)
    gfx.beginPath();
    gfx.moveTo(14, th);
    gfx.lineTo(14, th + tail);
    gfx.lineTo(28, th);
    gfx.strokePath();

    const label = scene.add.text(pad, pad, message, {
      fontFamily: BUBBLE_FONT,
      fontSize: '12px',
      color: '#000000',
    });

    const container = scene.add.container(0, 0, [gfx, label]);
    container.setDepth(15);
    return container;
  }

  /**
   * Draws a full-width info strip at the bottom of the canvas.
   * Shows keyboard hints for this scene.
   */
  static infoStrip(scene: Phaser.Scene, hint: string): void {
    const { width, height } = scene.scale;
    const stripH = 28;
    const y = height - stripH;

    const gfx = scene.add.graphics();
    gfx.fillStyle(COMIC_WHITE, 1);
    gfx.fillRect(0, y, width, stripH);
    gfx.lineStyle(3, COMIC_BLACK, 1);
    gfx.strokeRect(0, y, width, stripH);
    gfx.setDepth(20);

    scene.add
      .text(width / 2, y + 14, hint.toUpperCase(), {
        fontFamily: CAPTION_FONT,
        fontSize: '11px',
        color: '#000000',
        letterSpacing: 2,
      })
      .setOrigin(0.5)
      .setDepth(21);
  }
}
