import styles from "./intro.module.css";

const ONCE = `try{var d=document.documentElement;if(sessionStorage.getItem("nm-intro")||matchMedia("(prefers-reduced-motion: reduce)").matches){d.dataset.intro="skip"}else{sessionStorage.setItem("nm-intro","1");d.dataset.intro="play"}}catch(e){document.documentElement.dataset.intro="skip"}`;

export default function Intro({ fast = false }: { fast?: boolean }) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: fast
            ? `${ONCE};document.documentElement.dataset.introFast="1"`
            : ONCE,
        }}
      />
      <div
        className={`${styles.intro} ${fast ? styles.fast : ""}`}
        aria-hidden="true"
      >
        <svg viewBox="18 18 27 27" className={styles.mark}>
          <path d="M45 45L32 31.2985V18H45V45Z" />
          <path d="M18 18L32 31.6343L32 45L18 45L18 18Z" />
        </svg>
      </div>
    </>
  );
}
