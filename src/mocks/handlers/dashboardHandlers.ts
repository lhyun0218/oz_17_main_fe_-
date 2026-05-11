import { http, HttpResponse } from 'msw'
import { getEnrollmentDB, getCourseDB, getGradeDB, getAttendanceDB } from '../fixtures/db'
import { COURSE_ASSIGNMENTS } from '../fixtures/assignments'

function loadSubmitted(): Record<string, string> {
  try {
    const raw = localStorage.getItem('mock-submitted-assignments')
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function generateWeeklyStudyData() {
  const data = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0],
      studyMinutes: i === 0 ? 0 : Math.floor(Math.random() * 120) + 10,
    })
  }
  return data
}

export const dashboardHandlers = [
  http.get('/dashboard', ({ request }) => {
    const auth = request.headers.get('Authorization') ?? ''
    const studentId = auth.replace('Bearer mock-jwt-token-', '') || '20240001'

    const enrollments = getEnrollmentDB().filter((e) => e.studentId === studentId)
    const courses = getCourseDB()
    const grades = getGradeDB()
    const attendance = getAttendanceDB()

    const courseList = enrollments.map((e) => {
      const course = courses.find((c) => c.courseId === e.courseId)
      const grade = grades.find((g) => g.studentId === studentId && g.courseId === e.courseId)
      const att = attendance.find((a) => a.studentId === studentId && a.courseId === e.courseId)
      return {
        id: e.courseId,
        title: course?.title ?? '',
        professorName: course?.professorName ?? '',
        progressRate: att ? Math.round(att.rate) : 0,
        thumbnailUrl: null,
        score: grade?.score ?? null,
        gradeStr: grade?.gradeStr ?? null,
      }
    })

    const submitted = loadSubmitted()
    const assignments = enrollments
      .flatMap((e) => (COURSE_ASSIGNMENTS[e.courseId] ?? []).map((a) => ({
        id: a.id,
        title: a.title,
        courseName: a.courseName,
        dueDate: a.dueDate,
        isSubmitted: !!submitted[a.id],
      })))
      .filter((a) => !a.isSubmitted)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 4)

    const myAtt = attendance.filter((a) => a.studentId === studentId)
    const totalAttended = myAtt.reduce((s, a) => s + a.attendedCount, 0)
    const totalLectures = myAtt.reduce((s, a) => s + a.totalCount, 0)
    const attendanceRate = totalLectures > 0
      ? Math.round((totalAttended / totalLectures) * 1000) / 10 : 0

    return HttpResponse.json({
      courses: courseList,
      assignments,
      attendance: { attendedCount: totalAttended, totalCount: totalLectures, rate: attendanceRate },
      weeklyStudy: generateWeeklyStudyData(),
    })
  }),

  http.get('/courses', ({ request }) => {
    const auth = request.headers.get('Authorization') ?? ''
    const studentId = auth.replace('Bearer mock-jwt-token-', '') || '20240001'

    const enrollments = getEnrollmentDB().filter((e) => e.studentId === studentId)
    const courses = getCourseDB()
    const attendance = getAttendanceDB()

    const result = enrollments.map((e) => {
      const course = courses.find((c) => c.courseId === e.courseId)
      const att = attendance.find((a) => a.studentId === studentId && a.courseId === e.courseId)
      return {
        id: e.courseId,
        title: course?.title ?? '',
        professorName: course?.professorName ?? '',
        progressRate: att ? Math.round(att.rate) : 0,
        thumbnailUrl: null,
      }
    })
    return HttpResponse.json(result)
  }),
]
