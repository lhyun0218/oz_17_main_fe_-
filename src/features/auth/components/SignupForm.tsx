import { useSignup } from '../hooks/useSignup'

export function SignupForm() {
  const {
    step,
    verifyForm,
    signupForm,
    handleVerify,
    handleSignup,
    verifyError,
    signupError,
    isVerifying,
    isSigningUp,
  } = useSignup()

  if (step === 'verify') {
    const {
      register,
      formState: { errors },
    } = verifyForm

    return (
      <form onSubmit={handleVerify} noValidate>
        {verifyError && (
          <div
            role="alert"
            className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600"
          >
            {verifyError}
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
            placeholder="학번 8자리를 입력하세요"
            {...register('studentId')}
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
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            이름
          </label>
          <input
            id="name"
            type="text"
            placeholder="이름을 입력하세요"
            {...register('name')}
            className={`w-full rounded-md border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-red-400 ${
              errors.name
                ? 'border-red-400 bg-red-50'
                : 'border-gray-300 bg-white focus:border-red-400'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isVerifying}
          className="w-full rounded-md bg-[#ef4444] py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isVerifying ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              인증 중...
            </>
          ) : (
            '학번 인증'
          )}
        </button>
      </form>
    )
  }

  // step === 'password'
  const {
    register,
    formState: { errors },
  } = signupForm

  return (
    <form onSubmit={handleSignup} noValidate>
      {signupError && (
        <div
          role="alert"
          className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600"
        >
          {signupError}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          placeholder="영문, 숫자, 특수문자 포함 8자 이상"
          autoComplete="new-password"
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

      <div className="mb-6">
        <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
          비밀번호 확인
        </label>
        <input
          id="passwordConfirm"
          type="password"
          placeholder="비밀번호를 다시 입력하세요"
          autoComplete="new-password"
          {...register('passwordConfirm')}
          className={`w-full rounded-md border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-red-400 ${
            errors.passwordConfirm
              ? 'border-red-400 bg-red-50'
              : 'border-gray-300 bg-white focus:border-red-400'
          }`}
        />
        {errors.passwordConfirm && (
          <p className="mt-1 text-xs text-red-500">{errors.passwordConfirm.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSigningUp}
        className="w-full rounded-md bg-[#ef4444] py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {isSigningUp ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            가입 중...
          </>
        ) : (
          '가입 완료'
        )}
      </button>
    </form>
  )
}
