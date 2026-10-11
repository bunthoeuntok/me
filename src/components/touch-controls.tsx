import type { PointerEvent } from "react";
import { onScreenButtons, type Action } from "../games/controls";

const DIRECTION_BUTTONS: { action: Action; label: string; symbol: string }[] = [
  { action: "left", label: "Move left", symbol: "◀" },
  { action: "right", label: "Move right", symbol: "▶" },
];
const ACTION_BUTTONS: { action: Action; label: string; symbol: string }[] = [
  { action: "jump", label: "Jump", symbol: "JUMP" },
  { action: "web", label: "Web", symbol: "WEB" },
  { action: "interact", label: "Interact", symbol: "GO" },
];

/** On-screen buttons for touch devices; hidden by CSS where there's a fine pointer. */
export function TouchControls() {
  return (
    <div className="touch-controls">
      <div className="touch-cluster">{DIRECTION_BUTTONS.map(renderButton)}</div>
      <div className="touch-cluster">{ACTION_BUTTONS.map(renderButton)}</div>
    </div>
  );
}

function renderButton({ action, label, symbol }: { action: Action; label: string; symbol: string }) {
  const press = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onScreenButtons.press(action);
    // Keep receiving pointerup even if the finger slides off the button.
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer no longer active; release arrives via pointerup/pointercancel.
    }
  };
  const release = () => onScreenButtons.release(action);

  return (
    <button
      key={action}
      type="button"
      className="touch-button"
      aria-label={label}
      onPointerDown={press}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onContextMenu={(event) => event.preventDefault()}
    >
      {symbol}
    </button>
  );
}
