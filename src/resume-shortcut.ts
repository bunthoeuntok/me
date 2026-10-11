/** Pressing R anywhere on the game page opens the Résumé view (same target as the Résumé button). */
export function installResumeShortcut(): void {
  window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() !== "r") return;
    if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;

    const link = document.getElementById("resume-link") as HTMLAnchorElement | null;
    if (link) window.location.assign(link.href);
  });
}
