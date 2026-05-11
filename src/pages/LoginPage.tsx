import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import heroImg from '../assets/univpic.png'
import { LoginForm } from '../features/auth/components/LoginForm'

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isExpired = searchParams.get('expired') === 'true'

  // ?expired=true 파라미터를 읽은 후 URL에서 제거 (새로고침 시 반복 표시 방지)
  useEffect(() => {
    if (isExpired) {
      navigate('/login', { replace: true })
    }
  }, [isExpired, navigate])

  return (
    /* 전체 배경: 연한 회색 */
    <div className="min-h-screen w-full bg-gray-100 flex flex-col">
      {/* 중앙 컨테이너 — 로고/네비/카드/푸터 모두 같은 너비로 정렬 */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-3xl">
          {/* 카드 위 로고 + 네비 */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl" role="img" aria-label="졸업모자">🎓</span>
              <span className="text-lg font-bold text-gray-800">현규대학교 <span className="font-normal text-gray-500">LMS</span></span>
            </div>
            <nav className="hidden md:flex items-center gap-3 text-xs text-gray-500">
              <a href="#" className="hover:text-gray-700">HOME</a>
              <span className="text-gray-300">|</span>
              <a href="#" className="hover:text-gray-700">사이트맵</a>
              <span className="text-gray-300">|</span>
              <a href="#" className="hover:text-gray-700">개인정보처리방침</a>
              <span className="text-gray-300">|</span>
              <a href="#" className="hover:text-gray-700">English</a>
            </nav>
          </div>

          {/* 카드 */}
          <div className="w-full overflow-hidden rounded-lg shadow-lg flex">
          {/* 좌측: 대학교 이미지 */}
          <div className="relative hidden md:block md:w-[55%]">
            <img
              src={heroImg}
              alt="현규대학교 캠퍼스"
              className="h-full w-full object-cover"
              onError={(e) => {
                const target = e.currentTarget
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent) {
                  parent.classList.add('bg-gradient-to-br', 'from-indigo-900', 'to-purple-900')
                }
              }}
            />
            {/* 하단 텍스트 오버레이 */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-6 py-5">
              <div className="flex items-center gap-2 mb-1">
                <img src="/hnu-logo.png" alt="" className="h-6 w-6" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                <span className="text-xs font-bold text-white tracking-widest uppercase">HYUNGYU UNIVERSITY</span>
              </div>
              <p className="text-xl font-bold text-white">HYUNGYU UNIV</p>
              <p className="text-sm text-white/80">세상을 변화시키는 혁신의 중심, 현규대학교</p>
            </div>
          </div>

          {/* 우측: 다크 로그인 폼 패널 */}
          <div className="flex w-full flex-col justify-center bg-[#3a3a3a] px-8 py-8 md:w-[45%]">
            {/* 패널 헤더 */}
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-lg font-bold text-white">학생정보시스템</h1>
              <button className="text-gray-400 hover:text-white" aria-label="닫기">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 세션 만료 메시지 */}
            {isExpired && (
              <div role="alert" className="mb-4 rounded bg-amber-600/30 border border-amber-500/50 px-3 py-2 text-sm text-amber-300">
                세션이 만료되었습니다. 다시 로그인해 주세요
              </div>
            )}

            {/* 로그인 폼 (다크 테마) */}
            <LoginFormDark />

            {/* 하단 링크 */}
            <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
              <button className="hover:text-white">학번찾기</button>
              <button className="hover:text-white">비밀번호찾기</button>
              <Link to="/signup" className="font-semibold text-[#ef4444] hover:text-red-400">
                신입생 회원가입
              </Link>
            </div>

            {/* 관리자 로그인 버튼 */}
            <Link
              to="/admin/login"
              className="mt-3 w-full flex items-center justify-center gap-2 rounded-md border border-gray-600 py-2 text-xs font-medium text-gray-400 hover:bg-gray-700 hover:text-white transition"
            >
              <span>🔐</span>
              관리자 로그인
            </Link>

            {/* 보안 안내 */}
            <div className="mt-6 rounded bg-[#2a2a2a] px-3 py-3 text-xs text-gray-400 leading-relaxed">
              <p>● 개인정보 보호를 위해 공공 PC에서 사용 후 반드시 로그아웃 해주시기 바랍니다. 브라우저는 크롬이나 엣지를 권장합니다.</p>
            </div>
          </div>
          </div>{/* 카드 끝 */}

          {/* 하단 푸터 */}
          <footer className="mt-4 text-center text-xs text-gray-400">
            <p>(47227) 부산광역시 해운대구 (우동) 현규대학교</p>
            <p className="mt-1">TEL: 051-860-3114 | FAX: 051-860-3115 | COPYRIGHT © 2026 HYUNGYU UNIVERSITY. ALL RIGHTS RESERVED.</p>
          </footer>
        </div>{/* max-w-3xl 컨테이너 끝 */}
      </main>
    </div>
  )
}

/**
 * 다크 배경용 로그인 폼 (기존 LoginForm의 스타일을 다크 테마로 오버라이드)
 */
function LoginFormDark() {
  // LoginForm 훅을 직접 사용하여 다크 스타일로 렌더링
  return <LoginFormDarkInner />
}

function LoginFormDarkInner() {
  // 기존 LoginForm 컴포넌트를 다크 테마 래퍼로 감싸기
  return (
    <div className="[&_label]:text-gray-300 [&_input]:bg-white [&_input]:text-gray-800 [&_input]:border-gray-300 [&_input:focus]:ring-red-400 [&_input:focus]:border-red-400">
      <LoginForm />
    </div>
  )
}
