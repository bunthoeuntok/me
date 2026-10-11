import Phaser from "phaser";

/** What the Visitor can ask the hero to do, from the keyboard or the on-screen buttons. */
export type Action = "left" | "right" | "jump" | "web" | "interact";

const KEYS: Record<Action, number[]> = {
  left: [Phaser.Input.Keyboard.KeyCodes.LEFT],
  right: [Phaser.Input.Keyboard.KeyCodes.RIGHT],
  jump: [Phaser.Input.Keyboard.KeyCodes.DOWN],
  web: [Phaser.Input.Keyboard.KeyCodes.UP],
  interact: [Phaser.Input.Keyboard.KeyCodes.I],
};

// On-screen buttons live in the HTML shell, outside any scene, so their state is module-level.
const buttonsHeld = new Set<Action>();
const buttonsPressedSinceRead = new Set<Action>();

/** Called by the on-screen buttons. */
export const onScreenButtons = {
  press(action: Action) {
    buttonsHeld.add(action);
    buttonsPressedSinceRead.add(action);
  },
  release(action: Action) {
    buttonsHeld.delete(action);
  },
};

/** One scene's view of the Visitor's input: keyboard and on-screen buttons combined. */
export class Controls {
  private keys: Record<Action, Phaser.Input.Keyboard.Key[]>;

  constructor(scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard!;
    this.keys = Object.fromEntries(
      (Object.keys(KEYS) as Action[]).map((action) => [
        action,
        KEYS[action].map((code) => keyboard.addKey(code)),
      ]),
    ) as Record<Action, Phaser.Input.Keyboard.Key[]>;
  }

  /** True while the action is held. */
  isDown(action: Action): boolean {
    return buttonsHeld.has(action) || this.keys[action].some((key) => key.isDown);
  }

  /** True once per press. */
  justPressed(action: Action): boolean {
    const fromButton = buttonsPressedSinceRead.delete(action);
    const fromKey = this.keys[action].some((key) => Phaser.Input.Keyboard.JustDown(key));
    return fromButton || fromKey;
  }
}
