import { z } from 'zod'

export const signupVerifySchema = z.object({
  studentId: z.string().min(1, '필수 입력 항목입니다').regex(/^\d{8}$/, '학번은 8자리 숫자입니다'),
  name: z.string().min(1, '필수 입력 항목입니다'),
})

export const signupSchema = signupVerifySchema.extend({
  password: z
    .string()
    .min(8, '비밀번호는 영문, 숫자, 특수문자를 포함한 8자 이상이어야 합니다')
    .regex(
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/,
      '비밀번호는 영문, 숫자, 특수문자를 포함한 8자 이상이어야 합니다'
    ),
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['passwordConfirm'],
})

export type SignupFormValues = z.infer<typeof signupSchema>
export type SignupVerifyValues = z.infer<typeof signupVerifySchema>
