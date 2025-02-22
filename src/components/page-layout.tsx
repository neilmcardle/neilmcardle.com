export default function PageLayout({
    children,
    title,
    description
  }: {
    children: React.ReactNode
    title: string
    description?: string
  }) {
    return (
      <div className="p-8">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        {description && (
          <p className="text-lg text-gray-600 mb-8">{description}</p>
        )}
        {children}
      </div>
    )
  }