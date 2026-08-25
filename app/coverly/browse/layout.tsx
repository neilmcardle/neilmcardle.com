import { CoverlyAppHeader } from "../app-header";

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <CoverlyAppHeader />
      {children}
    </div>
  );
}
