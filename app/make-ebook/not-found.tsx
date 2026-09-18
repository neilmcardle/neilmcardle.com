import Link from "next/link";
import { BrandPage } from "./components/marketing/brand/BrandPage";
import brand from "./components/marketing/brand/brand.module.css";
import ui from "./components/marketing/brand/page.module.css";

export const metadata = {
  title: "Page not found. makeebook",
  description:
    "The page you were looking for has wandered off. Head back to the editor or browse the blog.",
};

export default function NotFound() {
  return (
    <BrandPage>
      <main id="main-content" className={`${brand.shell} ${ui.status}`}>
        <div className={ui.statusCopy}>
          <p className={ui.statusEyebrow}>404. Page not found</p>
          <h1 className={ui.statusTitle}>
            This page didn&rsquo;t make it into the book.
          </h1>
          <p className={ui.statusBody}>
            The link you followed may be broken, or the page may have moved.
            Either way, the editor is still waiting.
          </p>
          <div className={ui.statusActions}>
            <Link href="/make-ebook" className={brand.cta}>
              Back to the homepage
            </Link>
            <Link href="/make-ebook/blog" className={brand.ctaGhost}>
              Read the blog
            </Link>
          </div>
        </div>
      </main>
    </BrandPage>
  );
}
