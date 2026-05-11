import { http, HttpResponse } from 'msw'
import { getEnrollmentDB, getCourseDB, getGradeDB } from '../fixtures/db'

export const gradeHandlers = [
  http.get('/grades', ({ request }) => {
    const auth = request.headers.get('Authorization') ?? ''
    const studentId = auth.replace('Bearer mock-jwt-token-', '') || '20240001'

    const enrollments = getEnrollmentDB().filter((e) => e.studentId === studentId)
    const courses = getCourseDB()
    const grades = getGradeDB()

    const result = enrollments.map((e) => {
      const course = courses.find((c) => c.courseId === e.courseId)
      const grade = grades.find((g) => g.studentId === studentId && g.courseId === e.courseId)
      return {
        courseId: e.courseId,
        courseName: course?.title ?? '',
        professorName: course?.professorName ?? '',
        credits: course?.credits ?? 3,
        semester: e.semester,
        score: grade?.score ?? null,
        gradeStr: grade?.gradeStr ?? null,
        gpa: grade?.gpa ?? null,
      }
    })

    return HttpResponse.json(result)
  }),
]
