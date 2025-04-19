FROM node:22.14.0-alpine

RUN apk add --no-cache xdg-utils

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Устанавливаем зависимости в node_modules
RUN npm install

# Bundle app source
COPY . .

# Собираем проект в dist/ (сборка для production)
# RUN npm run build

# Запуск в development-режиме
EXPOSE 3000
CMD [ "npm", "run", "dev" ]