# Tessera — iOS shipping guide

This document describes how to wrap `/tessera` in a native iOS app via
Capacitor and submit it to the App Store. It assumes the Capacitor
config in `capacitor.config.ts` at the project root.

---

## One-time setup

Done already by the scaffolding pass:

- `npm install @capacitor/core @capacitor/cli @capacitor/ios` ✓
- `capacitor.config.ts` created at the project root ✓
- Bundle ID: `com.neilmcardle.tessera` ✓
- App name: `Tessera` ✓

What's still on your plate:

```bash
# Add the iOS platform (creates the ios/App Xcode project)
npx cap add ios

# Open the project in Xcode for signing/config
npx cap open ios
```

Inside Xcode you'll need to:

1. Select your team (Neil McArdle, Apple Developer membership).
2. Set the version to `1.0` and the build number to `1`.
3. Configure signing capability automatically.
4. Drop in the 1024×1024 app icon from `/tessera/icon` (see below).
5. Set the launch screen background to `#f7f1e3` (matches the game).

---

## App icon

Drop your 1024×1024 PNG into
`App/App/Assets.xcassets/AppIcon.appiconset/` in Xcode. Xcode
generates the rest of the required sizes from the 1024×1024 source.

---

## Production builds — picking the path

Capacitor needs a static `webDir` to bundle into the iOS app. Three options:

### Option A: Standalone Vite build (recommended)

Extract `/tessera` into a separate Vite project that builds independently
of the Next.js marketing site. The game has no API routes and no auth,
so this is straightforward and gives the iOS app its own deployment cycle.

```bash
# (sketch — actual setup is a few hours' work)
mkdir tessera-ios
cd tessera-ios
npm create vite@latest . -- --template react-ts
# Copy app/tessera/page.tsx as src/Tessera.tsx
# Wire it as the root component
# Move audio assets from public/tessera/ into Vite's public/
# Build: npm run build → dist/
# Then in the repo root:
# capacitor.config.ts → webDir: 'tessera-ios/dist'
```

### Option B: Next.js static export of the tessera route

Configure Next.js `output: 'export'` and bundle the generated `out/`
folder. Caveat: other Next.js features (API routes, dynamic pages on
the marketing site) won't work in export mode, so this requires either
a separate build config or splitting the repo.

### Option C: Live web view (development only)

Set `server.url` in `capacitor.config.ts` to `https://neilmcardle.com/tessera`.
The app loads the live web page on every launch.

Apple will reject this for App Store submission — apps must work without
a network connection — but it's fine for local testing.

---

## App Store Connect checklist

When the iOS build is signed and uploaded via Xcode:

- [ ] App name: `Tessera`
- [ ] Subtitle: `The Triangle Game`
- [ ] Bundle ID: `com.neilmcardle.tessera`
- [ ] Category: Games → Board (primary), Games → Puzzle (secondary)
- [ ] Age rating: 4+
- [ ] Pricing: Free
- [ ] In-App Purchases: None (the BMC link is an external URL, no IAP needed)
- [ ] Privacy policy URL: `https://neilmcardle.com/tessera/privacy`
- [ ] Support URL: `https://neilmcardle.com/tessera/support`
- [ ] Description: (see step 1 of the publication plan in conversation)
- [ ] Keywords: `dice,hex,hexagon,edge,strategy,abstract,2player,hotseat,family,board,geometry,indie,doodlewire`
- [ ] What's New: `First release of Tessera. Play two-player hotseat or against the computer on three board sizes. Built solo. Pour a coffee.`
- [ ] Screenshots: at least one per device class (iPhone 6.7", iPhone 5.5", iPad 12.9"). Take from the iOS simulator.

---

## App Review Information notes

When submitting, paste into the "Notes for reviewer" field:

> Tessera is a turn-based dice game on a hexagonal triangle grid. No
> account required, no network access required, no IAP. The Settings
> sheet includes a "Buy me a coffee" external link as a tip option;
> this is not an IAP and unlocks no content.
