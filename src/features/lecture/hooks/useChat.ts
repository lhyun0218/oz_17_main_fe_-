import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getChatMessages, sendChatMessage } from '../api/lectureApi'
import { chatMessageSchema, type ChatMessageFormValues } from '../schemas/chatSchema'

export function useChat(courseId: string) {
  const queryClient = useQueryClient()

  // 3초마다 폴링으로 메시지 목록 갱신
  const {
    data: messages = [],
    isError,
    isLoading,
  } = useQuery({
    queryKey: ['chat', courseId],
    queryFn: () => getChatMessages(courseId),
    refetchInterval: 3000,
    enabled: !!courseId,
  })

  const mutation = useMutation({
    mutationFn: (content: string) => sendChatMessage(courseId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', courseId] })
    },
  })

  const form = useForm<ChatMessageFormValues>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues: {
      content: '',
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate(values.content, {
      onSuccess: () => {
        form.reset()
      },
    })
  })

  // 연결 끊김 상태 메시지
  const connectionError = isError
    ? '채팅 연결이 끊어졌습니다. 재연결 중...'
    : null

  return {
    messages,
    isLoading,
    isError,
    connectionError,
    isSending: mutation.isPending,
    form,
    onSubmit,
  }
}
