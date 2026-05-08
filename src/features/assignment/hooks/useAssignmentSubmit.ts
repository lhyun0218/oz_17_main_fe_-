import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { fileSchema } from '../schemas/assignmentSchema'
import { submitAssignment } from '../api/assignmentApi'

export function useAssignmentSubmit(assignmentId: string) {
  const [files, setFiles] = useState<File[]>([])
  const [fileErrors, setFileErrors] = useState<string[]>([])
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  /**
   * 파일을 fileSchema로 검증 후 목록에 추가한다.
   * 검증 실패 시 오류 메시지를 fileErrors에 추가한다.
   */
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

  /**
   * 파일 목록에서 특정 인덱스의 파일을 제거한다.
   */
  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  /**
   * 마감 여부를 확인한다.
   * dueDate가 현재 시각보다 이전이면 마감된 것으로 판단한다.
   */
  function isExpired(dueDate: string): boolean {
    return new Date(dueDate) < new Date()
  }

  const mutation = useMutation({
    mutationFn: ({ textContent }: { textContent: string }) =>
      submitAssignment(assignmentId, textContent, files),
    onSuccess: () => {
      setSuccessMessage('과제가 성공적으로 제출되었습니다')
      setSubmitError(null)
      // 3초 후 성공 메시지 자동 제거
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
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
