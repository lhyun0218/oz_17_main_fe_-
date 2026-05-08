export interface AssignmentDetail {
  id: string
  title: string
  courseName: string
  description: string
  dueDate: string // ISO 8601
  isSubmitted: boolean
  submittedAt?: string
}

export interface AssignmentSubmitRequest {
  assignmentId: string
  textContent?: string
  files: File[]
}
