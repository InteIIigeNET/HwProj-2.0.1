#!/bin/bash

# Загрузка переменных из .env
set -a  # Экспортируем все переменные, пропуская комментарии и пустые строки
source <(grep -v '^\s*#' ./.env | grep -v '^\s*$') || { echo "Не удалось загрузить .env файл!" >&2; exit 1; }
set +a # Останавливаем экспорт переменных

# Проверка, загружены ли необходимые переменные окружения
REQUIRED_VARS=("MSSQL_SA_PASSWORD" "MSSQL_BACKUPS_VOLUME" "BACKUPS_STORAGE")
for VAR in "${REQUIRED_VARS[@]}"; do
  [[ -z "${!VAR}" ]] && { echo "Ошибка: $VAR не задана в .env!" >&2; exit 1; }
done

# Задаем другие необходимые переменные
CONTAINER_NAME="mssqllocaldb"
#ARCHIVE_NAME="backup_$TIMESTAMP.tar.gz"

# Задайте требуемое архива ARCHIVE_NAME и удалите строку exit 1;
exit 1;
# Задайте требуемое архива ARCHIVE_NAME и удалите строку exit 1;

TZ="Europe/Moscow"
TIMESTAMP=$(TZ=$TZ date +"%d%m%Y-%H%M%S")  # Формат: ДДММГГГГ-ЧЧММСС
TMP_DIR="$BACKUPS_STORAGE/tmp_extract_$TIMESTAMP"

# Создаем временную директорию для извлечения из архива
mkdir -p $TMP_DIR || { echo "[ERROR] Не удалось создать $TMP_DIR" >&2; exit 1; }

# Достаем из архива все bak-файлы и копируем в volume бэкапов ms sql
tar -xzvf "$BACKUPS_STORAGE/$ARCHIVE_NAME" -C "$TMP_DIR"
cp $TMP_DIR/*.bak "$MSSQL_BACKUPS_VOLUME"

# Выполняем восстановление каждой базы данных
for BACKUP_FILE in $MSSQL_BACKUPS_VOLUME/*.bak; do
  # Получаем только имя файла без пути
  BACKUP_FILE_NAME=$(basename "$BACKUP_FILE")
  # Получаем название базы данных из имени файла
  DB_NAME=$(basename "$BACKUP_FILE" .bak)

  # Перевод БД в однопользовательский режим для обеспечения эксклюзивного доступа
  echo -e "\nГотовим базу $DB_NAME к восстановлению"
  docker exec -it "$CONTAINER_NAME" /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P "$MSSQL_SA_PASSWORD" -C \
    -Q "ALTER DATABASE [$DB_NAME] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;"
     
  echo "Начинаем восстановление $DB_NAME из файла $BACKUP_FILE_NAME"
  docker exec -it "$CONTAINER_NAME" /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P "$MSSQL_SA_PASSWORD" -C \
    -Q "RESTORE DATABASE [$DB_NAME] FROM DISK = '/var/opt/mssql/backups/$BACKUP_FILE_NAME' \
        WITH MOVE '${DB_NAME}' TO '/var/opt/mssql/data/$DB_NAME.mdf', \
             MOVE '${DB_NAME}_log' TO '/var/opt/mssql/data/${DB_NAME}_log.ldf', \
             REPLACE;"

  # Возвращаем БД в многопользовательский режим
  docker exec -it "$CONTAINER_NAME" /opt/mssql-tools18/bin/sqlcmd -S localhost -U SA -P "$MSSQL_SA_PASSWORD" -C \
    -Q "ALTER DATABASE [$DB_NAME] SET MULTI_USER;"

  # Проверка успешности выполнения
  if [ $? -eq 0 ]; then
      echo -e "\n[$(date)] БД $DB_NAME успешно восстановлена" >> /var/log/mssql_backup.log
  else
      echo "[$(date)] Ошибка восстановления БД $DB_NAME !" >> /var/log/mssql_backup_error.log
      exit 1
  fi
done

# Удаляем временную папку с бэкапами и очищаем volume бэкапов
echo -e "\nОчищаем временные ресурсы"
rm -rf $TMP_DIR
rm -rf $MSSQL_BACKUPS_VOLUME/*

echo -e "\n[SUCCESS] Все БД успешно восстановлены из бэкапа $BACKUPS_STORAGE/$ARCHIVE_NAME"