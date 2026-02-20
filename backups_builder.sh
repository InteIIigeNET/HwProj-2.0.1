#!/bin/bash

# Нужен для запуска через cron. Актуализировать!
BASE_PATH=/home/hwproj_user/docker/HwProj-2.0.1

# Загрузка переменных из .env
set -a  # Экспортируем все переменные, пропуская комментарии и пустые строки
source <(grep -v '^\s*#' ${BASE_PATH}/.env | grep -v '^\s*$') || { echo "Не удалось загрузить .env файл!" >&2; exit 1; }
set +a # Останавливаем экспорт переменных

# Проверка, загружены ли необходимые переменные окружения
REQUIRED_VARS=("MSSQL_SA_PASSWORD" "MSSQL_BACKUPS_VOLUME" "BACKUPS_STORAGE")
for VAR in "${REQUIRED_VARS[@]}"; do
  [[ -z "${!VAR}" ]] && { echo "Ошибка: $VAR не задана в .env!" >&2; exit 1; }
done

# Задаем другие необходимые переменные
CONTAINER_NAME="mssqllocaldb"

# Устанавливаем временную зону на московское время
TZ="Europe/Moscow"
TIMESTAMP=$(TZ=$TZ date +"%d%m%Y-%H%M%S")  # Формат: ДДММГГГГ-ЧЧММСС

TMP_DIR="$BACKUPS_STORAGE/tmp_backup_$TIMESTAMP"
ARCHIVE_NAME="backup_$TIMESTAMP.tar.gz"

# Создаем временную директорию
mkdir -p $TMP_DIR || { echo "[ERROR] Не удалось создать $TMP_DIR" >&2; exit 1; }

# Получаем список всех БД (кроме системных)
DBS=$(docker exec $CONTAINER_NAME /opt/mssql-tools18/bin/sqlcmd \
  -S localhost \
  -U SA \
  -P "$MSSQL_SA_PASSWORD" \
  -C \
  -Q "SET NOCOUNT ON; SELECT name FROM sys.databases WHERE name NOT IN ('master','model','msdb','tempdb') AND state = 0;" \
  -h-1 \
  -W)

# Убираем лишние символы newline и пробелы вокруг запятых для вывода
DBS_CSV=$(echo "$DBS" | tr '\n' ',' | sed 's/,$//')
echo -e "\nБэкапы будут созданы для следующих БД: $DBS_CSV"

if [ -z "$DBS" ]; then
  echo "[ERROR] Нет БД для бэкапа." >&2
  exit 1
fi

# Бэкап каждой БД во временную директорию
for DB in $DBS; do
  BACKUP_FILE="${DB}.bak"
  echo -e "\n[$(TZ=$TZ date)] Создание бэкапа $DB..."
  docker exec $CONTAINER_NAME /opt/mssql-tools18/bin/sqlcmd \
    -S localhost -U SA -P "$MSSQL_SA_PASSWORD" \
    -C \
    -Q "BACKUP DATABASE [$DB] TO DISK = '/var/opt/mssql/backups/$BACKUP_FILE' WITH FORMAT, COMPRESSION, CHECKSUM;"

  # Проверка успешности выполнения
  if [ $? -eq 0 ]; then
      echo "[$(TZ=$TZ date)] Бэкап $BACKUP_FILE успешно создан" >> /var/log/mssql_backup.log
  else
      echo "[$(TZ=$TZ date)] Ошибка создания бэкапа $BACKUP_FILE !" >> /var/log/mssql_backup_error.log
      exit 1
  fi

  # Копирование бэкапа из volume во временную папку на хосте
  cp "$MSSQL_BACKUPS_VOLUME/$BACKUP_FILE" "$TMP_DIR/$BACKUP_FILE"
done

# Создаем архив со всеми бэкапами
tar -czvf "$BACKUPS_STORAGE/$ARCHIVE_NAME" -C "$TMP_DIR" . || { echo "[ERROR] Ошибка создания архива!" >&2; exit 1; }

# Удаляем временную папку с бэкапами и очищаем volume бэкапов
echo -e "\nОчищаем временные ресурсы"
rm -rf $TMP_DIR
rm -rf $MSSQL_BACKUPS_VOLUME/*

echo -e "\n[SUCCESS] Все БД сохранены в архив: $BACKUPS_STORAGE/$ARCHIVE_NAME"



# Если скрипт запущен с параметром выгрузки, вызываем скрипт для отправки бэкапа во внешнее хранилище
if [[ "$1" == *"yandex"* ]]; then
  echo -e "\nВыгружаем бэкап $BACKUP_FILE на диск в Yandex"
  ${BASE_PATH}/send_to_yadisk.sh "$BACKUPS_STORAGE/$ARCHIVE_NAME"
fi