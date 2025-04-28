#!/bin/bash

# Директория для удаления файлов на диске (сервере)
TARGET_DIR="/home/alex/docker/backups_storage"
echo -e "\nУдаляем бэкапы в папке $TARGET_DIR старше 30 дней!"

# Удаляем с диска файлы старше 30 дней, которые начинаются на backup
find "$TARGET_DIR" -type f -name 'backup*' -mtime +30 -print -exec rm {} \;

# Директория для удаления файлов во внешнем хранилище (Яндекс.Диске)
TARGET_YANDEX_DIR="mssql_backups"
echo -e "\nУдаляем бэкапы на Яндекс.Диске в папке $TARGET_YANDEX_DIR старше 30 дней!"
rclone delete yadisk:"$TARGET_YANDEX_DIR" --min-age 30d --include 'backup*'
