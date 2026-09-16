import Image from "next/image";
import styles from "./home.module.css";

export default function MakeEbookMocks() {
  return (
    <div className={styles.mbStack}>
      <div className={styles.mbRain} aria-hidden="true">
        <iframe
          src="/make-ebook/brand/rain-on-glass.html?bg=/make-ebook/brand/pier.jpg"
          title="makeebook"
          tabIndex={-1}
          loading="lazy"
          className={styles.mbRainCanvas}
        />
        <Image
          src="/make-ebook/brand/mark.svg"
          alt=""
          width={82}
          height={30}
          className={styles.mbRainMark}
        />
      </div>

      <div className={styles.mbGrid} aria-hidden="true">
        <span className={styles.mbGridFrame}>
          <Image
            src="/make-ebook/brand/mark.svg"
            alt=""
            width={82}
            height={30}
            className={styles.mbLockupMark}
          />
          <span className={styles.mbWordmark}>makeebook</span>
        </span>
      </div>

      <div className={styles.mbShot}>
        <Image
          src="/make-ebook/brand/hero-writer.jpg"
          alt=""
          width={1584}
          height={672}
          sizes="(max-width: 760px) 100vw, 648px"
        />
      </div>

      <div className={styles.mbKindle} aria-hidden="true">
        <div className={styles.mbKindleFrame}>
          <div className={styles.mbKindleScreen}>
            <p className={styles.mbKindleChapter}>Chapter Forty</p>
            <p className={styles.mbKindleTitle}>The Rainy City</p>
            <div className={styles.mbKindleBody}>
              <p>
                Rain had been falling on the city since before she woke, the
                soft kind that does not so much fall as arrive, settling on the
                windows and the wet slate roofs until every surface carried a
                little of the sky.
              </p>
              <p>
                Elena walked the length of the pier with her collar up and the
                manuscript held flat against her chest, its pages still warm
                from the bag. The water below was the colour of pewter, and the
                old iron columns went down into it without a sound.
              </p>
            </div>
            <div className={styles.mbKindleFoot}>
              <span>Loc 1</span>
              <span>1%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
