import Phaser from "phaser";

/** Passed to a scene's create() when it is rebuilt after a resize. */
export interface RelayoutData {
  /** Hero x position, scaled to the new width. */
  heroX?: number;
  /** True when rebuilt by a resize: skip entrance effects like fade-ins. */
  relayout?: boolean;
}

const SETTLE_MS = 150;
const EDGE_CLEARANCE = 60;

/**
 * Every scene computes its layout once in create(), so rebuild the scene at the
 * new size whenever the window resizes or the device rotates, keeping the hero
 * at the same relative position.
 */
export function relayoutOnResize(scene: Phaser.Scene, getHeroX: () => number): void {
  const { width: builtWidth, height: builtHeight } = scene.scale;
  let pending: Phaser.Time.TimerEvent | undefined;

  // Read the size once things settle rather than trusting each event: on rotation,
  // the first resize event can still report the old orientation.
  const rebuildIfSizeChanged = () => {
    const { width, height } = scene.scale;
    if (width === builtWidth && height === builtHeight) return;

    const data: RelayoutData = {
      // Keep clear of the edges, which trigger moving to the next screen.
      heroX: Phaser.Math.Clamp(
        (getHeroX() / builtWidth) * width,
        EDGE_CLEARANCE,
        width - EDGE_CLEARANCE,
      ),
      relayout: true,
    };
    scene.scene.restart(data);
  };

  const onResize = () => {
    pending?.remove();
    pending = scene.time.delayedCall(SETTLE_MS, rebuildIfSizeChanged);
  };

  scene.scale.on(Phaser.Scale.Events.RESIZE, onResize);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.scale.off(Phaser.Scale.Events.RESIZE, onResize);
  });
  // A resize can land while this scene is being rebuilt, when no listener is attached.
  onResize();
}
