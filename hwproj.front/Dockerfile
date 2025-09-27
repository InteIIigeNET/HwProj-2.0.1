FROM node:22.14.0-alpine AS builder

WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Устанавливаем зависимости в node_modules
RUN npm install --force

# Bundle app source
COPY . .

# Устанвливаем переменные для production-сборки
# Актуальные значения подтягиваются из docker-compose.override.yml
ARG VITE_YANDEX_METRICA_ID

# Собираем статику в /usr/src/app/dist
RUN npm run build

# Финализируем образ
FROM alpine:latest
COPY --from=builder /usr/src/app/dist /static