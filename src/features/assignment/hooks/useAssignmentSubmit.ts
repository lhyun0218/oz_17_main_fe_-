import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fileSchema } from '../schemas/assignmentSchema'
import { submitAssignment } from '../api/assignmentApi'

export function useAssignmentSubmit(assignmentId: string) {
  const queryClient = useQueryClient()
  const [files, setFiles] = useState<File[]>([])
  const [fileErrors, setFileErrors] = useState<string[]>([])
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  function addFile(file: File) {
    const result = fileSchema.safeParse(file)
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message)
      setFileErrors((prev) => [...prev, ...messages])
      return
    }
    setFiles((prev) => [...prev, file])
    setFileErrors([])
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function isExpired(dueDate: string): boolean {
    return new Date(dueDate) < new Date()
  }

  const mutation = useMutation({
    mutationFn: ({ textContent }: { textContent: string }) =>
      submitAssignment(assignmentId, textContent, files),
    onSuccess: () => {
      setSuccessMessage('과제가 성공적으로 제출되었습니다')
      setSubmitError(null)
      // 과제 상세 쿼리 무효화 → isSubmitted: true로 즉시 반영
      queryClient.invalidateQueries({ queryKey: ['assignment', assignmentId] })
      // 대시보드 과제 목록도 갱신
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: () => {
      setSubmitError('제출에 실패했습니다. 다시 시도해 주세요')
      setSuccessMessage(null)
    },
  })

  return {
    files,
    fileErrors,
    addFile,
    removeFile,
    isExpired,
    successMessage,
    submitError,
    isPending: mutation.isPending,
    submit: mutation.mutate,
  }
}
