'use client'

import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'
import type { ToolProps } from '@/app/kids-academy/types/curriculum'
import { LoadingSkeleton } from '@/app/kids-academy/components/ui/loading-skeleton'

type ToolComponent = ComponentType<ToolProps>

const loading = () => <LoadingSkeleton variant="tool" className="px-6 py-8 max-w-3xl w-full mx-auto" />

export const TOOL_REGISTRY: Record<string, ToolComponent> = {
  'y3-science-light':  dynamic(() => import('./science/year-3/light-and-shadows'), { loading }),
  'y3-science-forces': dynamic(() => import('./science/year-3/forces-and-magnets'), { loading }),
}

export function getTool(toolId: string): ToolComponent | undefined {
  return TOOL_REGISTRY[toolId]
}
