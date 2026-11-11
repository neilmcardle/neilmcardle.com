import React from "react";
import ReactDOM from "react-dom/client";
import TesseraGame from "../../app/tessera/Game";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <TesseraGame inApp />
  </React.StrictMode>,
);
