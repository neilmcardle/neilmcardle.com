export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh flex flex-col bg-slate-50 overflow-hidden">
      {children}
    </div>
  )
}
