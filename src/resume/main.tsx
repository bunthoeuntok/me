import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ResumeView } from "./resume-view";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ResumeView />
  </StrictMode>,
);
