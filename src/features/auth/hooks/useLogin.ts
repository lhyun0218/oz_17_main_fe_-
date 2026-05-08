import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { loginSchema, type LoginFormValues } from '../schemas/loginSchema'
import { authApi } from '../api/authApi'
import useAuthStore from '../../../store/authStore'

export function useLogin() {
  const navigate = useNavigate()
  const { setToken, setUser } = useAuthStore()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      studentId: '',
      password: '',
    },
  })

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setToken(data.token)
      setUser(data.user)
      navigate('/')
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          setServerError('학번 또는 비밀번호가 올바르지 않습니다')
        } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          setServerError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요')
        } else {
          setServerError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요')
        }
      } else {
        setServerError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요')
      }
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null)
    mutation.mutate(values)
  })

  return {
    form,
    onSubmit,
    serverError,
    isLoading: mutation.isPending,
  }
}
