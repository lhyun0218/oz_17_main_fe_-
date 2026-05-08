import apiClient from '../../../lib/axios'
import type { AssignmentDetail } from '../types'

/**
 * 과제 상세 정보를 조회한다.
 * GET /assignments/:id
 */
export async function getAssignment(id: string): Promise<AssignmentDetail> {
  const response = await apiClient.get<AssignmentDetail>(`/assignments/${id}`)
  return response.data
}

/**
 * 과제를 제출한다.
 * POST /assignments/:id/submit (multipart/form-data)
 */
export async function submitAssignment(
  assignmentId: string,
  textContent: string,
  files: File[],
): Promise<void> {
  const formData = new FormData()

  if (textContent) {
    formData.append('textContent', textContent)
  }

  files.forEach((file) => {
    formData.append('files', file)
  })

  await apiClient.post(`/assignments/${assignmentId}/submit`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
