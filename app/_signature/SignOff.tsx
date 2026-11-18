import Contact from "../_home/Contact";
import home from "../_home/home.module.css";
import shell from "./signature.module.css";
import ToTop from "./ToTop";

export default function SignOff({ bare }: { bare?: boolean }) {
  return (
    <div className={bare ? undefined : `${shell.wrap} ${home.signOff}`}>
      <section id="contact" className={home.section}>
        <h2 className={home.label}>Contact</h2>
        <p className={home.tell}>Tell me more.</p>
        <Contact />
      </section>
      <footer className={home.sign}>
        <span className={home.signName}>
          <img src="/home/face-small.png" alt="" width={78} height={144} />
          Neil McArdle, 2026
        </span>
        <ToTop className={home.toTop} />
      </footer>
    </div>
  );
}
