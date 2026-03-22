import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";

export function createGame(parent: HTMLElement): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    backgroundColor: "#05050f",
    scene: [BootScene],
    scale: {
      mode: Phaser.Scale.RESIZE,
      parent,
      width: "100%",
      height: "100%",
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };
  return new Phaser.Game(config);
}
