import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";

// next/link shim for the Capacitor build. There's no router in the iOS app,
// so any in-product link becomes an inert <a>. The original "back to
// neilmcardle.com" arrow still renders but doesn't navigate — we'll hide it
// in a follow-up polish pass.
interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  children?: ReactNode;
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, children, onClick, ...rest },
  ref,
) {
  return (
    <a
      ref={ref}
      href={href}
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </a>
  );
});

export default Link;
