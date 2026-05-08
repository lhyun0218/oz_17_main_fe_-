import { Link } from 'react-router-dom'
import { useSignup } from '../features/auth/hooks/useSignup'

const STEPS = [
  { number: 1, label: '학번 인증', description: '학번과 이름으로 재학생 확인' },
  { number: 2, label: '정보 입력', description: '비밀번호 설정' },
  { number: 3, label: '가입 완료', description: '로그인 후 이용 가능' },
]

export function SignupPage() {
  // step 상태를 읽기 위해 훅을 여기서도 사용하지 않고,
  // SignupForm 내부에서 관리하므로 별도 prop drilling 없이 처리
  // 대신 step 표시를 위해 별도 컴포넌트로 분리
  return <SignupPageInner />
}

function SignupPageInner() {
  const signup = useSignup()

  return (
    /* 전체 배경: 연한 회색 */
    <div className="min-h-screen w-full bg-gray-100 flex flex-col items-center justify-center px-4 py-12">
      {/* 중앙 카드 */}
      <div className="w-full max-w-3xl overflow-hidden rounded-lg shadow-lg bg-white flex">
        {/* 좌측: 계정 생성 안내 */}
        <div className="hidden md:flex md:w-[42%] flex-col justify-between border-r border-gray-100 px-8 py-8">
          <div>
            <h2 className="mb-6 text-xl font-bold text-gray-800">계정 생성 안내</h2>
            <StepIndicatorLight currentStep={signup.step} />

            {/* 등록안내 박스 */}
            <div className="mt-8 rounded-md bg-gray-50 border border-gray-200 px-4 py-4 text-xs text-gray-500 leading-relaxed">
              <p className="font-semibold text-gray-600 mb-2">● 등록안내 주의사항</p>
              <ul className="space-y-1 list-none">
                <li>· 신입생의 경우 학적 정보 등록 후 가입이 가능합니다.</li>
                <li>· 학번과 학번 뒤 7자리를 조회 후 비밀번호를 설정하세요.</li>
                <li>· 인증 실패 시 고객센터(051-860-0000)로 문의 바랍니다.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 우측: 폼 영역 */}
        <div className="flex flex-1 flex-col justify-center px-8 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {signup.step === 'verify' ? '학번 인증' : '비밀번호 설정'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {signup.step === 'verify'
                ? '본인 확인을 위해 이름과 학번을 입력해 주세요.'
                : '사용할 비밀번호를 입력해 주세요.'}
            </p>
          </div>

          <SignupFormWithHook signup={signup} />

          <p className="mt-6 text-center text-sm text-gray-500">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="font-semibold text-[#ef4444] hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * 밝은 배경용 스텝 인디케이터 (회원가입 카드 내부)
 */
function StepIndicatorLight({ currentStep }: { currentStep: 'verify' | 'password' }) {
  const activeStep = currentStep === 'verify' ? 1 : 2

  return (
    <div className="flex flex-col gap-5">
      {STEPS.map((step) => {
        const isActive = step.number === activeStep
        const isDone = step.number < activeStep

        return (
          <div key={step.number} className="flex items-start gap-3">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                isDone
                  ? 'bg-green-500 text-white'
                  : isActive
                  ? 'bg-[#ef4444] text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {isDone ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.number
              )}
            </div>
            <div>
              <p className={`text-sm font-semibold ${isActive ? 'text-gray-900' : isDone ? 'text-gray-600' : 'text-gray-400'}`}>
                {step.label}
              </p>
              <p className={`text-xs ${isActive ? 'text-gray-500' : 'text-gray-400'}`}>
                {step.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// SignupForm과 동일한 훅 인스턴스를 공유하기 위한 래퍼
function SignupFormWithHook({ signup }: { signup: ReturnType<typeof useSignup> }) {
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
  } = signup

  if (step === 'verify') {
    const {
      register,
      formState: { errors },
    } = verifyForm

    return (
      <form onSubmit={handleVerify} noValidate>
        {verifyError && (
          <div role="alert" className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {verifyError}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="studentId" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Student ID</label>
          <div className="flex gap-2">
            <input
              id="studentId"
              type="text"
              inputMode="numeric"
              placeholder="학번 8자리를 입력하세요"
              {...register('studentId')}
              className={`flex-1 rounded-md border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-red-400 ${errors.studentId ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white focus:border-red-400'}`}
            />
            <button
              type="submit"
              disabled={isVerifying}
              className="shrink-0 rounded-md bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60 transition"
            >
              {isVerifying ? '조회 중...' : 'DB 조회'}
            </button>
          </div>
          {errors.studentId && <p className="mt-1 text-xs text-red-500">{errors.studentId.message}</p>}
          <p className="mt-1 text-xs text-blue-500">● 학번을 입력하고 조회 버튼을 눌러주세요.</p>
        </div>

        <div className="mb-6">
          <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Name</label>
          <input
            id="name"
            type="text"
            placeholder="성명을 입력하세요"
            {...register('name')}
            className={`w-full rounded-md border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-red-400 ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white focus:border-red-400'}`}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div className="flex gap-3 mt-6">
          <Link
            to="/login"
            className="flex-1 rounded-md border border-gray-300 py-2.5 text-center text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={isVerifying}
            className="flex-1 rounded-md bg-[#ef4444] py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <>
                <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                인증 중...
              </>
            ) : '다음 단계로'}
          </button>
        </div>
      </form>
    )
  }

  const {
    register,
    formState: { errors },
  } = signupForm

  return (
    <form onSubmit={handleSignup} noValidate>
      {signupError && (
        <div role="alert" className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {signupError}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
        <input
          id="password"
          type="password"
          placeholder="영문, 숫자, 특수문자 포함 8자 이상"
          autoComplete="new-password"
          {...register('password')}
          className={`w-full rounded-md border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-red-400 ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white focus:border-red-400'}`}
        />
        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
      </div>

      <div className="mb-6">
        <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인</label>
        <input
          id="passwordConfirm"
          type="password"
          placeholder="비밀번호를 다시 입력하세요"
          autoComplete="new-password"
          {...register('passwordConfirm')}
          className={`w-full rounded-md border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-red-400 ${errors.passwordConfirm ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white focus:border-red-400'}`}
        />
        {errors.passwordConfirm && <p className="mt-1 text-xs text-red-500">{errors.passwordConfirm.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSigningUp}
        className="w-full rounded-md bg-[#ef4444] py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {isSigningUp ? (
          <>
            <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            가입 중...
          </>
        ) : '가입 완료'}
      </button>
    </form>
  )
}
