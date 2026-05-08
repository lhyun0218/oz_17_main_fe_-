export interface LectureItem {
  id: string
  title: string
  durationSeconds: number
  isCompleted: boolean
  videoUrl: string
}

export interface WeekGroup {
  weekNumber: number
  title: string
  lectures: LectureItem[]
}

export interface CourseOutline {
  courseId: string
  title: string
  weeks: WeekGroup[]
}

export interface ChatMessage {
  id: string
  authorName: string
  content: string
  createdAt: string
}
