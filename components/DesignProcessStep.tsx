interface DesignProcessStepProps {
  number: string
  title: string
  description: string
}

export function DesignProcessStep({ number, title, description }: DesignProcessStepProps) {
  return (
    <div className="p-4 border border-gray-100 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300">
      <div className="text-2xl font-bold text-blue-600 mb-2">{number}</div>
      <h3 className="text-lg font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}
