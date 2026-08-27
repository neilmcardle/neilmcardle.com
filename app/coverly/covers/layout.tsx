import { CoverlyAppHeader } from "../app-header";

export default function CoversLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col bg-background">
      <CoverlyAppHeader />
      <div id="coverly-main">{children}</div>
    </div>
  );
}
