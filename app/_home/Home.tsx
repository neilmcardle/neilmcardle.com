import { media } from "@/lib/media";
import { Fragment } from "react";
import Image, { getImageProps } from "next/image";
import Link from "next/link";
import DoodleWireShots from "@/components/home/DoodleWireShots";
import AppIcon from "./AppIcon";
import AutoVideo from "./AutoVideo";
import AvisLogo from "./AvisLogo";
import { Mark, type OrbitMark } from "@/app/_orbit/Orbit";
import ExplorationPreview from "./ExplorationPreview";
import GoLink from "./GoLink";
import HomeShell from "./HomeShell";
import Lead from "./Lead";
import PodiumGallery from "./PodiumGallery";
import CoverShelf from "./CoverShelf";
import ProductMark from "./ProductMark";
import { PAINTINGS } from "./paintings";
import { SHOWCASE } from "./showcase";
import {
  GROUP_LABEL,
  GROUP_ORDER,
  MULTI_SUB,
  WORKS,
  slug,
  subKey,
  type GroupKey,
  type Work,
} from "./data";
import styles from "./home.module.css";

const poster = (src: string) =>
  getImageProps({ src, alt: "", width: 600, height: 338 }).props.src;

const POSTERS = {
  makeebook: poster("/home/makeebook-promo-logo.jpg"),
  spark: poster("/home/spark-promo-logo.jpg"),
  diveRadio: poster("/home/dive-radio-jit.jpg"),
  coverly: poster("/home/coverly-promo.jpg"),
  podium: poster("/home/podium/trailer-02-poster.jpg"),
  avis: poster("/work/avis/three-steps-start.jpg"),
  chessPath: poster("/home/chess-path.jpg"),
};

const GROUP_MARK: Partial<Record<string, OrbitMark>> = {
  tools: "tools",
  kids: "kids",
  covers: "book",
  books: "audio",
  paintings: "frame",
};

export default function Home() {
  return (
    <HomeShell>
      <AllWork />
    </HomeShell>
  );
}

const SHIPPED = WORKS.filter(
  (work) => work.group === "products" && work.sub === "Shipped",
);

const BUILDING = WORKS.filter(
  (work) => work.group === "products" && work.sub !== "Shipped",
);

const FOLDED = GROUP_ORDER.filter(
  (key) => key !== "products" && key !== "covers" && key !== "explorations",
);

function GroupBody({ group }: { group: GroupKey }) {
  const items = WORKS.filter((work) => work.group === group);
  if (group === "explorations")
    return (
      <div className={styles.sub} data-sub={subKey(items[0])}>
        <div className={styles.showcases}>
          {items.map((work) => (
            <ExplorationCard key={work.title} work={work} />
          ))}
        </div>
      </div>
    );
  if (group === "paintings")
    return (
      <div className={styles.sub} data-sub={subKey(items[0])}>
        <Paintings />
      </div>
    );
  const subs = [...new Set(items.map((work) => work.sub))];
  return subs.map((sub) => {
    const inSub = items.filter((work) => work.sub === sub);
    return (
      <div key={sub} className={styles.sub} data-sub={subKey(inSub[0])}>
        {MULTI_SUB.has(group) && <p className={styles.subTitle}>{sub}</p>}
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
      </div>
    );
  });
}

export function AllWork() {
  return (
    <>
      <section
        aria-labelledby="part-work"
        className={styles.part}
        data-group="work"
      >
        <h2 id="part-work" className={styles.partTitle}>
          Work
        </h2>
        <div className={styles.workList}>
          <AvisWork />
          {SHIPPED.map((work) => (
            <Showcase key={work.title} work={work} />
          ))}
          <Covers />
        </div>
      </section>
      <section
        aria-labelledby="part-playground"
        className={styles.part}
        data-group="playground"
      >
        <div className={styles.partHead}>
          <h2 id="part-playground" className={styles.partTitle}>
            Playground
          </h2>
          <p className={styles.partNote}>
            Experiments and things I make for fun.
          </p>
        </div>
        <section
          aria-labelledby="home-building"
          className={styles.group}
          data-group="products"
        >
          <h3 id="home-building" className={styles.groupTitle}>
            In progress
          </h3>
          <div className={styles.showcases}>
            {BUILDING.map((work) => (
              <Showcase key={work.title} work={work} level={4} />
            ))}
          </div>
        </section>
        <Demo />
        <section
          aria-labelledby="home-explorations"
          className={styles.group}
          data-group="explorations"
        >
          <h3 id="home-explorations" className={styles.groupTitle}>
            {GROUP_LABEL.explorations}
          </h3>
          <GroupBody group="explorations" />
        </section>
        <div className={styles.folds}>
          {FOLDED.map((key) => (
            <section
              key={key}
              aria-labelledby={`home-${key}`}
              className={styles.group}
              data-group={key}
            >
              <details className={styles.fold}>
                <summary className={styles.foldSummary}>
                  <h3 id={`home-${key}`} className={styles.groupTitle}>
                    {GROUP_MARK[key] ? (
                      <span className={styles.sectionMark} aria-hidden="true">
                        <Mark mark={GROUP_MARK[key]} />
                      </span>
                    ) : null}
                    <span>{GROUP_LABEL[key]}</span>
                  </h3>
                  <svg
                    className={styles.foldChevron}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <div className={styles.foldBody}>
                  <GroupBody group={key} />
                </div>
              </details>
            </section>
          ))}
        </div>
      </section>
    </>
  );
}

function AvisWork() {
  return (
    <article className={styles.showcase} data-item="avis">
      <div className={styles.showcaseHead}>
        <h3 className={styles.showcaseHeading}>
          <Link className={styles.showcaseName} href="/work/avis">
            <AvisLogo className={styles.productMark} />
            <span>3-Step Checkout</span>
          </Link>
        </h3>
        <GoLink
          href="/work/avis"
          label="View the Avis checkout case study"
          caption="View case study"
          short="Case study"
        />
      </div>
      <p className={styles.what}>
        Taking car rental booking from five steps to three.
      </p>
      <dl className={styles.facts}>
        <div>
          <dt>Type</dt>
          <dd>Checkout, web</dd>
        </div>
        <div>
          <dt>Role</dt>
          <dd>Product design, checkout</dd>
        </div>
        <div>
          <dt>Result</dt>
          <dd>Conversion up 5% in testing</dd>
        </div>
      </dl>
      <Lead
        src="/home/leads/avis.jpg"
        action="Play film"
        label="Play the Avis 3-step checkout film"
      >
        <video
          className={styles.film}
          src={media("/work/avis/avis-3-step-c.mp4")}
          poster={POSTERS.avis}
          aria-label="Booking an Avis car in three steps, ending on the review and checkout page"
          controls
          playsInline
          preload="none"
        />
      </Lead>
    </article>
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
      <path d="M9.5 7v2.25a1.25 1.25 0 01-1.25 1.25h-5.5A1.25 1.25 0 011.5 9.25v-5.5A1.25 1.25 0 012.75 2.5H5" />
      <path d="M7 1.5h3.5V5M10.5 1.5L6 6" />
    </svg>
  );
}

const LEADS: Partial<
  Record<
    string,
    {
      action: string;
      label: string;
      kind?: "look";
      corner?: "left";
    }
  >
> = {
  makeebook: {
    action: "Play film",
    label: "Play the makeebook film",
    corner: "left",
  },
  Spark: { action: "Play film", label: "Play the Spark film" },
  Podium: { action: "Play trailer", label: "Play the Podium trailer" },
  "Chess Path": { action: "Play film", label: "Play the Chess Path film" },
  coverly: { action: "Play film", label: "Play the coverly film" },
  DoodleWire: {
    action: "See the screens",
    label: "See the DoodleWire screens",
    kind: "look",
  },
};

function ShowcaseMedia({ title }: { title: string }) {
  const lead = LEADS[title];
  const media = ShowcaseFilm({ title });
  if (!lead || !media) return media;
  return (
    <Lead
      src={`/home/leads/${slug(title)}.jpg`}
      action={lead.action}
      label={lead.label}
      kind={lead.kind}
      corner={lead.corner}
    >
      {media}
    </Lead>
  );
}

function ShowcaseFilm({ title }: { title: string }) {
  if (title === "makeebook")
    return (
      <video
        className={styles.film}
        src={media("/home/makeebook-promo.mp4")}
        poster={POSTERS.makeebook}
        aria-label="makeebook product film"
        controls
        playsInline
        preload="none"
      />
    );
  if (title === "Spark")
    return (
      <>
        <video
          className={styles.film}
          src={media("/home/spark-promo.mp4")}
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
        <video
          className={styles.film}
          src={media("/home/podium/trailer-02.mp4")}
          poster={POSTERS.podium}
          aria-label="Podium trailer"
          controls
          playsInline
          preload="none"
        />
      </>
    );
  if (title === "coverly")
    return (
      <video
        className={styles.film}
        src={media("/home/coverly-promo.mp4")}
        poster={POSTERS.coverly}
        aria-label="coverly product film"
        controls
        playsInline
        preload="none"
      />
    );
  if (title === "DoodleWire") return <DoodleWireShots />;
  if (title === "Chess Path")
    return (
      <video
        className={styles.film}
        src="/home/chess-path.mp4"
        poster={POSTERS.chessPath}
        aria-label="Chess Path film: the home page, the path of seven stages, then a lesson where a pawn forks a knight and a rook"
        controls
        playsInline
        preload="none"
      />
    );
  return null;
}

const CASE_STUDY: Partial<Record<string, string>> = {
  makeebook: "/work/makeebook",
  coverly: "/work/coverly",
  DoodleWire: "/work/doodlewire",
};

export function Showcase({ work, level = 3 }: { work: Work; level?: 3 | 4 }) {
  const Heading = level === 3 ? "h3" : "h4";
  const info = SHOWCASE[work.title];
  if (!info) return null;
  const external = work.href.startsWith("http");
  const study = CASE_STUDY[work.title];
  const linkProps = external ? { target: "_blank", rel: "noreferrer" } : {};

  return (
    <article className={styles.showcase} data-item={slug(work.title)}>
      <div className={styles.showcaseHead}>
        {work.href ? (
          <Heading className={styles.showcaseHeading}>
            <a className={styles.showcaseName} href={work.href} {...linkProps}>
              {info.mark ? (
                <ProductMark mark={info.mark} className={styles.productMark} />
              ) : null}
              <span translate="no">{work.title}</span>
            </a>
          </Heading>
        ) : (
          <Heading className={styles.showcaseName}>
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
          </Heading>
        )}
        {work.href && info.label ? (
          <span className={styles.goGroup}>
            {study ? (
              <GoLink
                href={study}
                label={`View the ${work.title} case study`}
                caption="View case study"
                short="Case study"
              />
            ) : null}
            <GoLink
              href={work.href}
              newTab={external}
              label={
                appStore(work.href)
                  ? `${work.title} on the App Store`
                  : external
                    ? info.label
                    : study
                      ? `Use ${work.title}`
                      : `Open ${work.title}`
              }
              lead={
                appStore(work.href) ? (
                  <AppleIcon className={styles.goApple} />
                ) : undefined
              }
              caption={
                appStore(work.href)
                  ? "App Store"
                  : external
                    ? undefined
                    : study
                      ? `Use ${work.title}`
                      : work.title === "Spark" || work.title === "Chess Path"
                        ? "Open"
                        : undefined
              }
              short={study && !external ? `Open ${work.title}` : undefined}
            />
          </span>
        ) : null}
        {work.title === "Podium" ? <PodiumGallery /> : null}
      </div>
      <p className={styles.what}>{info.what}</p>
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

export function Covers() {
  return (
    <article
      className={styles.showcase}
      data-group="covers"
      data-item="book-covers"
    >
      <div className={styles.showcaseHead}>
        <h3 className={styles.showcaseHeading}>
          <span className={styles.showcaseName}>
            <span className={styles.nameMark} aria-hidden="true">
              <Mark mark="book" />
            </span>
            <span>Book covers</span>
          </span>
        </h3>
        <GoLink
          href="https://banneroftruth.org/uk/store/new-release/the-childs-story-bible/"
          newTab
          label="The Child’s Story Bible at the Banner of Truth"
          caption="Publisher"
        />
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
      <Lead
        src="/home/leads/book-covers.jpg"
        action="See the covers"
        label="See the three book covers"
        kind="look"
      >
        <CoverShelf />
      </Lead>
    </article>
  );
}

export function Paintings() {
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
            <h4 className={styles.plaqueTitle}>
              <i>{painting.title}</i>, {painting.year}
            </h4>
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

export function Demo() {
  return (
    <section
      className={styles.group}
      aria-labelledby="home-demo"
      data-group="demo"
    >
      <h3 id="home-demo" className={styles.groupTitle}>
        Demo on Dive Radio
      </h3>
      <article className={styles.showcase}>
        <div className={styles.showcaseHead}>
          <h4 className={styles.showcaseHeading}>
            <span className={styles.showcaseName}>
              <span className={styles.nameMark} aria-hidden="true">
                <Mark mark="speakui" />
              </span>
              <span>SpeakUI</span>
            </span>
          </h4>
        </div>
        <AutoVideo
          className={styles.film}
          src={media("/home/dive-radio-jit.mp4")}
          poster={POSTERS.diveRadio}
          aria-label="Dive Radio, Just-in-Time Interfaces"
          controls
          muted
          loop
          playsInline
          preload="none"
        />
        <details className={styles.demoAbout}>
          <summary>
            About this demo
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
          <p className={styles.demoNote}>
            Inspired by{" "}
            <a className={styles.handle} href="https://x.com/Moore">
              @Moore
            </a>
            , I built a simple SpeakUI demo showcasing how Jev, TypeSafe
            AI&rsquo;s new fast decision model, makes voice-driven design edits
            feel almost realtime. Demo played on Dive Radio&rsquo;s Just-in-Time
            Interfaces episode by{" "}
            <a className={styles.handle} href="https://x.com/designertom">
              @designertom
            </a>{" "}
            and{" "}
            <a className={styles.handle} href="https://x.com/ridd_design">
              @ridd_design
            </a>
            , 24 September 2026.
          </p>
        </details>
      </article>
    </section>
  );
}

export function ExplorationCard({ work }: { work: Work }) {
  if (work.title === "Game Boy") return <GameBoyCard work={work} />;
  if (work.title === "Record player") return <RecordPlayerCard work={work} />;
  if (work.title === "Self-healing checkout")
    return <CheckoutCard work={work} />;
  if (work.title === "Creature capture") return <CaptureCard work={work} />;
  if (work.title === "Logo Animator Studio")
    return <LogoStudioCard work={work} />;
  return (
    <article className={styles.showcase} data-item={slug(work.title)}>
      <div className={styles.showcaseHead}>
        <p className={styles.what}>{work.title}</p>
        <GoLink
          href={work.href}
          label={`Open the ${work.title} lab`}
          caption="Explore"
        />
      </div>
      <Lead
        src="/home/leads/n-particles.jpg"
        action="Play preview"
        label="Play the N particles preview"
        corner="left"
      >
        <a
          className={styles.previewLink}
          href={work.href}
          aria-label={`Open the ${work.title} lab, full screen`}
        >
          <ExplorationPreview />
        </a>
      </Lead>
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

function CaptureCard({ work }: { work: Work }) {
  return (
    <article className={styles.showcase} data-item={slug(work.title)}>
      <div className={styles.showcaseHead}>
        <p className={styles.what}>{work.title}</p>
        <GoLink
          href={work.href}
          label="Open the creature capture exploration"
          caption="Explore"
        />
      </div>
      <Lead
        src="/home/leads/creature-capture.jpg"
        action="Play preview"
        label="Play the creature capture preview"
      >
        <a
          className={styles.previewLink}
          href={work.href}
          aria-label="Open the creature capture exploration, full screen"
        >
          <AutoVideo
            className={`${styles.film} ${styles.filmLight}`}
            src={media("/home/creature-capture.mp4")}
            poster="/home/creature-capture.jpg"
            aria-label="The rigged 3D dragon roaring, its motion fitted from an AI video"
            muted
            loop
            playsInline
            preload="none"
          />
        </a>
      </Lead>
      <p className={styles.caption}>
        Made with{" "}
        <a
          className={styles.handle}
          href="https://github.com/Patch-gg/anymove"
          target="_blank"
          rel="noopener noreferrer"
        >
          anymove
        </a>{" "}
        by{" "}
        <a
          className={styles.handle}
          href="https://x.com/patch_gg"
          target="_blank"
          rel="noopener noreferrer"
        >
          Patch
        </a>
      </p>
    </article>
  );
}

function GameBoyCard({ work }: { work: Work }) {
  return (
    <article className={styles.showcase} data-item={slug(work.title)}>
      <div className={styles.showcaseHead}>
        <p className={styles.what}>{work.title}</p>
        <GoLink
          href={work.href}
          label="Open the Game Boy navigation exploration"
          caption="Explore"
        />
      </div>
      <Lead
        src="/home/leads/game-boy.jpg"
        action="Play preview"
        label="Play the Game Boy preview"
      >
        <a
          className={styles.previewLink}
          href={work.href}
          aria-label="Open the Game Boy navigation exploration, full screen"
        >
          <AutoVideo
            className={styles.film}
            src={media("/home/gameboy-portfolio.mp4")}
            poster="/home/gameboy-portfolio.jpg"
            aria-label="Scrolling through the portfolio menu on the Game Boy"
            muted
            loop
            playsInline
            preload="none"
          />
        </a>
      </Lead>
      <p className={styles.caption}>
        Remixed from{" "}
        <a
          className={styles.handle}
          href="https://ask.jig.com/j/mVwDz2UfKSat"
          target="_blank"
          rel="noopener noreferrer"
        >
          Numa&rsquo;s Game Boy
        </a>{" "}
        on{" "}
        <a
          className={styles.handle}
          href="https://ask.jig.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Jig
        </a>
      </p>
    </article>
  );
}

function RecordPlayerCard({ work }: { work: Work }) {
  return (
    <article className={styles.showcase} data-item={slug(work.title)}>
      <div className={styles.showcaseHead}>
        <p className={styles.what}>{work.title}</p>
        <GoLink
          href={work.href}
          label="Open the record player exploration"
          caption="Explore"
        />
      </div>
      <Lead
        src="/home/leads/record-player.jpg"
        action="Play preview"
        label="Play the record player preview"
        corner="left"
      >
        <a
          className={styles.previewLink}
          href={work.href}
          aria-label="Open the record player exploration, full screen"
        >
          <AutoVideo
            className={styles.film}
            src={media("/home/record-player.mp4")}
            poster="/home/record-player.jpg"
            aria-label="Opening the record player, putting on an LP and looking inside"
            muted
            loop
            playsInline
            preload="none"
          />
        </a>
      </Lead>
      <p className={styles.caption}>
        Made with{" "}
        <a
          className={styles.handle}
          href="https://april-zhu.com/colorfigures"
          target="_blank"
          rel="noopener noreferrer"
        >
          Colorfigures
        </a>{" "}
        by{" "}
        <a
          className={styles.handle}
          href="https://x.com/Aprilzz423"
          target="_blank"
          rel="noopener noreferrer"
        >
          April Zhu
        </a>
      </p>
    </article>
  );
}

function LogoStudioCard({ work }: { work: Work }) {
  return (
    <article className={styles.showcase} data-item={slug(work.title)}>
      <div className={styles.showcaseHead}>
        <p className={styles.what}>{work.title}</p>
        <GoLink
          href={work.href}
          label="Open Logo Animator Studio"
          caption="Explore"
        />
      </div>
      <Lead
        src="/home/leads/logo-animator-studio.jpg"
        action="Play preview"
        label="Play the Logo Animator Studio preview"
      >
        <a
          className={styles.previewLink}
          href={work.href}
          aria-label="Open Logo Animator Studio, full screen"
        >
          <AutoVideo
            className={styles.film}
            src={media("/home/logo-animator-studio.mp4")}
            poster="/home/logo-animator-studio.jpg"
            aria-label="A glass logo animating at the centre of rings of dials, with simulated agents listed beside it"
            muted
            loop
            playsInline
            preload="none"
          />
        </a>
      </Lead>
    </article>
  );
}

function CheckoutCard({ work }: { work: Work }) {
  return (
    <article className={styles.showcase} data-item={slug(work.title)}>
      <div className={styles.showcaseHead}>
        <p className={styles.what}>{work.title}</p>
        <GoLink
          href={work.href}
          label="Open the self-healing checkout exploration"
          caption="Explore"
        />
      </div>
      <Lead
        src="/home/leads/self-healing-checkout.jpg"
        action="Play preview"
        label="Play the self-healing checkout preview"
      >
        <a
          className={styles.previewLink}
          href={work.href}
          aria-label="Open the self-healing checkout exploration, full screen"
        >
          <AutoVideo
            className={`${styles.film} ${styles.filmLight}`}
            src={media("/home/self-healing-checkout-v2.mp4")}
            poster="/home/self-healing-checkout-v2.jpg"
            aria-label="A checkout pay button hidden under the browser toolbar, then the fix being approved and the button sliding into view"
            muted
            loop
            playsInline
            preload="none"
          />
        </a>
      </Lead>
    </article>
  );
}
