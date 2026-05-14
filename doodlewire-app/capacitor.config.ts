import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "ink.makeebook.doodlewire",
  appName: "DoodleWire",
  webDir: "dist",
  ios: {
    contentInset: "never",
    backgroundColor: "#ffffff",
  },
};

export default config;
