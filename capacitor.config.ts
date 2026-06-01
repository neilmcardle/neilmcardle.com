import type { CapacitorConfig } from '@capacitor/cli';

// Capacitor config for the Tessera iOS app.
//
// `webDir` points at the location of the static web build that Capacitor
// will bundle into the iOS app. See ios/README-TESSERA.md for the recommended
// production build path (a standalone Vite build of the Tessera route).
//
// During local development you can point Capacitor at the running Next.js
// dev server instead — uncomment the `server.url` block below and run the
// Next.js dev server on the same network as the simulator/device.

const config: CapacitorConfig = {
  appId: 'com.neilmcardle.tessera',
  appName: 'Tessera',
  webDir: 'tessera-app/dist',
  ios: {
    // 'never' lets the WebView fill the entire device screen, including
    // through the home-indicator safe area zone. With 'always', iOS adds
    // a content inset INSIDE the WebView so the WebView's viewport is
    // shorter than the device screen, and any `position:fixed; bottom:0`
    // element pins to the inset edge rather than the device edge —
    // leaving a strip of the Capacitor native background visible below.
    contentInset: 'never',
    backgroundColor: '#f7f1e3',
  },
  // Uncomment for local dev — hot-reload Tessera in the iOS simulator.
  // server: {
  //   url: 'http://localhost:3000/tessera',
  //   cleartext: true,
  // },
};

export default config;
