# Build Stage -> 프로덕션 빌드
FROM node:18-alpine AS builder
WORKDIR /app

# 의존성 설치
COPY package.json package-lock.json ./
RUN npm install

# 2. 전체 소스 복사 → 프로덕션 빌드
COPY . .
RUN npm run build

# Runtime Stage -> 정적 파일 서빙
FROM node:18-alpine AS runner
WORKDIR /app

# builder 스테이지에서 생성된 dist 폴더만 복사
COPY --from=builder /app/dist ./dist

# 경량 정적서버 패키지(serve)를 전역 설치
RUN npm install -g serve

EXPOSE 5004

# 6. 최종 실행 명령: dist/ 아래를 정적 서빙 → 포트 5004에서 리스닝
CMD ["serve", "-s", "dist", "-l", "5004"]