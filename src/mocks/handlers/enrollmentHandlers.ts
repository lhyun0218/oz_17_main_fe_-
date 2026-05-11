import { http, HttpResponse } from 'msw'
import { courseDB, enrollmentDB, attendanceDB, persistDB } from '../fixtures/db'

export const enrollmentHandlers = [
  // GET /enrollment/available — 수강신청 가능한 전체 강의 목록
  http.get('/enrollment/available', ({ request }) => {
    const auth = request.headers.get('Authorization') ?? ''
    const studentId = auth.replace('Bearer mock-jwt-token-', '') || '20240001'

    const myEnrollments = enrollmentDB.filter((e) => e.studentId === studentId)
    const myEnrolledIds = new Set(myEnrollments.map((e) => e.courseId))

    const courses = courseDB.map((course) => {
      const enrolledCount = enrollmentDB.filter((e) => e.courseId === course.courseId).length
      return {
        ...course,
        enrolledCount,
        isEnrolled: myEnrolledIds.has(course.courseId),
        isFull: enrolledCount >= course.maxStudents,
      }
    })

    return HttpResponse.json(courses)
  }),

  // POST /enrollment — 수강신청
  http.post('/enrollment', async ({ request }) => {
    const auth = request.headers.get('Authorization') ?? ''
    const studentId = auth.replace('Bearer mock-jwt-token-', '') || '20240001'
    const body = await request.json() as { courseId: string }

    // 이미 수강 중인지 확인
    const already = enrollmentDB.find(
      (e) => e.studentId === studentId && e.courseId === body.courseId
    )
    if (already) {
      return HttpResponse.json({ message: '이미 수강신청한 강의입니다' }, { status: 409 })
    }

    // 정원 초과 확인
    const course = courseDB.find((c) => c.courseId === body.courseId)
    if (!course) {
      return HttpResponse.json({ message: '강의를 찾을 수 없습니다' }, { status: 404 })
    }
    const enrolledCount = enrollmentDB.filter((e) => e.courseId === body.courseId).length
    if (enrolledCount >= course.maxStudents) {
      return HttpResponse.json({ message: '정원이 초과되었습니다' }, { status: 409 })
    }

    // 수강신청 추가
    enrollmentDB.push({ studentId, courseId: body.courseId, semester: course.semester })
    // 출석 초기화
    attendanceDB.push({ studentId, courseId: body.courseId, attendedCount: 0, totalCount: 15, rate: 0 })
    persistDB.enrollments()
    persistDB.attendance()

    return HttpResponse.json({ message: '수강신청이 완료되었습니다' }, { status: 201 })
  }),

  // DELETE /enrollment/:courseId — 수강취소
  http.delete('/enrollment/:courseId', ({ request, params }) => {
    const auth = request.headers.get('Authorization') ?? ''
    const studentId = auth.replace('Bearer mock-jwt-token-', '') || '20240001'
    const courseId = params.courseId as string

    const idx = enrollmentDB.findIndex(
      (e) => e.studentId === studentId && e.courseId === courseId
    )
    if (idx === -1) {
      return HttpResponse.json({ message: '수강신청 내역이 없습니다' }, { status: 404 })
    }

    enrollmentDB.splice(idx, 1)
    // 출석 데이터도 제거
    const aIdx = attendanceDB.findIndex(
      (a) => a.studentId === studentId && a.courseId === courseId
    )
    if (aIdx !== -1) attendanceDB.splice(aIdx, 1)

    persistDB.enrollments()
    persistDB.attendance()

    return new HttpResponse(null, { status: 204 })
  }),
]
