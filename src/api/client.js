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
    // 성공적인 응답 처리
    response => ({
        status: response.status,
        data: response.data
      }),
    // 에러 응답 처리
    error => {
        const { response, config: originalRequest } = err
        if (response?.status === 401) {
            const code = response.data?.code
            console.log(code)
      
            // 2-1) 토큰 만료
            // if (!isRefreshing) {
            //   isRefreshing = true
            //   // 리프레시 토큰으로 재발급
            //   return client
            //     .post('/auth/refresh')
            //     .then(refreshRes => {
            //       isRefreshing = false
            //       processQueue(null, refreshRes.data)  // 만약 새 토큰을 body로 받았다면
            //       // 원래 요청 재시도
            //       return client(originalRequest)
            //     })
            //     .catch(refreshErr => {
            //       isRefreshing = false
            //       processQueue(refreshErr, null)
            //       // 재발급 실패 → 로그인 페이지로
            //       window.location.href = '/login'
            //       return Promise.reject(refreshErr)
            //     })
            // }
      
            // 이미 리프레시 중이면 큐에 대기
            // return new Promise((resolve, reject) => {
            //   failedQueue.push({ resolve, reject })
            // }).then(() => client(originalRequest))
      
        }
      
    // 그 외는 그냥 reject
    return Promise.reject(err)
}
)


export default client;