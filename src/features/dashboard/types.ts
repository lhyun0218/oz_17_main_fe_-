export interface CourseCard {
  id: string
  title: string
  professorName: string
  progressRate: number // 0~100
  thumbnailUrl?: string | null
}

export interface AssignmentItem {
  id: string
  title: string
  courseName: string
  dueDate: string // ISO 8601
  isSubmitted: boolean
}

export interface AttendanceSummary {
  attendedCount: number
  totalCount: number
  rate: number // 0~100
}

export interface WeeklyStudyData {
  date: string // YYYY-MM-DD
  studyMinutes: number
}

export interface DashboardData {
  courses: CourseCard[]
  assignments: AssignmentItem[]
  attendance: AttendanceSummary
  weeklyStudy: WeeklyStudyData[]
}
