import axios from 'axios';
import useAuthStore from '../store/authStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 5000,
});

// 요청 인터셉터: 모든 요청에 JWT 토큰 자동 첨부 (Requirements 3.1)
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 401 응답 시 자동 로그아웃 처리 (Requirements 3.2)
// /auth/login 경로의 401은 세션 만료가 아닌 로그인 실패이므로 제외
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url ?? ''
    const isLoginRequest =
      requestUrl.includes('/auth/login') || requestUrl.includes('/auth/admin/login')

    if (error.response?.status === 401 && !isLoginRequest) {
      useAuthStore.getState().logout();
      window.location.href = '/login?expired=true';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
