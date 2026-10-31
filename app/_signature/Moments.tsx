import shell from "./signature.module.css";
import styles from "./moments.module.css";

function Who({
  href,
  name,
  handle,
}: {
  href: string;
  name: string;
  handle: string;
}) {
  return (
    <p className={styles.who}>
      <a href={href}>
        <span className={styles.name}>{name}</span> <span>{handle}</span>
      </a>
    </p>
  );
}

export default function Moments() {
  return (
    <section className={`${shell.wrap} ${styles.section}`}>
      <h2 className={shell.label}>Moments</h2>
      <div className={styles.moments}>
        <div className={styles.moment}>
          <a
            className={styles.frame}
            href="https://x.com/BetterNeil/status/2103252962009284632"
            aria-label="Watch the SpeakUI demo clip from Dive Radio on X"
          >
            <img
              src="/home/dive-radio-jit.jpg"
              width={1280}
              height={720}
              loading="lazy"
              decoding="async"
              alt="Dive Radio's Just-in-Time Interfaces episode"
            />
            <span className={styles.tag}>Watch the clip</span>
          </a>
          <div>
            <p className={styles.app}>SpeakUI</p>
            <p className={styles.lede}>My voice-driven UI editor.</p>
            <p className={styles.quote}>“Demo available?”</p>
            <Who
              href="https://x.com/designertom/status/2103142665445605845"
              name="Tommy Geoco"
              handle="@designertom on X"
            />
            <div className={styles.reply}>
              <p className={styles.quote}>“Thank you for sharing!!”</p>
              <Who
                href="https://x.com/ridd_design/status/2103261131808854228"
                name="Ridd"
                handle="@ridd_design, co-host"
              />
            </div>
          </div>
        </div>
        <div className={styles.moment}>
          <a
            className={styles.frame}
            href="https://x.com/designertom/status/2107851337434087724"
            aria-label="See the Bedside Books post on X"
          >
            <img
              src="https://pbs.twimg.com/media/HUCCxCoX0AA8Xn8?format=webp&name=large"
              loading="lazy"
              decoding="async"
              alt="A Bedside Books page: a short story beside an illustration of a boy searching under his bed"
            />
          </a>
          <div>
            <p className={styles.app}>Bedside Books</p>
            <p className={styles.lede}>
              Where a parent and child make a picture book together.
            </p>
            <p className={styles.quote}>“This is magical dude.”</p>
            <Who
              href="https://x.com/designertom/status/2107851337434087724"
              name="Tommy Geoco"
              handle="@designertom on X"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
