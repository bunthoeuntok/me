import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { AboutMeScene } from "./scenes/AboutMeScene";
import { ExperienceScene } from "./scenes/ExperienceScene";
import { ProjectsScene } from "./scenes/ProjectsScene";
import { ContactScene } from "./scenes/ContactScene";
import { CityScene } from "../city/city-scene";

// The continuous City is being built behind ?city until it can replace the section screens.
const useCity = new URLSearchParams(window.location.search).has("city");

export function createGame(parent: HTMLElement): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    backgroundColor: "#f0ece4",
    // Phaser caps each frame's time step for its first `panicMax` frames. On a slow
    // device (few fps) that makes the opening seconds run in slow motion; movement
    // is already clamped, so skip the cooldown.
    fps: { panicMax: 0 },
    scene: useCity
      ? [CityScene]
      : [BootScene, AboutMeScene, ExperienceScene, ProjectsScene, ContactScene],
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
