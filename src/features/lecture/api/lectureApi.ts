import apiClient from '../../../lib/axios'
import type { CourseOutline, ChatMessage } from '../types'

export const getCourseOutline = async (courseId: string): Promise<CourseOutline> => {
  const response = await apiClient.get<CourseOutline>(`/courses/${courseId}/outline`)
  return response.data
}

export const recordAttendance = async (lectureId: string): Promise<void> => {
  await apiClient.post(`/lectures/${lectureId}/attendance`)
}

export const getChatMessages = async (courseId: string): Promise<ChatMessage[]> => {
  const response = await apiClient.get<ChatMessage[]>(`/chat/${courseId}/messages`)
  return response.data
}

export const sendChatMessage = async (
  courseId: string,
  content: string
): Promise<ChatMessage> => {
  const response = await apiClient.post<ChatMessage>(`/chat/${courseId}/messages`, { content })
  return response.data
}
