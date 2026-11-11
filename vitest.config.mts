import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const alias = { "@": fileURLToPath(new URL("./", import.meta.url)) };
const exclude = ["node_modules", ".next", ".claude"];

export default defineConfig({
  resolve: { alias },
  test: {
    projects: [
      {
        resolve: { alias },
        test: {
          name: "node",
          include: ["lib/**/*.test.ts", "app/**/*.test.ts"],
          exclude: [...exclude, "**/*.dom.test.ts"],
        },
      },
      {
        resolve: { alias },
        test: {
          name: "dom",
          environment: "jsdom",
          include: ["lib/**/*.dom.test.ts", "app/**/*.dom.test.ts"],
          exclude,
        },
      },
    ],
  },
});
