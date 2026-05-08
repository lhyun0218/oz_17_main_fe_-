import { http, HttpResponse } from 'msw'
import { gradeDB, courseDB } from '../fixtures/db'

export const gradeHandlers = [
  // GET /grades — 로그인한 학생의 성적 (토큰에서 studentId 추출)
  // MSW 환경에서는 Authorization 헤더의 토큰으로 학번 식별
  http.get('/grades', ({ request }) => {
    const auth = request.headers.get('Authorization') ?? ''
    // 토큰 형식: mock-jwt-token-{studentId}
    const studentId = auth.replace('Bearer mock-jwt-token-', '') || '20240001'

    const grades = gradeDB
      .filter((g) => g.studentId === studentId)
      .map((g) => {
        const course = courseDB.find((c) => c.courseId === g.courseId)
        return {
          courseId: g.courseId,
          courseName: course?.title ?? '',
          professorName: course?.professorName ?? '',
          credits: course?.credits ?? 3,
          score: g.score,
          grade: g.gradeStr,
          semester: g.semester,
        }
      })

    return HttpResponse.json(grades)
  }),
]
