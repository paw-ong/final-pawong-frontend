// src/api/client.js
import axios from 'axios';

const client = axios.create({
    baseURL: '/api', // 상대 경로 활용
    timeout: 20000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// token 있으면 요청 헤더에 추가
client.interceptors.request.use(config => {
    const token = localStorage.getItem('userToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => Promise.reject(error));

// 응답 에러 처리
client.interceptors.response.use(
    // 성공적인 응답 처리
    response => ({
        status: response.status,
        data: response.data
      }),
    // 에러 응답 처리
    error => {
        if (error.response && error.response.data) {
            return Promise.reject({
                status: error.response.status,
                code: error.response.data.code,
                message: error.response.data.message
              });
        }
        // 네트워크 오류 등
        return Promise.reject({
          status: null,
          code: 'NETWORK_ERROR',
          message: error.message
        });
      }
);


export default client;