import Image, { getImageProps } from "next/image";
import Link from "next/link";
import CoverlyMocks from "@/components/home/CoverlyMocks";
import DoodleWireShots from "@/components/home/DoodleWireShots";
import MakeEbookMocks from "@/components/home/MakeEbookMocks";
import AppIcon from "./AppIcon";
import ExplorationPreview from "./ExplorationPreview";
import HomeShell from "./HomeShell";
import PodiumFilm from "./PodiumFilm";
import ProductMark from "./ProductMark";
import SparkIntro from "./SparkIntro";
import { COVERS } from "./covers";
import { PAINTINGS } from "./paintings";
import { SHOWCASE } from "./showcase";
import {
  FILTERS,
  GROUP_LABEL,
  GROUP_ORDER,
  MULTI_SUB,
  WORKS,
  pad,
  slug,
  subKey,
  type Work,
} from "./data";
import styles from "./home.module.css";

const poster = (src: string) =>
  getImageProps({ src, alt: "", width: 600, height: 338 }).props.src;

const SPEAKUI_URL = process.env.SPEAKUI_ORIGIN ? "/speakui" : "";

const POSTERS = {
  makeebook: poster("/home/makeebook-promo.jpg"),
  spark: poster("/home/spark-promo.jpg"),
  diveRadio: poster("/home/dive-radio-jit.jpg"),
  podium: poster("/home/podium/film-poster.jpg"),
};

export default function Home() {
  return (
    <HomeShell>
      <Demo />
      {GROUP_ORDER.map((key) => {
        const items = WORKS.filter((work) => work.group === key);
        const subs = [...new Set(items.map((work) => work.sub))];
        return (
          <section
            key={key}
            aria-label={GROUP_LABEL[key]}
            className={styles.group}
            data-group={key}
          >
            <h2 className={styles.groupTitle}>
              <span className={styles.groupCount} aria-hidden="true">
                {pad(FILTERS.indexOf(key))}
              </span>
              <span>{GROUP_LABEL[key]}</span>
            </h2>
            {key === "explorations" ? (
              <div className={styles.sub} data-sub={subKey(items[0])}>
                <div className={styles.showcases}>
                  {items.map((work) => (
                    <ExplorationCard key={work.title} work={work} />
                  ))}
                </div>
              </div>
            ) : key === "paintings" ? (
              <div className={styles.sub} data-sub={subKey(items[0])}>
                <Paintings />
              </div>
            ) : key === "covers" ? (
              <div className={styles.sub} data-sub={subKey(items[0])}>
                <Covers />
              </div>
            ) : (
              subs.map((sub) => {
                const inSub = items.filter((work) => work.sub === sub);
                return (
                  <div
                    key={sub}
                    className={styles.sub}
                    data-sub={subKey(inSub[0])}
                  >
                    {MULTI_SUB.has(key) && key !== "products" && (
                      <p className={styles.subTitle}>{sub}</p>
                    )}
                    {key === "products" ? (
                      <div className={styles.showcases}>
                        {inSub.map((work) => (
                          <Showcase key={work.title} work={work} />
                        ))}
                      </div>
                    ) : (
                      <ul className={styles.rows}>
                        {inSub.map((work) => (
                          <li
                            key={work.title}
                            className={styles.rowItem}
                            data-item={slug(work.title)}
                          >
                            <WorkLink work={work} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })
            )}
          </section>
        );
      })}
    </HomeShell>
  );
}

function WorkLink({ work }: { work: Work }) {
  const external = work.href.startsWith("http");
  const inner = (
    <>
      <span className={styles.rowTitle}>
        {work.icon ? (
          <AppIcon icon={work.icon} className={styles.appIcon} />
        ) : null}
        {work.title}
        {external && (
          <span className={styles.linkIcons}>
            {appStore(work.href) && <AppleIcon className={styles.apple} />}
            {elevenReader(work.href) && <ElevenIcon className={styles.apple} />}
            <ExternalIcon className={styles.external} />
            <span className={styles.srOnly}>
              {appStore(work.href)
                ? " (App Store, "
                : elevenReader(work.href)
                  ? " (ElevenReader, "
                  : " ("}
              opens in a new tab)
            </span>
          </span>
        )}
      </span>
      <span className={styles.pills}>
        {work.pills.map((pill) => (
          <span key={pill} className={styles.pillTag}>
            {pill}
          </span>
        ))}
      </span>
    </>
  );

  if (external) {
    return (
      <a
        className={styles.rowLink}
        href={work.href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {inner}
      </a>
    );
  }

  if (work.plain) {
    return (
      <a className={styles.rowLink} href={work.href}>
        {inner}
      </a>
    );
  }

  return (
    <Link className={styles.rowLink} href={work.href}>
      {inner}
    </Link>
  );
}

function appStore(href: string) {
  return href.startsWith("https://apps.apple.com/");
}

function elevenReader(href: string) {
  return href.startsWith("https://elevenreader.io/");
}

function ElevenIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 12"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="3" y="1" width="2" height="10" rx="0.4" />
      <rect x="7" y="1" width="2" height="10" rx="0.4" />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );
}

function ExternalIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3.5 8.5l5-5M4.5 3.5h4v4" />
    </svg>
  );
}

function ShowcaseMedia({ title }: { title: string }) {
  if (title === "makeebook")
    return (
      <>
        <MakeEbookMocks only="lockup" />
        <MakeEbookMocks only="rain" />
        <MakeEbookMocks only="video" />
        <video
          className={styles.film}
          src="/home/makeebook-promo.mp4"
          poster={POSTERS.makeebook}
          aria-label="makeebook product film"
          controls
          playsInline
          preload="none"
        />
      </>
    );
  if (title === "Spark")
    return (
      <>
        <SparkIntro />
        <video
          className={styles.film}
          src="/home/spark-promo.mp4"
          poster={POSTERS.spark}
          aria-label="Spark course film"
          controls
          playsInline
          preload="none"
        />
      </>
    );
  if (title === "Podium")
    return (
      <>
        <PodiumFilm poster={POSTERS.podium} />
        <Image
          className={styles.podiumArt}
          src="/home/podium/keyart.jpg"
          alt="The boy in a blue hoodie on the rain-soaked podium deck, Petticoat Tower lost in the mist above him"
          width={1600}
          height={1280}
          sizes="(max-width: 960px) 100vw, 600px"
        />
        <Image
          className={styles.podiumArt}
          src="/home/podium/tower.jpg"
          alt="The boy alone on the deck below Petticoat Tower, the City's towers in the fog behind"
          width={1600}
          height={905}
          sizes="(max-width: 960px) 100vw, 600px"
        />
      </>
    );
  if (title === "Coverly") return <CoverlyMocks />;
  if (title === "DoodleWire") return <DoodleWireShots />;
  return null;
}

function Showcase({ work }: { work: Work }) {
  const info = SHOWCASE[work.title];
  if (!info) return null;
  const external = work.href.startsWith("http");
  const linkProps = external ? { target: "_blank", rel: "noreferrer" } : {};

  return (
    <article className={styles.showcase} data-item={slug(work.title)}>
      <div className={styles.showcaseHead}>
        {work.href ? (
          <h3 className={styles.showcaseHeading}>
            <a className={styles.showcaseName} href={work.href} {...linkProps}>
              {info.mark ? (
                <ProductMark mark={info.mark} className={styles.productMark} />
              ) : null}
              <span translate="no">{work.title}</span>
            </a>
          </h3>
        ) : (
          <h3 className={styles.showcaseName}>
            {info.markImage ? (
              <span
                className={styles.imageMark}
                style={{
                  maskImage: `url(${info.markImage})`,
                  WebkitMaskImage: `url(${info.markImage})`,
                }}
                aria-hidden="true"
              />
            ) : null}
            <span translate="no">{work.title}</span>
          </h3>
        )}
        {work.href && info.label ? (
          <a className={styles.visit} href={work.href} {...linkProps}>
            {appStore(work.href) && <AppleIcon className={styles.apple} />}
            {info.label}
          </a>
        ) : null}
      </div>
      <p className={styles.what}>{info.what}</p>
      <p className={styles.note}>{info.note}</p>
      <dl className={styles.facts}>
        <div>
          <dt>Type</dt>
          <dd>{info.type}</dd>
        </div>
        <div>
          <dt>Role</dt>
          <dd>{info.role}</dd>
        </div>
        {info.status ? (
          <div>
            <dt>Status</dt>
            <dd>{info.status}</dd>
          </div>
        ) : null}
        {info.x ? (
          <div>
            <dt>On X</dt>
            <dd>
              <a className={styles.handle} href={`https://x.com/${info.x}`}>
                @{info.x}
              </a>
            </dd>
          </div>
        ) : null}
      </dl>
      <ShowcaseMedia title={work.title} />
    </article>
  );
}

const BOOTH = [
  { rotate: -6, x: -108, y: 3 },
  { rotate: 0, x: 0, y: -3 },
  { rotate: 6, x: 108, y: 3 },
];

function Covers() {
  return (
    <div className={styles.showcases}>
      <article className={styles.showcase}>
        <div className={styles.showcaseHead}>
          <h3 className={styles.showcaseName}>The Banner of Truth</h3>
        </div>
        <p className={styles.what}>
          Covers for new editions of three classic books.
        </p>
        <dl className={styles.facts}>
          <div>
            <dt>Type</dt>
            <dd>Book cover design</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>
              Cover design, and illustration for The Child&rsquo;s Story Bible
            </dd>
          </div>
        </dl>
        <div className={styles.coverBooth}>
          {COVERS.map((cover, index) => (
            <span
              key={cover.title}
              className={styles.boothCover}
              data-item={slug(cover.title)}
              style={{
                transform: `translate(calc(-50% + ${BOOTH[index].x}%), calc(-50% + ${BOOTH[index].y}%)) rotate(${BOOTH[index].rotate}deg)`,
              }}
            >
              <Image
                src={cover.image}
                alt={`Cover of ${cover.title} by ${cover.author}`}
                fill
                sizes="(max-width: 959px) 28vw, 180px"
              />
            </span>
          ))}
        </div>
        <ul className={styles.covers} aria-label="Covers">
          {COVERS.map((cover) => (
            <li
              key={cover.title}
              className={styles.cover}
              data-item={slug(cover.title)}
            >
              <span className={styles.coverTitle}>{cover.title}</span>
              <span className={styles.coverMeta}>
                {cover.year} edition, first published {cover.original}
              </span>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}

function Paintings() {
  return (
    <div className={styles.gallery}>
      <div className={styles.paintingWall}>
        {PAINTINGS.map((painting) => (
          <span
            key={painting.slug}
            className={styles.paintingFrame}
            style={{ aspectRatio: painting.aspect ?? "4/5" }}
            data-item={slug(painting.title)}
          >
            <span className={styles.paintingCanvas}>
              <Image
                src={painting.image}
                alt={`${painting.title}, ${painting.medium.toLowerCase()}`}
                fill
                sizes="(max-width: 960px) 34vw, 180px"
              />
            </span>
          </span>
        ))}
      </div>
      <div className={styles.paintingNotes}>
        {PAINTINGS.map((painting) => (
          <article
            key={painting.slug}
            className={styles.plaque}
            data-item={slug(painting.title)}
          >
            <h3 className={styles.plaqueTitle}>
              <i>{painting.title}</i>, {painting.year}
            </h3>
            <p className={styles.plaqueLine}>
              {painting.medium}, {painting.dimensions}
            </p>
            {painting.status === "sold" ? (
              <p className={`${styles.plaqueLine} ${styles.sold}`}>
                <span className={styles.soldDot} aria-hidden="true" />
                Private collection
              </p>
            ) : null}
            <details className={styles.story} name="painting-story">
              <summary>
                Read the story
                <svg viewBox="0 0 12 12" aria-hidden="true">
                  <path
                    d="M3 4.5l3 3 3-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </summary>
              <div className={styles.storyBody}>
                {painting.description.map((para) =>
                  para.startsWith("> ") ? (
                    <blockquote key={para} className={styles.paintingQuote}>
                      {para.slice(2)}
                    </blockquote>
                  ) : (
                    <p key={para} className={styles.paintingBody}>
                      {para}
                    </p>
                  ),
                )}
              </div>
            </details>
          </article>
        ))}
      </div>
    </div>
  );
}

function Demo() {
  return (
    <section
      className={styles.group}
      aria-labelledby="home-demo"
      data-group="demo"
    >
      <h2 id="home-demo" className={styles.groupTitle}>
        SpeakUI Demo on Dive Radio
      </h2>
      <article className={styles.showcase}>
        <p className={styles.demoNote}>
          Following an approach by{" "}
          <a className={styles.handle} href="https://x.com/Moore">
            @Moore
          </a>
          , I built a simple SpeakUI demo to show off the speed at which Jev,
          TypeSafe AI&rsquo;s new fast decision model, can edit designs, making
          speaking edits almost feel realtime (demo recording played on Dive
          Radio by{" "}
          <a className={styles.handle} href="https://x.com/designertom">
            @designertom
          </a>{" "}
          and{" "}
          <a className={styles.handle} href="https://x.com/ridd_design">
            @ridd_design
          </a>
          , 24 September 2026).
        </p>
        <video
          className={styles.film}
          src="/home/dive-radio-jit.mp4"
          poster={POSTERS.diveRadio}
          aria-label="Dive Radio, Just-in-Time Interfaces"
          controls
          playsInline
          preload="none"
        />
        <div className={styles.demoFoot}>
          {SPEAKUI_URL ? (
            <a
              className={styles.visit}
              href={SPEAKUI_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Try SpeakUI for yourself
              <ExternalIcon className={styles.external} />
              <span className={styles.srOnly}> (opens in a new tab)</span>
            </a>
          ) : null}
          <p className={styles.caption}>Episode: Just-in-Time Interfaces</p>
        </div>
      </article>
    </section>
  );
}

function ExplorationCard({ work }: { work: Work }) {
  return (
    <article className={styles.showcase} data-item={slug(work.title)}>
      <div className={styles.showcaseHead}>
        <h3 className={styles.showcaseName}>{work.title}</h3>
        <a className={styles.visit} href={work.href}>
          Open the lab
        </a>
      </div>
      <a
        className={styles.previewLink}
        href={work.href}
        aria-label={`Open the ${work.title} lab, full screen`}
      >
        <ExplorationPreview />
      </a>
      <p className={styles.caption}>
        Inspired by{" "}
        <a
          className={styles.handle}
          href="https://heyneuma.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Neuma
        </a>{" "}
        by{" "}
        <a
          className={styles.handle}
          href="https://x.com/krispuckett"
          target="_blank"
          rel="noopener noreferrer"
        >
          @krispuckett
        </a>
      </p>
    </article>
  );
}
