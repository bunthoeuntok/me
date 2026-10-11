import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import { PhaserContainer } from "./components/phaser-container";
import { installResumeShortcut } from "./resume-shortcut";

installResumeShortcut();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PhaserContainer />
  </StrictMode>,
);
