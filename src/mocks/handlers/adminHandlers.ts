import { http, HttpResponse } from 'msw'
import {
  studentDB, courseDB, enrollmentDB, gradeDB, attendanceDB,
  scoreToGrade, gradeToGpa, persistDB,
  type StudentRecord, type GradeRecord, type EnrollmentRecord, type AttendanceRecord,
} from '../fixtures/db'

export const adminHandlers = [

  // ═══════════════════════════════════════════════════════
  // 학생 관리
  // ═══════════════════════════════════════════════════════

  http.get('/admin/students', () => {
    return HttpResponse.json([...studentDB])
  }),

  http.post('/admin/students', async ({ request }) => {
    const body = await request.json() as StudentRecord
    if (!body.studentId || !body.name || !body.department) {
      return HttpResponse.json({ message: '필수 항목 누락' }, { status: 400 })
    }
    if (studentDB.find((s) => s.studentId === body.studentId)) {
      return HttpResponse.json({ message: '이미 존재하는 학번' }, { status: 409 })
    }
    studentDB.push({ ...body, isRegistered: false })
    persistDB.students()
    return HttpResponse.json(body, { status: 201 })
  }),

  http.put('/admin/students/:studentId', async ({ request, params }) => {
    const studentId = params.studentId as string
    const body = await request.json() as Partial<StudentRecord>
    const idx = studentDB.findIndex((s) => s.studentId === studentId)
    if (idx === -1) return HttpResponse.json({ message: '학생 없음' }, { status: 404 })
    studentDB[idx] = { ...studentDB[idx], ...body }
    persistDB.students()
    return HttpResponse.json(studentDB[idx])
  }),

  http.delete('/admin/students/:studentId', ({ params }) => {
    const studentId = params.studentId as string
    const idx = studentDB.findIndex((s) => s.studentId === studentId)
    if (idx === -1) return HttpResponse.json({ message: '학생 없음' }, { status: 404 })
    studentDB.splice(idx, 1)
    // 연관 데이터도 삭제
    const removeByStudent = (arr: { studentId: string }[]) => {
      let i = arr.length - 1
      while (i >= 0) { if (arr[i].studentId === studentId) arr.splice(i, 1); i-- }
    }
    removeByStudent(enrollmentDB)
    removeByStudent(gradeDB)
    removeByStudent(attendanceDB)
    persistDB.students()
    persistDB.enrollments()
    persistDB.grades()
    persistDB.attendance()
    return new HttpResponse(null, { status: 204 })
  }),

  // ═══════════════════════════════════════════════════════
  // 강의 관리
  // ═══════════════════════════════════════════════════════

  http.get('/admin/courses', () => {
    return HttpResponse.json([...courseDB])
  }),

  // ═══════════════════════════════════════════════════════
  // 수강 관리
  // ═══════════════════════════════════════════════════════

  http.get('/admin/enrollments/:studentId', ({ params }) => {
    const studentId = params.studentId as string
    const enrollments = enrollmentDB
      .filter((e) => e.studentId === studentId)
      .map((e) => {
        const course = courseDB.find((c) => c.courseId === e.courseId)
        return { ...e, courseName: course?.title ?? '', credits: course?.credits ?? 3, professorName: course?.professorName ?? '' }
      })
    return HttpResponse.json(enrollments)
  }),

  http.post('/admin/enrollments', async ({ request }) => {
    const body = await request.json() as EnrollmentRecord
    const exists = enrollmentDB.find(
      (e) => e.studentId === body.studentId && e.courseId === body.courseId
    )
    if (exists) return HttpResponse.json({ message: '이미 수강 중' }, { status: 409 })
    enrollmentDB.push(body)
    attendanceDB.push({ studentId: body.studentId, courseId: body.courseId, attendedCount: 0, totalCount: 15, rate: 0 })
    persistDB.enrollments()
    persistDB.attendance()
    return HttpResponse.json(body, { status: 201 })
  }),

  http.delete('/admin/enrollments/:studentId/:courseId', ({ params }) => {
    const { studentId, courseId } = params as { studentId: string; courseId: string }
    const idx = enrollmentDB.findIndex((e) => e.studentId === studentId && e.courseId === courseId)
    if (idx === -1) return HttpResponse.json({ message: '수강 없음' }, { status: 404 })
    enrollmentDB.splice(idx, 1)
    const gIdx = gradeDB.findIndex((g) => g.studentId === studentId && g.courseId === courseId)
    if (gIdx !== -1) gradeDB.splice(gIdx, 1)
    const aIdx = attendanceDB.findIndex((a) => a.studentId === studentId && a.courseId === courseId)
    if (aIdx !== -1) attendanceDB.splice(aIdx, 1)
    persistDB.enrollments()
    persistDB.grades()
    persistDB.attendance()
    return new HttpResponse(null, { status: 204 })
  }),

  // ═══════════════════════════════════════════════════════
  // 성적 관리
  // ═══════════════════════════════════════════════════════

  http.get('/admin/grades/:studentId', ({ params }) => {
    const studentId = params.studentId as string
    const grades = gradeDB
      .filter((g) => g.studentId === studentId)
      .map((g) => {
        const course = courseDB.find((c) => c.courseId === g.courseId)
        return { ...g, courseName: course?.title ?? '', credits: course?.credits ?? 3, professorName: course?.professorName ?? '' }
      })
    return HttpResponse.json(grades)
  }),

  http.put('/admin/grades/:studentId/:courseId', async ({ request, params }) => {
    const { studentId, courseId } = params as { studentId: string; courseId: string }
    const body = await request.json() as { score: number; semester: string }
    const gradeStr = scoreToGrade(body.score)
    const gpa = gradeToGpa(gradeStr)

    const idx = gradeDB.findIndex((g) => g.studentId === studentId && g.courseId === courseId)
    const record: GradeRecord = { studentId, courseId, semester: body.semester, score: body.score, gradeStr, gpa }

    if (idx === -1) {
      gradeDB.push(record)
    } else {
      gradeDB[idx] = record
    }
    persistDB.grades()
    return HttpResponse.json(record)
  }),

  http.delete('/admin/grades/:studentId/:courseId', ({ params }) => {
    const { studentId, courseId } = params as { studentId: string; courseId: string }
    const idx = gradeDB.findIndex((g) => g.studentId === studentId && g.courseId === courseId)
    if (idx === -1) return HttpResponse.json({ message: '성적 없음' }, { status: 404 })
    gradeDB.splice(idx, 1)
    persistDB.grades()
    return new HttpResponse(null, { status: 204 })
  }),

  // ═══════════════════════════════════════════════════════
  // 출석 관리
  // ═══════════════════════════════════════════════════════

  http.get('/admin/attendance/:studentId', ({ params }) => {
    const studentId = params.studentId as string
    const records = attendanceDB
      .filter((a) => a.studentId === studentId)
      .map((a) => {
        const course = courseDB.find((c) => c.courseId === a.courseId)
        return { ...a, courseName: course?.title ?? '', professorName: course?.professorName ?? '' }
      })
    return HttpResponse.json(records)
  }),

  http.put('/admin/attendance/:studentId/:courseId', async ({ request, params }) => {
    const { studentId, courseId } = params as { studentId: string; courseId: string }
    const body = await request.json() as { attendedCount: number; totalCount: number }
    const rate = body.totalCount > 0 ? Math.round((body.attendedCount / body.totalCount) * 1000) / 10 : 0

    const idx = attendanceDB.findIndex((a) => a.studentId === studentId && a.courseId === courseId)
    const record: AttendanceRecord = { studentId, courseId, ...body, rate }

    if (idx === -1) {
      attendanceDB.push(record)
    } else {
      attendanceDB[idx] = record
    }
    persistDB.attendance()
    return HttpResponse.json(record)
  }),
]