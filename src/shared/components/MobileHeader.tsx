import useUIStore from '../../store/uiStore'

const MobileHeader = () => {
  const { sidebarOpen, toggleSidebar } = useUIStore()

  return (
    <header
      className="lg:hidden flex items-center gap-3 px-4 py-3 bg-[#1e1b4b] text-white shrink-0 z-30"
      role="banner"
    >
      {/* 햄버거 버튼 */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label={sidebarOpen ? '사이드바 닫기' : '사이드바 열기'}
        aria-expanded={sidebarOpen}
        aria-controls="main-sidebar"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          {sidebarOpen ? (
            // X 아이콘
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            // 햄버거 아이콘
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* 로고 */}
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">🎓</span>
        <div>
          <p className="text-sm font-bold leading-tight">현규대학교</p>
          <p className="text-xs text-white/60">LMS</p>
        </div>
      </div>
    </header>
  )
}

export default MobileHeader
