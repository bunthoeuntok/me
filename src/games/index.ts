import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { AboutMeScene } from "./scenes/AboutMeScene";
import { ExperienceScene } from "./scenes/ExperienceScene";
import { ProjectsScene } from "./scenes/ProjectsScene";
import { ContactScene } from "./scenes/ContactScene";

export function createGame(parent: HTMLElement): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    backgroundColor: "#f0ece4",
    scene: [BootScene, AboutMeScene, ExperienceScene, ProjectsScene, ContactScene],
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
