import { useState } from 'react'
import FileUploadArea from './FileUploadArea'
import { useAssignmentSubmit } from '../hooks/useAssignmentSubmit'

interface AssignmentSubmitFormProps {
  assignmentId: string
  dueDate: string
  isSubmitted: boolean
}

const AssignmentSubmitForm = ({
  assignmentId,
  dueDate,
  isSubmitted,
}: AssignmentSubmitFormProps) => {
  const [textContent, setTextContent] = useState('')
  const {
    files,
    fileErrors,
    addFile,
    removeFile,
    isExpired,
    successMessage,
    submitError,
    isPending,
    submit,
  } = useAssignmentSubmit(assignmentId)

  const expired = isExpired(dueDate)
  const isDisabled = expired || isSubmitted || isPending

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isDisabled) return
    submit({ textContent })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 성공 메시지 배너 */}
      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm font-medium text-green-800"
        >
          {successMessage}
        </div>
      )}

      {/* 실패 메시지 배너 */}
      {submitError && (
        <div
          role="alert"
          className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm font-medium text-red-800"
        >
          {submitError}
        </div>
      )}

      {/* 이미 제출된 과제 안내 */}
      {isSubmitted && (
        <div
          role="status"
          className="rounded-md bg-blue-50 border border-blue-200 px-4 py-3 text-sm font-medium text-blue-800"
        >
          이미 제출된 과제입니다
        </div>
      )}

      {/* 마감 안내 */}
      {expired && !isSubmitted && (
        <div
          role="status"
          className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm font-medium text-red-800"
        >
          마감된 과제입니다
        </div>
      )}

      {/* 파일 업로드 영역 */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          파일 첨부
        </label>
        <FileUploadArea
          files={files}
          fileErrors={fileErrors}
          onAddFile={addFile}
          onRemoveFile={removeFile}
        />
      </div>

      {/* 텍스트 답변 입력 */}
      <div>
        <label
          htmlFor="textContent"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          텍스트 답변
        </label>
        <textarea
          id="textContent"
          name="textContent"
          rows={6}
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          disabled={isDisabled}
          placeholder="답변을 입력하세요..."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 resize-y"
        />
      </div>

      {/* 제출 버튼 */}
      <button
        type="submit"
        disabled={isDisabled}
        aria-disabled={isDisabled}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
      >
        {isPending ? '제출 중...' : '과제 제출'}
      </button>
    </form>
  )
}

export default AssignmentSubmitForm
