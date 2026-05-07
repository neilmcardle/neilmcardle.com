export type Subject = 'science' | 'maths' | 'english' | 'history' | 'geography'
export type YearGroup = 1 | 2 | 3 | 4 | 5 | 6
export type DifficultyLevel = 1 | 2 | 3
export type TopicStatus = 'planned' | 'built'

export type CurriculumTopic = {
  id: string
  yearGroup: YearGroup
  subject: Subject
  topic: string
  title: string
  ncObjectives: string[]
  estimatedMinutes: number
  difficultyLevel: DifficultyLevel
  hasAudioSupport: boolean
  status: TopicStatus
}

export type YearCurriculum = {
  yearGroup: YearGroup
  topics: CurriculumTopic[]
}

export type ChildProfile = {
  yearGroup: YearGroup
  accessibility: {
    dyslexicFont: boolean
  }
}

export type ToolResult = {
  score?: number
  durationSeconds: number
}

export type ToolProps = {
  childProfile: ChildProfile
  onProgress: (percentage: number) => void
  onComplete: (result: ToolResult) => void
}

export const DEFAULT_CHILD_PROFILE: ChildProfile = {
  yearGroup: 3,
  accessibility: {
    dyslexicFont: false,
  },
}
