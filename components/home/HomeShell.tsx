"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import styles from "./home.module.css";
import Image from "next/image";
import CopyEmail from "./CopyEmail";
import DotField from "./DotField";
import GlowField from "./GlowField";
import LiveSentence from "./LiveSentence";
import ProductDock from "./ProductDock";
import SelectedWork from "./SelectedWork";
import SiteMenu from "./SiteMenu";
import MotionToggle from "./MotionToggle";
import { motionEnabled, subscribeMotion } from "./motion";
import { syncTheme } from "./theme";

export default function HomeShell({
  refresh = false,
  dock = false,
}: {
  refresh?: boolean;
  dock?: boolean;
}) {
  const moving = useSyncExternalStore(
    subscribeMotion,
    motionEnabled,
    () => true,
  );

  useLayoutEffect(() => {
    if (refresh) syncTheme();
  }, [refresh]);

  const pageClass = refresh
    ? `${styles.page} ${styles.glass} ${styles.themed}`
    : styles.page;

  return (
    <div className={dock ? `${pageClass} ${styles.dockPage}` : pageClass}>
      <SiteMenu themeToggle={refresh} />
      <MotionToggle />

      <div className={styles.shell}>
        <header className={styles.masthead}>
          {refresh ? (
            <GlowField className={styles.heroShader} paused={!moving} />
          ) : (
            <DotField className={styles.heroDots} count={32} paused={!moving} />
          )}
          {dock && <div className={styles.dockGrid} aria-hidden="true" />}

          <div className={styles.profile}>
            <div className={styles.profileTop}>
              <div className={styles.heroBadge}>
                <Image
                  src="/hero/portrait.png"
                  alt="Neil McArdle"
                  width={480}
                  height={480}
                  sizes="124px"
                  priority
                />
              </div>

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

        {!dock && (
          <>
            <section id="work" className={styles.work}>
              <div className={styles.sectionHead}>
                <span className={styles.sectionNum} aria-hidden="true">
                  01
                </span>
                <span className={styles.sectionLabel}>
                  A few things I&rsquo;m building
                </span>
                <span className={styles.rule} />
              </div>

              <SelectedWork />
            </section>

            <section id="contact" className={styles.tellMore}>
              <div className={styles.tellMoreDots} aria-hidden="true" />

              <div className={styles.sectionHead}>
                <span className={styles.sectionNum} aria-hidden="true">
                  02
                </span>
                <span className={styles.sectionLabel}>
                  Contact me, I promise I&rsquo;ll read it
                </span>
                <span className={styles.rule} />
              </div>

              <div className={styles.tellMoreBody}>
                <h2 className={styles.tellMoreTitle}>Tell me more.</h2>
                <CopyEmail />
              </div>
            </section>
          </>
        )}
      </div>

      {dock && <ProductDock />}
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
