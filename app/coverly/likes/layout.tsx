import { CoverlyAppHeader } from "../app-header";

export default function LikesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col bg-background">
      <CoverlyAppHeader />
      <main id="coverly-main">{children}</main>
    </div>
  );
}
