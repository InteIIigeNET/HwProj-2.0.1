#!/bin/bash

# Сохраняем текущий коммит перед pull
PREV_COMMIT=$(git rev-parse HEAD)

# Обновляем локальный репозиторий
echo "Pulling latest changes from git..."
sudo git pull

# Определяем измененные файлы с последнего коммита перед pull
CHANGED_FILES=$(git diff --name-only $PREV_COMMIT)

# Определяем, какие сервисы нужно перезапустить
SERVICES=()

# Привязка файлов к сервисам
if echo "$CHANGED_FILES" | grep -q "HwProj.APIGateway/"; then
    SERVICES+=(hwproj.apigateway.api)
fi
if echo "$CHANGED_FILES" | grep -q "HwProj.AuthService/"; then
    SERVICES+=(hwproj.authservice.api)
fi
if echo "$CHANGED_FILES" | grep -q "HwProj.CoursesService/"; then
    SERVICES+=(hwproj.coursesservice.api)
fi
if echo "$CHANGED_FILES" | grep -q "HwProj.NotificationsService/"; then
    SERVICES+=(hwproj.notificationsservice.api)
fi
if echo "$CHANGED_FILES" | grep -q "HwProj.SolutionsService/"; then
    SERVICES+=(hwproj.solutionsservice.api)
fi
if echo "$CHANGED_FILES" | grep -q "HwProj.ContentService/"; then
    SERVICES+=(hwproj.contentservice.api)
fi
if echo "$CHANGED_FILES" | grep -q "hwproj.front/"; then
    SERVICES+=(front)
fi

# Если нет изменений в сервисах, выходим
if [ ${#SERVICES[@]} -eq 0 ]; then
    echo "No relevant changes detected. Exiting."
    exit 0
fi

# Останавливаем затронутые сервисы
echo "Stopping services: ${SERVICES[@]}"
sudo docker compose stop ${SERVICES[@]}

# Пересобираем сервисы
echo "Building services: ${SERVICES[@]}"
sudo docker compose build ${SERVICES[@]}

# Запускаем сервисы
echo "Starting services: ${SERVICES[@]}"
sudo docker compose up -d ${SERVICES[@]}

# Если были изменения для фронтенда, перезапускаем nginx
if [[ " ${SERVICES[@]} " =~ " front " ]]; then
    echo "Frontend updated. Reloading Nginx..."
    if sudo systemctl reload nginx; then
        echo "Nginx successfully reloaded"
    else
        echo "Nginx reload failed!" >&2
        exit 1
    fi
fi

echo "Done."
