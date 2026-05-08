import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import MobileHeader from './MobileHeader'
import useUIStore from '../../store/uiStore'
import useMediaQuery from '../hooks/useMediaQuery'

const Layout = () => {
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* skip-to-content 링크 (접근성) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-[#1e1b4b] focus:rounded-lg focus:font-medium focus:shadow-lg"
      >
        메인 콘텐츠로 바로 이동
      </a>

      {/* 모바일 헤더 */}
      <MobileHeader />

      <div className="flex flex-1 overflow-hidden relative">
        {/* 모바일 오버레이 배경 */}
        {!isDesktop && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
            role="presentation"
          />
        )}

        {/* 사이드바 */}
        <Sidebar />

        {/* 메인 콘텐츠 */}
        <main
          id="main-content"
          className="flex-1 overflow-auto bg-gray-50"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
