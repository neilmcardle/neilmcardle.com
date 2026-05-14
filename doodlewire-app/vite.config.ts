import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// The doodlewire components live in the main Next.js repo at `../`. We
// alias `@/` to the repo root so imports like `@/components/ui/button` and
// `@/lib/utils` resolve straight back to the canonical source — no copies,
// no drift.
const repoRoot = fileURLToPath(new URL("../", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": repoRoot.replace(/\/$/, ""),
      "next/link": fileURLToPath(new URL("./src/shims/next-link.tsx", import.meta.url)),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    host: true,
  },
});
