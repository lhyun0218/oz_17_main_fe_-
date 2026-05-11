import { http, HttpResponse } from 'msw'
import { getCourseDB, getEnrollmentDB, getAttendanceDB, persistDB } from '../fixtures/db'

export const enrollmentHandlers = [
  // GET /enrollment/available — 수강신청 가능한 전체 강의 목록
  http.get('/enrollment/available', ({ request }) => {
    const auth = request.headers.get('Authorization') ?? ''
    const studentId = auth.replace('Bearer mock-jwt-token-', '') || '20240001'

    const courses = getCourseDB()
    const enrollments = getEnrollmentDB()
    const myEnrolledIds = new Set(
      enrollments.filter((e) => e.studentId === studentId).map((e) => e.courseId)
    )

    const result = courses.map((course) => {
      const enrolledCount = enrollments.filter((e) => e.courseId === course.courseId).length
      return {
        ...course,
        enrolledCount,
        isEnrolled: myEnrolledIds.has(course.courseId),
        isFull: enrolledCount >= course.maxStudents,
      }
    })

    return HttpResponse.json(result)
  }),

  // POST /enrollment — 수강신청
  http.post('/enrollment', async ({ request }) => {
    const auth = request.headers.get('Authorization') ?? ''
    const studentId = auth.replace('Bearer mock-jwt-token-', '') || '20240001'
    const body = await request.json() as { courseId: string }

    const enrollments = getEnrollmentDB()
    const already = enrollments.find(
      (e) => e.studentId === studentId && e.courseId === body.courseId
    )
    if (already) {
      return HttpResponse.json({ message: '이미 수강신청한 강의입니다' }, { status: 409 })
    }

    const courses = getCourseDB()
    const course = courses.find((c) => c.courseId === body.courseId)
    if (!course) {
      return HttpResponse.json({ message: '강의를 찾을 수 없습니다' }, { status: 404 })
    }
    const enrolledCount = enrollments.filter((e) => e.courseId === body.courseId).length
    if (enrolledCount >= course.maxStudents) {
      return HttpResponse.json({ message: '정원이 초과되었습니다' }, { status: 409 })
    }

    enrollments.push({ studentId, courseId: body.courseId, semester: course.semester })
    persistDB.enrollments(enrollments)

    const attendance = getAttendanceDB()
    attendance.push({ studentId, courseId: body.courseId, attendedCount: 0, totalCount: 15, rate: 0 })
    persistDB.attendance(attendance)

    return HttpResponse.json({ message: '수강신청이 완료되었습니다' }, { status: 201 })
  }),

  // DELETE /enrollment/:courseId — 수강취소
  http.delete('/enrollment/:courseId', ({ request, params }) => {
    const auth = request.headers.get('Authorization') ?? ''
    const studentId = auth.replace('Bearer mock-jwt-token-', '') || '20240001'
    const courseId = params.courseId as string

    const enrollments = getEnrollmentDB()
    const idx = enrollments.findIndex(
      (e) => e.studentId === studentId && e.courseId === courseId
    )
    if (idx === -1) {
      return HttpResponse.json({ message: '수강신청 내역이 없습니다' }, { status: 404 })
    }
    enrollments.splice(idx, 1)
    persistDB.enrollments(enrollments)

    const attendance = getAttendanceDB().filter(
      (a) => !(a.studentId === studentId && a.courseId === courseId)
    )
    persistDB.attendance(attendance)

    return new HttpResponse(null, { status: 204 })
  }),
]
