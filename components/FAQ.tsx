"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

interface FAQItem {
  question: string
  answer: string
}

interface FAQProps {
  questions: FAQItem[]
}

export function FAQ({ questions }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="space-y-4">
      {questions.map((item, index) => (
        <div
          key={index}
          className={`border rounded-lg overflow-hidden ${openIndex === index ? "border-gray-400" : "border-gray-200"}`}
        >
          <button
            className="flex justify-between items-center w-full p-6 text-left bg-white hover:bg-gray-50 transition-colors"
            onClick={() => toggleQuestion(index)}
          >
            <span className="font-bold text-lg">{item.question}</span>
            {openIndex === index ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          {openIndex === index && (
            <div className="p-6 pt-0 text-gray-600">
              <p>{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

