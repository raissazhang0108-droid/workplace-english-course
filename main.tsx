import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Training from "./Training";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Training />
  </StrictMode>
);
