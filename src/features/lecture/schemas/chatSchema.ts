import { z } from 'zod'

export const chatMessageSchema = z.object({
  content: z
    .string()
    .min(1, '메시지를 입력해 주세요')
    .max(500, '메시지는 500자 이내로 입력해 주세요'),
})

export type ChatMessageFormValues = z.infer<typeof chatMessageSchema>
