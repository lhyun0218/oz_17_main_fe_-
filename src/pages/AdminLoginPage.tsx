import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAdminStore from '../store/adminStore'
import useProfessorStore from '../store/professorStore'

type ActiveTab = 'admin' | 'professor'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { setAdminToken } = useAdminStore()
  const { setProfessorAuth } = useProfessorStore()

  const [activeTab, setActiveTab] = useState<ActiveTab>('admin')

  // 관리자 폼 상태
  const [adminId, setAdminId] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminError, setAdminError] = useState('')
  const [adminLoading, setAdminLoading] = useState(false)

  // 교수 폼 상태
  const [professorId, setProfessorId] = useState('')
  const [professorPassword, setProfessorPassword] = useState('')
  const [professorError, setProfessorError] = useState('')
  const [professorLoading, setProfessorLoading] = useState(false)

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdminError('')
    setAdminLoading(true)

    try {
      const res = await fetch('/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, password: adminPassword }),
      })
      if (res.ok) {
        const data = await res.json()
        setAdminToken(data.token)
        navigate('/admin')
      } else {
        setAdminError('관리자 ID 또는 비밀번호가 올바르지 않습니다.')
      }
    } catch {
      setAdminError('서버에 연결할 수 없습니다.')
    } finally {
      setAdminLoading(false)
    }
  }

  const handleProfessorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfessorError('')
    setProfessorLoading(true)

    try {
      const res = await fetch('/auth/professor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professorId, password: professorPassword }),
      })
      if (res.ok) {
        const data = await res.json()
        setProfessorAuth(data.token, data.professorName)
        navigate('/professor')
      } else {
        setProfessorError('교수 ID 또는 비밀번호가 올바르지 않습니다.')
      }
    } catch {
      setProfessorError('서버에 연결할 수 없습니다.')
    } finally {
      setProfessorLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl">🎓</span>
            <span className="text-xl font-bold text-gray-800">현규대학교 LMS</span>
          </div>
          <p className="text-sm text-gray-500">관리자 / 교수 로그인</p>
        </div>

        {/* 카드 */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="mb-6 flex items-center gap-2">
            <span className="text-2xl">🔐</span>
            <h1 className="text-lg font-bold text-gray-800">시스템 로그인</h1>
          </div>

          {/* 탭 */}
          <div className="flex mb-6 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={[
                'flex-1 py-2 text-sm font-medium transition-colors',
                activeTab === 'admin'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700',
              ].join(' ')}
            >
              관리자
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('professor')}
              className={[
                'flex-1 py-2 text-sm font-medium transition-colors',
                activeTab === 'professor'
                  ? 'border-b-2 border-yellow-500 text-yellow-600'
                  : 'text-gray-500 hover:text-gray-700',
              ].join(' ')}
            >
              교수
            </button>
          </div>

          {/* 관리자 로그인 폼 */}
          {activeTab === 'admin' && (
            <>
              {adminError && (
                <div role="alert" className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                  {adminError}
                </div>
              )}

              <form onSubmit={handleAdminSubmit} noValidate className="flex flex-col gap-4">
                <div>
                  <label htmlFor="adminId" className="block text-sm font-medium text-gray-700 mb-1">
                    관리자 ID
                  </label>
                  <input
                    id="adminId"
                    type="text"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    placeholder="관리자 ID를 입력하세요"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    비밀번호
                  </label>
                  <input
                    id="adminPassword"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={adminLoading}
                  className="w-full rounded-md bg-[#1e1b4b] py-2.5 text-sm font-semibold text-white hover:bg-indigo-900 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  {adminLoading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      로그인 중...
                    </>
                  ) : '관리자 로그인'}
                </button>
              </form>

              <p className="mt-4 text-center text-xs text-gray-400">
                테스트 계정: admin / Admin1234!
              </p>
            </>
          )}

          {/* 교수 로그인 폼 */}
          {activeTab === 'professor' && (
            <>
              {professorError && (
                <div role="alert" className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                  {professorError}
                </div>
              )}

              <form onSubmit={handleProfessorSubmit} noValidate className="flex flex-col gap-4">
                <div>
                  <label htmlFor="professorId" className="block text-sm font-medium text-gray-700 mb-1">
                    교수 ID
                  </label>
                  <input
                    id="professorId"
                    type="text"
                    value={professorId}
                    onChange={(e) => setProfessorId(e.target.value)}
                    placeholder="교수 ID를 입력하세요 (예: 김교수)"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="professorPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    비밀번호
                  </label>
                  <input
                    id="professorPassword"
                    type="password"
                    value={professorPassword}
                    onChange={(e) => setProfessorPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={professorLoading}
                  className="w-full rounded-md bg-yellow-600 py-2.5 text-sm font-semibold text-white hover:bg-yellow-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  {professorLoading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      로그인 중...
                    </>
                  ) : '교수 로그인'}
                </button>
              </form>

              <p className="mt-4 text-center text-xs text-gray-400">
                테스트 계정: 김교수 / Prof1234!
              </p>
            </>
          )}
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          <Link to="/login" className="text-indigo-600 hover:underline">← 학생 로그인으로 돌아가기</Link>
        </p>
      </div>
    </div>
  )
}
