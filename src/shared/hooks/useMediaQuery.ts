import { useState, useEffect } from 'react'

/**
 * window.matchMedia를 사용하여 미디어 쿼리 상태를 반환하는 훅
 * SSR 안전하게 처리 (window 없을 때 false 반환)
 *
 * @example
 * const isDesktop = useMediaQuery('(min-width: 1024px)')
 */
const useMediaQuery = (query: string): boolean => {
  const getMatches = (): boolean => {
    // SSR 환경에서는 window가 없으므로 false 반환
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  }

  const [matches, setMatches] = useState<boolean>(getMatches)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQueryList = window.matchMedia(query)
    setMatches(mediaQueryList.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // 최신 브라우저는 addEventListener, 구형은 addListener
    mediaQueryList.addEventListener('change', handleChange)

    return () => {
      mediaQueryList.removeEventListener('change', handleChange)
    }
  }, [query])

  return matches
}

export default useMediaQuery
