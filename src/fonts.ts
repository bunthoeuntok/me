// Fonts are bundled with the site (no third-party requests).
import "@fontsource/bangers/latin-400.css";
import "@fontsource/comic-neue/latin-400.css";
import "@fontsource/comic-neue/latin-700.css";

/**
 * Resolves once the comic fonts are ready. The game draws text onto a canvas,
 * which can't re-render when a font arrives late, so it must wait for this.
 */
export function loadComicFonts(): Promise<unknown> {
  return Promise.all([
    document.fonts.load('16px "Bangers"'),
    document.fonts.load('16px "Comic Neue"'),
    document.fonts.load('bold 16px "Comic Neue"'),
  ]);
}
