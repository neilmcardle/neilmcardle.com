import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Standalone build of the Tessera game for Capacitor iOS packaging.
// Base is "./" so all asset paths are relative — Capacitor serves the
// built bundle from a local file://-style URL.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
