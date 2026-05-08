import { useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import useUIStore from '../../store/uiStore'
import useMediaQuery from '../hooks/useMediaQuery'

interface NavItem {
  to: string
  icon: string
  label: string
}

const navItems: NavItem[] = [
  { to: '/', icon: '🏠', label: '대시보드' },
  { to: '/courses', icon: '📚', label: '강의 목록' },
  { to: '/assignments', icon: '📝', label: '과제 제출' },
  { to: '/attendance', icon: '📊', label: '출석 현황' },
  { to: '/grades', icon: '🎓', label: '성적 / 학점' },
]

const Sidebar = () => {
  const { user, logout } = useAuthStore()
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const navigate = useNavigate()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const sidebarRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // 모바일에서 메뉴 클릭 시 사이드바 자동 닫기
  const handleNavClick = () => {
    if (!isDesktop) {
      setSidebarOpen(false)
    }
  }

  // 모바일 사이드바 열릴 때 포커스 트랩
  useEffect(() => {
    if (!isDesktop && sidebarOpen) {
      // 사이드바가 열리면 닫기 버튼에 포커스
      closeButtonRef.current?.focus()
    }
  }, [sidebarOpen, isDesktop])

  // ESC 키로 사이드바 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDesktop && sidebarOpen) {
        setSidebarOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isDesktop, sidebarOpen, setSidebarOpen])

  // 포커스 트랩: 모바일 사이드바 내에서만 Tab 이동
  useEffect(() => {
    if (isDesktop || !sidebarOpen) return

    const sidebar = sidebarRef.current
    if (!sidebar) return

    const focusableSelectors =
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = Array.from(
        sidebar.querySelectorAll<HTMLElement>(focusableSelectors)
      ).filter((el) => !el.closest('[aria-hidden="true"]'))

      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)
    return () => document.removeEventListener('keydown', handleTabKey)
  }, [isDesktop, sidebarOpen])

  return (
    <aside
      id="main-sidebar"
      ref={sidebarRef}
      className={[
        'flex flex-col h-full bg-[#1e1b4b] text-white shrink-0',
        // 데스크탑: 항상 표시, 모바일: 오버레이 방식
        'lg:relative lg:translate-x-0 lg:w-60',
        'fixed inset-y-0 left-0 w-72 z-40',
        'transition-transform duration-300 ease-in-out',
        !isDesktop && !sidebarOpen ? '-translate-x-full' : 'translate-x-0',
      ].join(' ')}
      aria-label="주요 네비게이션"
      aria-hidden={!isDesktop && !sidebarOpen}
    >
      {/* 로고 영역 */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">🎓</span>
          <div>
            <p className="text-sm font-bold leading-tight">현규대학교</p>
            <p className="text-xs text-white/60">LMS</p>
          </div>
        </div>

        {/* 모바일 닫기 버튼 */}
        <button
          ref={closeButtonRef}
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="사이드바 닫기"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="주요 메뉴">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={handleNavClick}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white',
              ].join(' ')
            }
          >
            <span className="text-base" aria-hidden="true">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* 사용자 정보 + 로그아웃 */}
      <div className="px-4 py-4 border-t border-white/10">
        {user && (
          <div className="flex items-center gap-3 mb-3">
            {/* 아바타 */}
            <div
              className="w-9 h-9 rounded-full bg-[#ef4444] flex items-center justify-center text-sm font-bold shrink-0"
              aria-hidden="true"
            >
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-white/60 truncate">{user.studentId}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="로그아웃"
        >
          <span aria-hidden="true">🚪</span>
          로그아웃
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
