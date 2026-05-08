import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useAdminStore from '../store/adminStore'
import apiClient from '../lib/axios'
import type { StudentRecord, GradeRecord, AttendanceRecord, CourseRecord } from '../mocks/fixtures/db'
import { scoreToGrade, gradeToGpa } from '../mocks/fixtures/db'

type Tab = 'students' | 'grades' | 'enrollment' | 'attendance'

interface EnrollmentWithCourse extends CourseRecord {
  studentId: string
  semester: string
}

interface GradeWithCourse extends GradeRecord {
  courseName: string
  credits: number
  professorName: string
}

interface AttendanceWithCourse extends AttendanceRecord {
  courseName: string
  professorName: string
}

function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-sm text-white flex items-center gap-2 ${type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
      {type === 'error' ? '❌' : '✅'} {msg}
    </div>
  )
}

export default function AdminPage() {
  const navigate = useNavigate()
  const { adminLogout } = useAdminStore()
  const [activeTab, setActiveTab] = useState<Tab>('students')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
  }, [])

  const handleLogout = () => { adminLogout(); navigate('/admin/login') }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'students', label: '학생 관리', icon: '👥' },
    { id: 'grades', label: '성적 관리', icon: '📊' },
    { id: 'enrollment', label: '수강 관리', icon: '📚' },
    { id: 'attendance', label: '출석 관리', icon: '✅' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <header className="bg-[#1e1b4b] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎓</span>
          <div>
            <p className="font-bold text-sm">현규대학교 LMS</p>
            <p className="text-xs text-white/60">관리자 시스템</p>
          </div>
        </div>
        <button onClick={handleLogout} className="text-sm text-white/70 hover:text-white flex items-center gap-1">🚪 로그아웃</button>
      </header>

      <div className="flex border-b border-gray-200 bg-white px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[#1e1b4b] text-[#1e1b4b]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      <main className="p-6 max-w-7xl mx-auto">
        {activeTab === 'students' && <StudentsTab showToast={showToast} />}
        {activeTab === 'grades' && <GradesTab showToast={showToast} />}
        {activeTab === 'enrollment' && <EnrollmentTab showToast={showToast} />}
        {activeTab === 'attendance' && <AttendanceTab showToast={showToast} />}
      </main>
    </div>
  )
}

// ─── 학생 관리 탭 ────────────────────────────────────────────

function StudentsTab({ showToast }: { showToast: (msg: string, type?: 'success' | 'error') => void }) {
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<StudentRecord>>({})
  const [showAdd, setShowAdd] = useState(false)
  const [newS, setNewS] = useState<Partial<StudentRecord>>({ studentId: '', name: '', department: '', grade: '1', status: '재학', admissionYear: new Date().getFullYear().toString() })
  const [isLoading, setIsLoading] = useState(true)

  const fetch_ = useCallback(async () => {
    try {
      const res = await apiClient.get<StudentRecord[]>('/admin/students')
      setStudents(res.data)
    } catch { showToast('불러오기 실패', 'error') }
    finally { setIsLoading(false) }
  }, [showToast])

  useEffect(() => { fetch_() }, [fetch_])

  const filtered = students.filter((s) =>
    s.studentId.includes(search) || s.name.includes(search) || s.department.includes(search)
  )

  const statusColors: Record<string, string> = {
    재학: 'bg-green-100 text-green-700', 휴학: 'bg-yellow-100 text-yellow-700',
    졸업: 'bg-blue-100 text-blue-700', 제적: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">학생 관리</h2>
          <p className="text-sm text-gray-500 mt-0.5">총 {students.length}명</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-[#ef4444] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition">+ 학생 추가</button>
      </div>

      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="학번, 이름, 학과 검색..."
        className="w-full max-w-sm rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400" />

      {showAdd && (
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-indigo-500">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">새 학생 추가</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: 'studentId', placeholder: '학번 (8자리)' },
              { key: 'name', placeholder: '이름' },
              { key: 'department', placeholder: '학과' },
              { key: 'admissionYear', placeholder: '입학년도' },
            ].map(({ key, placeholder }) => (
              <input key={key} placeholder={placeholder} value={(newS as Record<string, string>)[key] ?? ''}
                onChange={(e) => setNewS((p) => ({ ...p, [key]: e.target.value }))}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
            ))}
            <select value={newS.grade} onChange={(e) => setNewS((p) => ({ ...p, grade: e.target.value as StudentRecord['grade'] }))}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400">
              {['1','2','3','4'].map((g) => <option key={g} value={g}>{g}학년</option>)}
            </select>
            <select value={newS.status} onChange={(e) => setNewS((p) => ({ ...p, status: e.target.value as StudentRecord['status'] }))}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400">
              {['재학','휴학','졸업','제적'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={async () => {
              if (!newS.studentId || !newS.name || !newS.department) { showToast('필수 항목 누락', 'error'); return }
              try {
                await apiClient.post('/admin/students', newS)
                await fetch_()
                setNewS({ studentId: '', name: '', department: '', grade: '1', status: '재학', admissionYear: new Date().getFullYear().toString() })
                setShowAdd(false)
                showToast('학생이 추가되었습니다.')
              } catch (e: unknown) {
                const status = (e as { response?: { status?: number } })?.response?.status
                showToast(status === 409 ? '이미 존재하는 학번' : '추가 실패', 'error')
              }
            }} className="bg-indigo-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-indigo-700">추가</button>
            <button onClick={() => setShowAdd(false)} className="border border-gray-300 text-gray-600 px-4 py-1.5 rounded-md text-sm hover:bg-gray-50">취소</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? <div className="p-8 text-center text-gray-400 text-sm">불러오는 중...</div> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['학번','이름','학과','학년','상태','이메일','LMS 가입','관리'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((s) => (
                <tr key={s.studentId} className="hover:bg-gray-50">
                  {editingId === s.studentId ? (
                    <>
                      <td className="px-4 py-3 font-mono text-gray-400 text-xs">{s.studentId}</td>
                      {(['name','department'] as const).map((k) => (
                        <td key={k} className="px-4 py-3">
                          <input value={(editForm as Record<string, string>)[k] ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, [k]: e.target.value }))}
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm" />
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <select value={editForm.grade} onChange={(e) => setEditForm((p) => ({ ...p, grade: e.target.value as StudentRecord['grade'] }))}
                          className="rounded border border-gray-300 px-2 py-1 text-sm">
                          {['1','2','3','4'].map((g) => <option key={g} value={g}>{g}학년</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select value={editForm.status} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as StudentRecord['status'] }))}
                          className="rounded border border-gray-300 px-2 py-1 text-sm">
                          {['재학','휴학','졸업','제적'].map((st) => <option key={st} value={st}>{st}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input value={editForm.email ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                          className="w-full rounded border border-gray-300 px-2 py-1 text-sm" placeholder="이메일" />
                      </td>
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={editForm.isRegistered ?? false} onChange={(e) => setEditForm((p) => ({ ...p, isRegistered: e.target.checked }))} className="accent-indigo-600" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={async () => {
                          try { await apiClient.put(`/admin/students/${editingId}`, editForm); await fetch_(); setEditingId(null); showToast('수정 완료') }
                          catch { showToast('수정 실패', 'error') }
                        }} className="text-indigo-600 hover:underline text-xs mr-2">저장</button>
                        <button onClick={() => setEditingId(null)} className="text-gray-400 hover:underline text-xs">취소</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-mono text-gray-600">{s.studentId}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                      <td className="px-4 py-3 text-gray-500">{s.department}</td>
                      <td className="px-4 py-3 text-gray-500">{s.grade}학년</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[s.status]}`}>{s.status}</span></td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{s.email ?? '-'}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.isRegistered ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>{s.isRegistered ? '가입됨' : '미가입'}</span></td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => { setEditingId(s.studentId); setEditForm({ ...s }) }} className="text-indigo-600 hover:underline text-xs mr-3">수정</button>
                        <button onClick={async () => {
                          if (!confirm(`${s.name} 학생을 삭제하시겠습니까?`)) return
                          try { await apiClient.delete(`/admin/students/${s.studentId}`); await fetch_(); showToast('삭제 완료') }
                          catch { showToast('삭제 실패', 'error') }
                        }} className="text-red-500 hover:underline text-xs">삭제</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-sm">검색 결과 없음</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ─── 성적 관리 탭 ────────────────────────────────────────────

function GradesTab({ showToast }: { showToast: (msg: string, type?: 'success' | 'error') => void }) {
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [grades, setGrades] = useState<GradeWithCourse[]>([])
  const [editingCourse, setEditingCourse] = useState<string | null>(null)
  const [editScore, setEditScore] = useState('')
  const [courses, setCourses] = useState<CourseRecord[]>([])
  const [showAddGrade, setShowAddGrade] = useState(false)
  const [newGrade, setNewGrade] = useState({ courseId: '', score: '', semester: '2024-1' })

  useEffect(() => {
    apiClient.get<StudentRecord[]>('/admin/students').then((r) => setStudents(r.data))
    apiClient.get<CourseRecord[]>('/admin/courses').then((r) => setCourses(r.data))
  }, [])

  const fetchGrades = useCallback(async (sid: string) => {
    if (!sid) return
    const r = await apiClient.get<GradeWithCourse[]>(`/admin/grades/${sid}`)
    setGrades(r.data)
  }, [])

  useEffect(() => { fetchGrades(selectedId) }, [selectedId, fetchGrades])

  const gradeColors: Record<string, string> = {
    'A+': 'bg-green-100 text-green-700', 'A': 'bg-green-100 text-green-600',
    'B+': 'bg-blue-100 text-blue-700', 'B': 'bg-blue-100 text-blue-600',
    'C+': 'bg-yellow-100 text-yellow-700', 'C': 'bg-yellow-100 text-yellow-600',
    'D+': 'bg-orange-100 text-orange-700', 'D': 'bg-orange-100 text-orange-600',
    'F': 'bg-red-100 text-red-700',
  }

  const totalCredits = grades.reduce((s, g) => s + (g.credits ?? 3), 0)
  const gpa = totalCredits > 0
    ? Math.round(grades.reduce((s, g) => s + gradeToGpa(g.gradeStr) * (g.credits ?? 3), 0) / totalCredits * 100) / 100
    : 0

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">성적 관리</h2>
      <div className="flex items-center gap-3">
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 min-w-48">
          <option value="">학생 선택...</option>
          {students.map((s) => <option key={s.studentId} value={s.studentId}>{s.name} ({s.studentId})</option>)}
        </select>
        {selectedId && <button onClick={() => setShowAddGrade(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">+ 성적 추가</button>}
      </div>

      {selectedId && showAddGrade && (
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-indigo-500">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">성적 추가</h3>
          <div className="flex gap-3 flex-wrap">
            <select value={newGrade.courseId} onChange={(e) => setNewGrade((p) => ({ ...p, courseId: e.target.value }))}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="">강의 선택</option>
              {courses.map((c) => <option key={c.courseId} value={c.courseId}>{c.title}</option>)}
            </select>
            <input type="number" min="0" max="100" placeholder="점수 (0~100)" value={newGrade.score}
              onChange={(e) => setNewGrade((p) => ({ ...p, score: e.target.value }))}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 w-36" />
            <input placeholder="학기 (예: 2024-1)" value={newGrade.semester}
              onChange={(e) => setNewGrade((p) => ({ ...p, semester: e.target.value }))}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 w-32" />
            <button onClick={async () => {
              if (!newGrade.courseId || !newGrade.score) { showToast('강의와 점수를 입력하세요', 'error'); return }
              try {
                await apiClient.put(`/admin/grades/${selectedId}/${newGrade.courseId}`, { score: Number(newGrade.score), semester: newGrade.semester })
                await fetchGrades(selectedId)
                setNewGrade({ courseId: '', score: '', semester: '2024-1' })
                setShowAddGrade(false)
                showToast('성적이 등록되었습니다.')
              } catch { showToast('등록 실패', 'error') }
            }} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700">등록</button>
            <button onClick={() => setShowAddGrade(false)} className="border border-gray-300 text-gray-600 px-4 py-2 rounded-md text-sm hover:bg-gray-50">취소</button>
          </div>
        </div>
      )}

      {selectedId && grades.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 border-t-4 border-t-indigo-400">
            <p className="text-xs text-gray-500">평균 GPA</p>
            <p className="text-3xl font-bold text-indigo-600 mt-1">{gpa.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-t-4 border-t-blue-400">
            <p className="text-xs text-gray-500">이수 학점</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{grades.filter((g) => g.gradeStr !== 'F').reduce((s, g) => s + (g.credits ?? 3), 0)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 border-t-4 border-t-gray-400">
            <p className="text-xs text-gray-500">신청 학점</p>
            <p className="text-3xl font-bold text-gray-600 mt-1">{totalCredits}</p>
          </div>
        </div>
      )}

      {selectedId && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['강의명','교수','학점','점수','등급','GPA','관리'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {grades.map((g) => (
                <tr key={g.courseId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{g.courseName}</td>
                  <td className="px-4 py-3 text-gray-500">{g.professorName}</td>
                  <td className="px-4 py-3 text-gray-600">{g.credits}학점</td>
                  <td className="px-4 py-3">
                    {editingCourse === g.courseId ? (
                      <input type="number" min="0" max="100" value={editScore} onChange={(e) => setEditScore(e.target.value)}
                        className="w-20 rounded border border-gray-300 px-2 py-1 text-sm" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-indigo-400" style={{ width: `${g.score}%` }} />
                        </div>
                        <span>{g.score}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${gradeColors[g.gradeStr] ?? 'bg-gray-100 text-gray-600'}`}>
                      {editingCourse === g.courseId ? scoreToGrade(Number(editScore)) : g.gradeStr}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-indigo-600">
                    {editingCourse === g.courseId ? gradeToGpa(scoreToGrade(Number(editScore))).toFixed(1) : g.gpa.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editingCourse === g.courseId ? (
                      <>
                        <button onClick={async () => {
                          try {
                            await apiClient.put(`/admin/grades/${selectedId}/${g.courseId}`, { score: Number(editScore), semester: g.semester })
                            await fetchGrades(selectedId)
                            setEditingCourse(null)
                            showToast('성적 수정 완료')
                          } catch { showToast('수정 실패', 'error') }
                        }} className="text-indigo-600 hover:underline text-xs mr-2">저장</button>
                        <button onClick={() => setEditingCourse(null)} className="text-gray-400 hover:underline text-xs">취소</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditingCourse(g.courseId); setEditScore(String(g.score)) }} className="text-indigo-600 hover:underline text-xs mr-3">수정</button>
                        <button onClick={async () => {
                          if (!confirm('성적을 삭제하시겠습니까?')) return
                          try { await apiClient.delete(`/admin/grades/${selectedId}/${g.courseId}`); await fetchGrades(selectedId); showToast('삭제 완료') }
                          catch { showToast('삭제 실패', 'error') }
                        }} className="text-red-500 hover:underline text-xs">삭제</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {grades.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">성적 데이터 없음</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── 수강 관리 탭 ────────────────────────────────────────────

function EnrollmentTab({ showToast }: { showToast: (msg: string, type?: 'success' | 'error') => void }) {
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [courses, setCourses] = useState<CourseRecord[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([])
  const [addCourseId, setAddCourseId] = useState('')

  useEffect(() => {
    apiClient.get<StudentRecord[]>('/admin/students').then((r) => setStudents(r.data))
    apiClient.get<CourseRecord[]>('/admin/courses').then((r) => setCourses(r.data))
  }, [])

  const fetchEnrollments = useCallback(async (sid: string) => {
    if (!sid) return
    const r = await apiClient.get<EnrollmentWithCourse[]>(`/admin/enrollments/${sid}`)
    setEnrollments(r.data)
  }, [])

  useEffect(() => { fetchEnrollments(selectedId) }, [selectedId, fetchEnrollments])

  const enrolledIds = new Set(enrollments.map((e) => e.courseId))
  const availableCourses = courses.filter((c) => !enrolledIds.has(c.courseId))

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">수강 관리</h2>
      <div className="flex items-center gap-3 flex-wrap">
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 min-w-48">
          <option value="">학생 선택...</option>
          {students.map((s) => <option key={s.studentId} value={s.studentId}>{s.name} ({s.studentId})</option>)}
        </select>
        {selectedId && (
          <>
            <select value={addCourseId} onChange={(e) => setAddCourseId(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 min-w-48">
              <option value="">수강 추가할 강의 선택...</option>
              {availableCourses.map((c) => <option key={c.courseId} value={c.courseId}>{c.title} ({c.credits}학점)</option>)}
            </select>
            <button onClick={async () => {
              if (!addCourseId) { showToast('강의를 선택하세요', 'error'); return }
              try {
                await apiClient.post('/admin/enrollments', { studentId: selectedId, courseId: addCourseId, semester: '2024-1' })
                await fetchEnrollments(selectedId)
                setAddCourseId('')
                showToast('수강이 추가되었습니다.')
              } catch (e: unknown) {
                const status = (e as { response?: { status?: number } })?.response?.status
                showToast(status === 409 ? '이미 수강 중인 강의' : '추가 실패', 'error')
              }
            }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">수강 추가</button>
          </>
        )}
      </div>

      {selectedId && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">수강 목록 ({enrollments.length}개)</h3>
            <span className="text-xs text-gray-400">총 {enrollments.reduce((s, e) => s + (e.credits ?? 3), 0)}학점</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['강의명','교수','학점','학기','관리'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {enrollments.map((e) => (
                <tr key={e.courseId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{e.title}</td>
                  <td className="px-4 py-3 text-gray-500">{e.professorName}</td>
                  <td className="px-4 py-3 text-gray-600">{e.credits}학점</td>
                  <td className="px-4 py-3 text-gray-500">{e.semester}</td>
                  <td className="px-4 py-3">
                    <button onClick={async () => {
                      if (!confirm(`${e.title} 수강을 취소하시겠습니까? 성적과 출석 데이터도 삭제됩니다.`)) return
                      try { await apiClient.delete(`/admin/enrollments/${selectedId}/${e.courseId}`); await fetchEnrollments(selectedId); showToast('수강 취소 완료') }
                      catch { showToast('취소 실패', 'error') }
                    }} className="text-red-500 hover:underline text-xs">수강 취소</button>
                  </td>
                </tr>
              ))}
              {enrollments.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">수강 중인 강의 없음</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── 출석 관리 탭 ────────────────────────────────────────────

function AttendanceTab({ showToast }: { showToast: (msg: string, type?: 'success' | 'error') => void }) {
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [records, setRecords] = useState<AttendanceWithCourse[]>([])
  const [editingCourse, setEditingCourse] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ attendedCount: '', totalCount: '' })

  useEffect(() => {
    apiClient.get<StudentRecord[]>('/admin/students').then((r) => setStudents(r.data))
  }, [])

  const fetchAttendance = useCallback(async (sid: string) => {
    if (!sid) return
    const r = await apiClient.get<AttendanceWithCourse[]>(`/admin/attendance/${sid}`)
    setRecords(r.data)
  }, [])

  useEffect(() => { fetchAttendance(selectedId) }, [selectedId, fetchAttendance])

  const overallRate = records.length > 0
    ? Math.round(records.reduce((s, r) => s + r.rate, 0) / records.length * 10) / 10
    : 0

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">출석 관리</h2>
      <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 min-w-48">
        <option value="">학생 선택...</option>
        {students.map((s) => <option key={s.studentId} value={s.studentId}>{s.name} ({s.studentId})</option>)}
      </select>

      {selectedId && records.length > 0 && (
        <div className={`bg-white rounded-xl shadow-sm p-4 border-t-4 ${overallRate < 75 ? 'border-t-red-400' : 'border-t-green-400'}`}>
          <p className="text-xs text-gray-500">전체 평균 출석률</p>
          <p className={`text-3xl font-bold mt-1 ${overallRate < 75 ? 'text-red-500' : 'text-green-500'}`}>{overallRate}%</p>
          {overallRate < 75 && <p className="text-xs text-red-500 mt-1">⚠️ 출석률 주의</p>}
        </div>
      )}

      {selectedId && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['강의명','교수','출석','전체','출석률','상태','관리'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((r) => {
                const warn = r.rate < 75
                return (
                  <tr key={r.courseId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{r.courseName}</td>
                    <td className="px-4 py-3 text-gray-500">{r.professorName}</td>
                    <td className="px-4 py-3">
                      {editingCourse === r.courseId
                        ? <input type="number" min="0" value={editForm.attendedCount} onChange={(e) => setEditForm((p) => ({ ...p, attendedCount: e.target.value }))} className="w-16 rounded border border-gray-300 px-2 py-1 text-sm" />
                        : r.attendedCount}
                    </td>
                    <td className="px-4 py-3">
                      {editingCourse === r.courseId
                        ? <input type="number" min="1" value={editForm.totalCount} onChange={(e) => setEditForm((p) => ({ ...p, totalCount: e.target.value }))} className="w-16 rounded border border-gray-300 px-2 py-1 text-sm" />
                        : r.totalCount}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${warn ? 'bg-red-400' : 'bg-green-400'}`}
                            style={{ width: `${editingCourse === r.courseId ? Math.round(Number(editForm.attendedCount) / Number(editForm.totalCount) * 100) || 0 : r.rate}%` }} />
                        </div>
                        <span className={`font-semibold ${warn ? 'text-red-500' : 'text-green-600'}`}>
                          {editingCourse === r.courseId
                            ? `${Math.round(Number(editForm.attendedCount) / Number(editForm.totalCount) * 100) || 0}%`
                            : `${r.rate}%`}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${warn ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {warn ? '주의' : '정상'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {editingCourse === r.courseId ? (
                        <>
                          <button onClick={async () => {
                            try {
                              await apiClient.put(`/admin/attendance/${selectedId}/${r.courseId}`, { attendedCount: Number(editForm.attendedCount), totalCount: Number(editForm.totalCount) })
                              await fetchAttendance(selectedId)
                              setEditingCourse(null)
                              showToast('출석 수정 완료')
                            } catch { showToast('수정 실패', 'error') }
                          }} className="text-indigo-600 hover:underline text-xs mr-2">저장</button>
                          <button onClick={() => setEditingCourse(null)} className="text-gray-400 hover:underline text-xs">취소</button>
                        </>
                      ) : (
                        <button onClick={() => { setEditingCourse(r.courseId); setEditForm({ attendedCount: String(r.attendedCount), totalCount: String(r.totalCount) }) }}
                          className="text-indigo-600 hover:underline text-xs">수정</button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {records.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">출석 데이터 없음</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
