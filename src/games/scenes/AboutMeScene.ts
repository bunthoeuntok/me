import Phaser from "phaser";
import { Spiderman } from "../objects/Spiderman";
import { Background } from "./Background";

const ABOUT = {
  name: "Bunthoeun Tok",
  role: "Full-Stack Developer",
  bio: "Passionate developer crafting web experiences\nwith modern technologies and creative flair.",
  skills: ["TypeScript", "React", "Node.js", "Phaser", "PostgreSQL", "Docker"],
  contact: "✉  bunthoeuntok@gmail.com",
};

export class AboutMeScene extends Phaser.Scene {
  private spiderman!: Spiderman;

  constructor() {
    super({ key: "AboutMeScene" });
  }

  preload(): void {
    Spiderman.preload(this);
  }

  create(): void {
    new Background(this);

    const { width, height } = this.scale;

    // Fade in from black
    this.cameras.main.fadeIn(600, 0, 0, 0);

    const nameText = this.add
      .text(width / 2, height * 0.18, ABOUT.name, {
        fontSize: "28px",
        color: "#ffffff",
        fontFamily: "Orbitron, sans-serif",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const roleText = this.add
      .text(width / 2, height * 0.27, ABOUT.role, {
        fontSize: "15px",
        color: "#3a7bd5",
        fontFamily: "Inter, sans-serif",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const bioText = this.add
      .text(width / 2, height * 0.37, ABOUT.bio, {
        fontSize: "13px",
        color: "#c0cce0",
        fontFamily: "Inter, sans-serif",
        align: "center",
        lineSpacing: 6,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Skills
    const skillsLabel = this.add
      .text(width / 2, height * 0.49, "SKILLS", {
        fontSize: "11px",
        color: "#3a7bd5",
        fontFamily: "Orbitron, sans-serif",
        letterSpacing: 3,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const skillChips: Phaser.GameObjects.Text[] = [];
    const chipsPerRow = 3;
    const chipW = width / chipsPerRow - 10;
    ABOUT.skills.forEach((skill, i) => {
      const col = i % chipsPerRow;
      const row = Math.floor(i / chipsPerRow);
      const cx = width * 0.3 + col * (chipW + 8) + chipW / 2;
      const cy = height * 0.56 + row * 34;
      const chip = this.add
        .text(cx, cy, skill, {
          fontSize: "12px",
          color: "#8ec8f7",
          fontFamily: "Inter, sans-serif",
          backgroundColor: "#1a2a4a",
          padding: { x: 10, y: 5 },
        })
        .setOrigin(0.5)
        .setAlpha(0);
      skillChips.push(chip);
    });

    const contactText = this.add
      .text(width / 2, height * 0.75, ABOUT.contact, {
        fontSize: "13px",
        color: "#c0cce0",
        fontFamily: "Inter, sans-serif",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // --- Animate card elements in sequence ---
    const delay = (n: number) => 300 + n * 120;
    const fadeIn = (obj: Phaser.GameObjects.GameObject, d: number) => {
      this.tweens.add({ targets: obj, alpha: 1, duration: 400, delay: d });
    };

    fadeIn(nameText, delay(0));
    fadeIn(roleText, delay(1));
    fadeIn(bioText, delay(3));
    fadeIn(skillsLabel, delay(4));
    skillChips.forEach((chip, i) => fadeIn(chip, delay(5 + i)));
    fadeIn(contactText, delay(6 + skillChips.length));

    // --- Spiderman walks in from left ---
    this.spiderman = new Spiderman(this);
    this.spiderman.say("Check out my work! Press I");
    this.spiderman.playWarmup(width * 0.15);
    this.spiderman.onLeftEdge(() => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("BootScene");
      });
    });
  }

  update(_time: number, delta: number): void {
    this.spiderman.update(delta);
  }
}
