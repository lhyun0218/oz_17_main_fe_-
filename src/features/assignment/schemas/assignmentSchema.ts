import { z } from 'zod'

const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'pptx', 'zip', 'jpg', 'png']
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export const fileSchema = z.instanceof(File).superRefine((file, ctx) => {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    ctx.addIssue({ code: 'custom', message: '지원하지 않는 파일 형식입니다' })
  }
  if (file.size > MAX_FILE_SIZE) {
    ctx.addIssue({ code: 'custom', message: '파일 크기는 50MB 이하여야 합니다' })
  }
})

export const assignmentSubmitSchema = z.object({
  textContent: z.string().optional(),
  files: z.array(fileSchema).optional(),
})
