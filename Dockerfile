FROM node:18 AS build
WORKDIR /app

# package.json과 package-lock.json을 먼저 복사하여 의존성 설치
COPY package.json package-lock.json ./
RUN npm install @rollup/rollup-linux-x64-gnu --save-optional
RUN npm install

# 전체 소스 코드 복사 후 빌드 실행
COPY . .

# 컨테이너에 가동시 실행되는 명령
CMD ["npm", "run", "dev"]