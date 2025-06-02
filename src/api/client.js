// src/api/client.js
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

axios.defaults.withCredentials = true;

// CSRF 토큰 쿠키 발급 요청
await axios.get('/api/auth/csrf-token');

const client = axios.create({
    baseURL: '/api', // 상대 경로 활용
    timeout: 20000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// 토큰 재발급 중 플래그와 대기 큐
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    error ? prom.reject(error) : prom.resolve(token)
  })
  failedQueue = []
}

// 전역 이벤트를 통해 모달 표시
const showAuthModal = () => {
  const event = new CustomEvent('showAuthModal');
  window.dispatchEvent(event);
};

// 응답 인터셉터
client.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // X-Skip-Auth-Error 헤더가 있는 경우 401 에러 처리를 건너뜁니다
    if (error.response?.status === 401) {
      if (!originalRequest.headers['X-Skip-Auth-Error']) {
        console.log('401 에러 발생');
        window.dispatchEvent(new Event('showAuthModal'));
      }
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default client;