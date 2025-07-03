## BUILD ENVIRONMENT
FROM node:20-alpine AS build

# Рабочая директория
WORKDIR /usr/src/app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем все зависимости (включая devDependencies для сборки)
RUN npm ci

# Копируем проект
COPY . .

# Сборка приложения
RUN npm run build

## PRODUCTION ENVIRONMENT
FROM nginx:stable-alpine

# Копируем конфигурацию Nginx
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Копируем билд Vue.js (папка dist)
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"] 