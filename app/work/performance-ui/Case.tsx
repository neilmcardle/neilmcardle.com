import PuiMark from "../../_signature/PuiMark";
import styles from "../case.module.css";
import CaseStudy from "../CaseStudy";
import Story from "../Story";
import { PERFORMANCE_UI } from "./chapters";
import pui from "./pui.module.css";

export default function PerformanceUiCase({ home }: { home?: string }) {
  return (
    <CaseStudy
      home={home}
      hero={
        <section
          className={`${styles.hero} ${pui.hero}`}
          aria-label="Performance UI"
        >
          <div className={pui.heroInner}>
            <PuiMark className={pui.heroMark} />
            <p className={pui.heroName}>Performance UI</p>
            <p className={pui.heroLine}>A design system written for agents</p>
          </div>
        </section>
      }
      overview="Performance UI is a design system written for agents. It gives an agent the colours, sizes, motion and page budgets for fast interfaces, with the reason behind every rule. I made it from 141 decisions in a picker I built, along with Looks UI, the layer this site uses on top of it."
      facts={[
        { label: "When", value: "2026" },
        { label: "Role", value: "Design and writing, solo" },
        { label: "Price", value: "Free" },
      ]}
      brief={<Story chapters={PERFORMANCE_UI} />}
      frames={[]}
    />
  );
}
