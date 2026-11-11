import Link from "next/link";
import BackLink from "@/components/BackLink";
import TesseraGame from "./Game";
import s from "./tessera.module.css";

export default function TesseraPage() {
  return (
    <TesseraGame
      back={<BackLink className={s.back}>Back to neilmcardle.com</BackLink>}
      lede={
        <p className={s.lede}>
          <span className={s.subject}>
            I made Tessera as a quiet dice game for two.
          </span>{" "}
          Roll the die, draw that many lines and close triangles to claim them.
          Whoever holds the most triangles when the board is full wins.
        </p>
      }
      foot={
        <nav className={s.foot} aria-label="Tessera">
          <Link className={s.back} href="/tessera/support">
            Support
          </Link>
          <Link className={s.back} href="/tessera/privacy">
            Privacy
          </Link>
        </nav>
      }
    />
  );
}
