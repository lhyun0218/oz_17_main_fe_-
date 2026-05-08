import { useRef, useState } from 'react'

interface FileUploadAreaProps {
  files: File[]
  fileErrors: string[]
  onAddFile: (file: File) => void
  onRemoveFile: (index: number) => void
}

/**
 * 파일 크기를 사람이 읽기 쉬운 형식으로 변환한다.
 * 1024 미만이면 KB, 이상이면 MB로 표시한다.
 */
function formatFileSize(bytes: number): string {
  const kb = bytes / 1024
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`
  }
  return `${(kb / 1024).toFixed(1)} MB`
}

const FileUploadArea = ({
  files,
  fileErrors,
  onAddFile,
  onRemoveFile,
}: FileUploadAreaProps) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragOver(true)
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragOver(false)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    droppedFiles.forEach((file) => onAddFile(file))
  }

  function handleClick() {
    inputRef.current?.click()
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files ?? [])
    selectedFiles.forEach((file) => onAddFile(file))
    // 같은 파일 재선택 가능하도록 초기화
    e.target.value = ''
  }

  return (
    <div className="space-y-3">
      {/* 드래그앤드롭 영역 */}
      <div
        role="button"
        tabIndex={0}
        aria-label="파일 업로드 영역. 클릭하거나 파일을 드래그하여 업로드하세요"
        className={[
          'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors',
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100',
        ].join(' ')}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
      >
        <svg
          className="h-10 w-10 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="text-sm font-medium text-gray-700">
          파일을 드래그하거나 클릭하여 업로드
        </p>
        <p className="text-xs text-gray-500">
          PDF, DOCX, PPTX, ZIP, JPG, PNG (최대 50MB)
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.pptx,.zip,.jpg,.jpeg,.png"
          className="hidden"
          onChange={handleInputChange}
          aria-hidden="true"
        />
      </div>

      {/* 파일 오류 메시지 */}
      {fileErrors.length > 0 && (
        <ul className="space-y-1" role="alert">
          {fileErrors.map((error, i) => (
            <li key={i} className="text-sm text-red-600">
              {error}
            </li>
          ))}
        </ul>
      )}

      {/* 업로드된 파일 목록 */}
      {files.length > 0 && (
        <ul className="space-y-2" aria-label="업로드된 파일 목록">
          {files.map((file, index) => (
            <li
              key={index}
              className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <svg
                  className="h-4 w-4 shrink-0 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="truncate text-sm text-gray-700">{file.name}</span>
                <span className="shrink-0 text-xs text-gray-400">
                  ({formatFileSize(file.size)})
                </span>
              </div>
              <button
                type="button"
                aria-label={`${file.name} 삭제`}
                className="ml-2 shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500 transition-colors"
                onClick={() => onRemoveFile(index)}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default FileUploadArea
