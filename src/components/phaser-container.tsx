import { useEffect, useRef } from "react";
import { createGame } from "../games";
import { loadComicFonts } from "../fonts";
import { TouchControls } from "./touch-controls";

export function PhaserContainer() {
  const phaserRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = phaserRef.current;
    if (!parent) return;

    let game: Phaser.Game | undefined;
    let unmounted = false;
    // Canvas text can't re-render when a font arrives late, so start the game after the fonts.
    loadComicFonts()
      .catch(() => {}) // a missing font falls back to the system font; still start the game
      .then(() => {
        if (!unmounted) game = createGame(parent);
      });

    return () => {
      unmounted = true;
      game?.destroy(true);
    };
  }, []);

  return (
    <div id="comic-page">
      <div
        id="phaser-container"
        ref={phaserRef}
        style={{ width: "100%", height: "100%" }}
      />
      <TouchControls />
    </div>
  );
}
