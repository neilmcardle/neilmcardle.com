export type ToolProgress = {
  status: 'not_started' | 'in_progress' | 'completed'
  percentage: number
  timeSpentSeconds: number
  lastAccessed: string
  completedAt?: string
}

export type ProgressMap = Record<string, ToolProgress>

const STORAGE_KEY = 'ka_progress'

const EMPTY: ToolProgress = {
  status: 'not_started',
  percentage: 0,
  timeSpentSeconds: 0,
  lastAccessed: '',
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readMap(): ProgressMap {
  if (!isBrowser()) return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as ProgressMap) : {}
  } catch {
    return {}
  }
}

function writeMap(map: ProgressMap): void {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    // Storage quota or private mode — silently no-op.
  }
}

export function getProgress(toolId: string): ToolProgress {
  const map = readMap()
  return map[toolId] ?? { ...EMPTY }
}

export function setProgress(toolId: string, patch: Partial<ToolProgress>): ToolProgress {
  const map = readMap()
  const current = map[toolId] ?? { ...EMPTY }
  const next: ToolProgress = {
    ...current,
    ...patch,
    lastAccessed: new Date().toISOString(),
  }
  if (patch.status === 'completed' && !current.completedAt) {
    next.completedAt = next.lastAccessed
    next.percentage = 100
  }
  map[toolId] = next
  writeMap(map)
  return next
}

export function getAllProgress(): ProgressMap {
  return readMap()
}

export function resetProgress(toolId?: string): void {
  if (!isBrowser()) return
  if (!toolId) {
    window.localStorage.removeItem(STORAGE_KEY)
    return
  }
  const map = readMap()
  delete map[toolId]
  writeMap(map)
}
