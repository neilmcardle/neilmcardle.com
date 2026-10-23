import Image from "next/image";
import Link from "next/link";
import styles from "./portfolio-home.module.css";

const work = [
  {
    href: "/work/makeebook",
    number: "01",
    title: "makeebook",
    type: "A calm writing tool",
    description:
      "An eBook editor for writers who want to stay with the work, not wrestle with the software.",
    image: "/work/makeebook/editor.jpg",
    alt: "makeebook editor interface",
    tone: "olive",
  },
  {
    href: "/work/coverly",
    number: "02",
    title: "coverly",
    type: "A visual research library",
    description:
      "A faster way for book designers to find, compare and talk about the covers that set the tone.",
    image: "/work/coverly/cover-count-plain.jpg",
    alt: "coverly cover research library",
    tone: "cream",
  },
  {
    href: "/work/doodlewire",
    number: "03",
    title: "DoodleWire",
    type: "A tool for thinking in public",
    description:
      "A flexible wireframing space that turns rough ideas into something a team can respond to.",
    image: "/work/doodlewire/hero.jpg",
    alt: "DoodleWire wireframing workspace",
    tone: "blue",
  },
];

export default function PortfolioHome() {
  return (
    <div className={styles.site}>
      <header className={styles.nav}>
        <Link
          href="/"
          className={styles.wordmark}
          aria-label="Neil McArdle home"
        >
          Neil McArdle<span>.</span>
        </Link>
        <nav aria-label="Main navigation">
          <a href="#work">Work</a>
          <a href="#approach">Approach</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className={styles.availability} href="mailto:neil@neilmcardle.com">
          Say hello <span>↗</span>
        </a>
      </header>

      <main>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>
            Product designer &amp; builder · London
          </p>
          <h1>
            I make complicated things <em>clear.</em>
          </h1>
          <div className={styles.heroBottom}>
            <p className={styles.lede}>
              I work across product, interaction and code — shaping useful
              digital tools from the first question to the last detail.
            </p>
            <a className={styles.textLink} href="#work">
              See selected work <span>↓</span>
            </a>
          </div>
        </section>

        <section
          id="work"
          className={styles.workSection}
          aria-labelledby="work-heading"
        >
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>Selected work</p>
            <h2 id="work-heading">Products with a point of view.</h2>
            <p>
              Some are client work. Some are things I made because the problem
              was interesting enough to keep going.
            </p>
          </div>
          <div className={styles.workList}>
            {work.map((item) => (
              <Link
                href={item.href}
                className={`${styles.project} ${styles[item.tone]}`}
                key={item.title}
              >
                <div className={styles.projectMeta}>
                  <span>{item.number}</span>
                  <span>{item.type}</span>
                </div>
                <div className={styles.projectImage}>
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 700px) 100vw, 62vw"
                  />
                </div>
                <div className={styles.projectCopy}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <span className={styles.arrow}>View case study ↗</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section
          id="approach"
          className={styles.approach}
          aria-labelledby="approach-heading"
        >
          <p className={styles.eyebrow}>How I work</p>
          <div className={styles.approachGrid}>
            <h2 id="approach-heading">
              Good work is a series of useful decisions.
            </h2>
            <div className={styles.approachText}>
              <p>
                I bring structure to ambiguous problems. That means getting
                close to the people using a product, making the invisible
                constraints visible, and testing the important parts early.
              </p>
              <p>
                I care about the handover less than the outcome. I prototype in
                code when it helps, work closely with engineers, and stay with
                the details until the thing feels inevitable.
              </p>
            </div>
          </div>
          <ul className={styles.principles}>
            <li>
              <span>01</span>Find the real problem
            </li>
            <li>
              <span>02</span>Make the complex legible
            </li>
            <li>
              <span>03</span>Leave the product better than I found it
            </li>
          </ul>
        </section>

        <section
          id="contact"
          className={styles.contact}
          aria-labelledby="contact-heading"
        >
          <p className={styles.eyebrow}>A good place to finish</p>
          <h2 id="contact-heading">Have a difficult product problem?</h2>
          <a className={styles.contactLink} href="mailto:neil@neilmcardle.com">
            neil@neilmcardle.com <span>↗</span>
          </a>
          <div className={styles.contactFoot}>
            <span>Neil McArdle</span>
            <span>Product design, systems, software</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </section>
      </main>
    </div>
  );
}
