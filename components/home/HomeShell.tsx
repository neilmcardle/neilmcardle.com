"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import styles from "./home.module.css";
import GlowField from "./GlowField";
import PinMark from "./PinMark";
import LiveSentence from "./LiveSentence";
import ProductDock from "./ProductDock";
import SiteMenu from "./SiteMenu";
import MotionToggle from "./MotionToggle";
import PageCurl from "./PageCurl";
import { motionEnabled, subscribeMotion } from "./motion";
import { syncTheme } from "./theme";

export default function HomeShell() {
  const moving = useSyncExternalStore(
    subscribeMotion,
    motionEnabled,
    () => true,
  );

  useLayoutEffect(() => {
    syncTheme();
  }, []);

  return (
    <div
      className={`${styles.page} ${styles.glass} ${styles.themed} ${styles.dockPage}`}
    >
      <SiteMenu themeToggle />
      <MotionToggle />

      <div className={styles.shell}>
        <header className={styles.masthead}>
          <GlowField className={styles.heroShader} paused={!moving} />
          <div className={styles.dockGrid} aria-hidden="true" />

          <div className={styles.profile}>
            <div className={styles.profileTop}>
              <PinMark face="portrait" size={124} zoom={4.7} />

              <div className={styles.profileMeta}>
                <h1 className={styles.profileName}>Neil McArdle</h1>
                <a
                  className={styles.profileHandle}
                  href="https://x.com/BetterNeil"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @<span className={styles.profileHandleName}>BetterNeil</span>
                </a>
              </div>
            </div>

            <div className={styles.profileBio}>
              <LiveSentence />
            </div>

            <p className={styles.credentialsEyebrow}>Trusted by</p>

            <div className={styles.credentials}>
              <Credential
                src="/logos/avis-budget-group.svg"
                alt="Avis Budget Group"
                height={15}
                tip="In-house"
              />
              <Credential
                src="/logos/mobbin.svg"
                alt="Mobbin"
                height={15}
                tip="Contractor"
              />
              <Credential
                src="/logos/banner-of-truth.svg"
                alt="The Banner of Truth"
                height={26}
                tip="Previously"
              />
            </div>
          </div>
        </header>
      </div>

      <ProductDock />
      <PageCurl />
    </div>
  );
}

function Credential({
  src,
  alt,
  height,
  tip,
}: {
  src: string;
  alt: string;
  height: number;
  tip: string;
}) {
  return (
    <span className={styles.credentialItem}>
      <img
        className={styles.credentialLogo}
        src={src}
        alt={alt}
        style={{ height }}
      />
      <span className={styles.credentialTip} role="tooltip">
        {tip}
      </span>
    </span>
  );
}
