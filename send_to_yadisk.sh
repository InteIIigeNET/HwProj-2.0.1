#!/bin/bash

# Принимаем название файла из параметра
FILE_NAME="$1"

# Проверяем имя файла на непустоту
if [ -z "$FILE_NAME" ]; then
  echo "Ошибка: имя выгружаемого файла не передано в виде параметра"
  exit 1
fi

echo "Имя выгружаемого файла: $FILE_NAME"

REMOTE_DIR="mssql_backups"  # Папка на Яндекс.Диске

# Загружаем файл через rclone
rclone copy "$FILE_NAME" yadisk:"$REMOTE_DIR" \
  --log-file="/var/log/yadisk_upload.log" \
  --stats=1s \
  --retries 3;
