import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { PhaserContainer } from "./components/phaser-container";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PhaserContainer />
  </StrictMode>,
);
