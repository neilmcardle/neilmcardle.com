import styles from "../case.module.css";
import CaseStudy from "../CaseStudy";
import Story from "../Story";
import { CASES } from "../cases";
import { STUDIO } from "./chapters";
import Pile from "./Pile";

export default function StudioCase({ home }: { home?: string }) {
  return (
    <CaseStudy
      home={home}
      hero={
        <section className={styles.hero} aria-label="The studio">
          <Pile />
        </section>
      }
      facts={[
        { label: "When", value: CASES["studio"].when },
        { label: "Built with", value: "Claude Code" },
      ]}
      overview={CASES["studio"].overview}
      brief={<Story chapters={STUDIO} />}
      frames={[]}
    />
  );
}
