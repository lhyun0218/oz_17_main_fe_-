import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { signupVerifySchema, signupSchema, type SignupVerifyValues, type SignupFormValues } from '../schemas/signupSchema'
import { authApi } from '../api/authApi'

export function useSignup() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'verify' | 'password'>('verify')
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [signupError, setSignupError] = useState<string | null>(null)

  const verifyForm = useForm<SignupVerifyValues>({
    resolver: zodResolver(signupVerifySchema),
    defaultValues: {
      studentId: '',
      name: '',
    },
  })

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      studentId: '',
      name: '',
      password: '',
      passwordConfirm: '',
    },
  })

  const verifyMutation = useMutation({
    mutationFn: authApi.verifySignup,
    onSuccess: () => {
      const { studentId, name } = verifyForm.getValues()
      signupForm.setValue('studentId', studentId)
      signupForm.setValue('name', name)
      setStep('password')
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        if (error.response?.status === 409) {
          setVerifyError('이미 가입된 학번입니다')
        } else if (error.response?.status === 404) {
          setVerifyError('학번 또는 이름이 학적 정보와 일치하지 않습니다')
        } else {
          setVerifyError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요')
        }
      } else {
        setVerifyError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요')
      }
    },
  })

  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: () => {
      navigate('/login')
    },
    onError: () => {
      setSignupError('회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요')
    },
  })

  const handleVerify = verifyForm.handleSubmit((values) => {
    setVerifyError(null)
    verifyMutation.mutate(values)
  })

  const handleSignup = signupForm.handleSubmit((values) => {
    setSignupError(null)
    signupMutation.mutate({
      studentId: values.studentId,
      name: values.name,
      password: values.password,
    })
  })

  return {
    step,
    verifyForm,
    signupForm,
    handleVerify,
    handleSignup,
    verifyError,
    signupError,
    isVerifying: verifyMutation.isPending,
    isSigningUp: signupMutation.isPending,
  }
}
