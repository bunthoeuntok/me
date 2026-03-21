import { useEffect, useRef } from "react";
import { createGame } from "../games";

export function PhaserContainer() {
  const phaserRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!phaserRef.current) return;

    const game = createGame(phaserRef.current);

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div id="phaser-container" ref={phaserRef} style={{ width: "100%", height: "100vh" }} />;
}
