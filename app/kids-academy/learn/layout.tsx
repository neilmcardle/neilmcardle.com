export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main id="main" className="h-dvh flex flex-col bg-slate-50 overflow-hidden">
      {children}
    </main>
  );
}
