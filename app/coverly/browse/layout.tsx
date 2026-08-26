import { CoverlyAppHeader } from "../app-header";

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col bg-background">
      <CoverlyAppHeader />
      {children}
    </div>
  );
}
