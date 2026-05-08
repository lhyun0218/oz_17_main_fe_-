export interface LoginRequest {
  studentId: string
  password: string
}

export interface LoginResponse {
  token: string
  user: {
    studentId: string
    name: string
  }
}

export interface SignupVerifyRequest {
  studentId: string
  name: string
}

export interface SignupRequest {
  studentId: string
  name: string
  password: string
}
