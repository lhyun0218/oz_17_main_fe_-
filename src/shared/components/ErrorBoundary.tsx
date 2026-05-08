import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] 렌더링 오류 발생:', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          role="alert"
          className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center"
        >
          <div className="text-4xl mb-4" aria-hidden="true">⚠️</div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            오류가 발생했습니다
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 다시 시도해 주세요.
          </p>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-[#ef4444] text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
          >
            다시 시도
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
