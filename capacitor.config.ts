import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.neilmcardle.tessera",
  appName: "Tessera",
  webDir: "tessera-app/dist",
  backgroundColor: "#0d0d0c",
  ios: {
    contentInset: "never",
    backgroundColor: "#0d0d0c",
  },
};

export default config;
