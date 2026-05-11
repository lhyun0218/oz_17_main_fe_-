import { http, HttpResponse } from 'msw'
import { enrollmentDB, courseDB, gradeDB, attendanceDB } from '../fixtures/db'
import { COURSE_ASSIGNMENTS } from '../fixtures/assignments'

// 제출 상태 로드
function loadSubmitted(): Record<string, string> {
  try {
    const raw = localStorage.getItem('mock-submitted-assignments')
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

// 주간 학습 데이터 생성 (최근 7일)
function generateWeeklyStudyData() {
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
  // GET /dashboard — 로그인한 학생의 대시보드 데이터
  http.get('/dashboard', ({ request }) => {
    const auth = request.headers.get('Authorization') ?? ''
    const studentId = auth.replace('Bearer mock-jwt-token-', '') || '20240001'

    // 수강 중인 강의 목록
    const enrollments = enrollmentDB.filter((e) => e.studentId === studentId)
    const courses = enrollments.map((e) => {
      const course = courseDB.find((c) => c.courseId === e.courseId)
      const grade = gradeDB.find((g) => g.studentId === studentId && g.courseId === e.courseId)
      const attendance = attendanceDB.find((a) => a.studentId === studentId && a.courseId === e.courseId)
      return {
        id: e.courseId,
        title: course?.title ?? '',
        professorName: course?.professorName ?? '',
        progressRate: attendance ? Math.round(attendance.rate) : 0,
        thumbnailUrl: null,
        score: grade?.score ?? null,
        gradeStr: grade?.gradeStr ?? null,
      }
    })

    // 수강 중인 강의의 실제 과제 목록 (미제출 우선, 마감 임박 순, 최대 4개)
    const submitted = loadSubmitted()
    const allMyAssignments = enrollments.flatMap((e) => {
      const courseAssignments = COURSE_ASSIGNMENTS[e.courseId] ?? []
      return courseAssignments.map((a) => ({
        id: a.id,
        title: a.title,
        courseName: a.courseName,
        dueDate: a.dueDate,
        isSubmitted: !!submitted[a.id],
      }))
    })
    const assignments = allMyAssignments
      .filter((a) => !a.isSubmitted)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 4)

    // 전체 출석률
    const myAttendance = attendanceDB.filter((a) => a.studentId === studentId)
    const totalAttended = myAttendance.reduce((s, a) => s + a.attendedCount, 0)
    const totalLectures = myAttendance.reduce((s, a) => s + a.totalCount, 0)
    const attendanceRate = totalLectures > 0
      ? Math.round((totalAttended / totalLectures) * 1000) / 10
      : 0

    return HttpResponse.json({
      courses,
      assignments,
      attendance: {
        attendedCount: totalAttended,
        totalCount: totalLectures,
        rate: attendanceRate,
      },
      weeklyStudy: generateWeeklyStudyData(),
    })
  }),

  // GET /courses — 수강 중인 강의 목록
  http.get('/courses', ({ request }) => {
    const auth = request.headers.get('Authorization') ?? ''
    const studentId = auth.replace('Bearer mock-jwt-token-', '') || '20240001'

    const enrollments = enrollmentDB.filter((e) => e.studentId === studentId)
    const courses = enrollments.map((e) => {
      const course = courseDB.find((c) => c.courseId === e.courseId)
      const attendance = attendanceDB.find((a) => a.studentId === studentId && a.courseId === e.courseId)
      return {
        id: e.courseId,
        title: course?.title ?? '',
        professorName: course?.professorName ?? '',
        progressRate: attendance ? Math.round(attendance.rate) : 0,
        thumbnailUrl: null,
      }
    })
    return HttpResponse.json(courses)
  }),
]
