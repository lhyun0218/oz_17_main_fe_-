import { http, HttpResponse } from 'msw'
import { mockCourses } from '../fixtures/courses'
import { mockAssignments } from '../fixtures/assignments'

// 주간 학습 데이터 생성 (최근 7일)
const generateWeeklyStudyData = () => {
  const data = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    data.push({
      date: dateStr,
      studyMinutes: i === 0 ? 0 : Math.floor(Math.random() * 120) + 10,
    })
  }
  return data
}

export const dashboardHandlers = [
  // GET /dashboard
  http.get('/dashboard', () => {
    return HttpResponse.json({
      courses: mockCourses,
      assignments: mockAssignments,
      attendance: {
        attendedCount: 53,
        totalCount: 60,
        rate: 88.2,
      },
      weeklyStudy: generateWeeklyStudyData(),
    })
  }),

  // GET /courses
  http.get('/courses', () => {
    return HttpResponse.json(mockCourses)
  }),
]
