import { z } from 'zod'

export const loginSchema = z.object({
  studentId: z
    .string()
    .min(1, '필수 입력 항목입니다')
    .regex(/^\d+$/, '학번은 숫자만 입력 가능합니다')
    .length(8, '학번은 8자리입니다'),
  password: z.string().min(1, '필수 입력 항목입니다'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
