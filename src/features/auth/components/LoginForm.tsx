import { useLogin } from '../hooks/useLogin'

export function LoginForm() {
  const { form, onSubmit, serverError, isLoading } = useLogin()
  const {
    register,
    formState: { errors },
  } = form

  const handleStudentIdKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 숫자, 백스페이스, 탭, 방향키, Delete, Home, End 허용
    const allowedKeys = ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
    if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
      e.preventDefault()
    }
  }

  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 숫자 외 문자 제거
    const numericOnly = e.target.value.replace(/\D/g, '')
    e.target.value = numericOnly
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {serverError && (
        <div
          role="alert"
          className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600"
        >
          {serverError}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
          학번
        </label>
        <input
          id="studentId"
          type="text"
          inputMode="numeric"
          placeholder="학번 (Student ID)"
          autoComplete="username"
          {...register('studentId')}
          onKeyDown={handleStudentIdKeyDown}
          onChange={(e) => {
            handleStudentIdChange(e)
            register('studentId').onChange(e)
          }}
          className={`w-full rounded-md border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-red-400 ${
            errors.studentId
              ? 'border-red-400 bg-red-50'
              : 'border-gray-300 bg-white focus:border-red-400'
          }`}
        />
        {errors.studentId && (
          <p className="mt-1 text-xs text-red-500">{errors.studentId.message}</p>
        )}
      </div>

      <div className="mb-6">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          placeholder="비밀번호 (Password)"
          autoComplete="current-password"
          {...register('password')}
          className={`w-full rounded-md border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-red-400 ${
            errors.password
              ? 'border-red-400 bg-red-50'
              : 'border-gray-300 bg-white focus:border-red-400'
          }`}
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      <div className="mb-4 flex items-center gap-2">
        <input
          id="autoLogin"
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 accent-red-500"
        />
        <label htmlFor="autoLogin" className="text-sm text-gray-600 cursor-pointer">
          자동 로그인
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-[#ef4444] py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            로그인 중...
          </>
        ) : (
          '로그인'
        )}
      </button>
    </form>
  )
}
