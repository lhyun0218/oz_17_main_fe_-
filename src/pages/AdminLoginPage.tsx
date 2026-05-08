import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAdminStore from '../store/adminStore'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { setAdminToken } = useAdminStore()
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // 관리자 계정 검증 (MSW 핸들러와 연동)
    try {
      const res = await fetch('/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: id, password }),
      })
      if (res.ok) {
        const data = await res.json()
        setAdminToken(data.token)
        navigate('/admin')
      } else {
        setError('관리자 ID 또는 비밀번호가 올바르지 않습니다.')
      }
    } catch {
      setError('서버에 연결할 수 없습니다.')
    } finally {
      setIsLoading(false)
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
          <p className="text-sm text-gray-500">관리자 로그인</p>
        </div>

        {/* 카드 */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="mb-6 flex items-center gap-2">
            <span className="text-2xl">🔐</span>
            <h1 className="text-lg font-bold text-gray-800">관리자 시스템</h1>
          </div>

          {error && (
            <div role="alert" className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div>
              <label htmlFor="adminId" className="block text-sm font-medium text-gray-700 mb-1">
                관리자 ID
              </label>
              <input
                id="adminId"
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-[#1e1b4b] py-2.5 text-sm font-semibold text-white hover:bg-indigo-900 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
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
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          <Link to="/login" className="text-indigo-600 hover:underline">← 학생 로그인으로 돌아가기</Link>
        </p>
      </div>
    </div>
  )
}
