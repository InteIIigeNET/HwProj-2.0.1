$generatorUrl = "https://repo1.maven.org/maven2/io/swagger/codegen/v3/swagger-codegen-cli/3.0.68/swagger-codegen-cli-3.0.68.jar"
$swaggerUrl = "http://localhost:5000/swagger/v1/swagger.json"
$generatorFolder = Join-Path $PSScriptRoot "swagger-codegen" 
$generatorFile = Join-Path $PSScriptRoot "swagger-codegen\swagger-codegen-cli-3.0.68.jar"
$outputFolder = Join-Path $PSScriptRoot "swagger-codegen\archive"
$apiDestination = Join-Path $PSScriptRoot "hwproj.front\src\api"

if (-not (Test-Path -Path $generatorFolder)) {
    Write-Host "Создаем папку для генератора..."
    New-Item -ItemType Directory -Path $generatorFolder | Out-Null
}

Set-Location -Path $generatorFolder

if (-Not (Test-Path -Path $generatorFile)) {
    Write-Host "JAR-файл генератора отсутствует. Скачиваем его..."
    try {
        Invoke-WebRequest -Uri $generatorUrl -OutFile $generatorFile
        Write-Host "Генератор успешно загружен."
    } catch {
        Write-Error "Не удалось скачать файл: $($_.Exception.Message)"
        Exit 1
    }
} else {
    Write-Host "JAR-файл генератора уже существует"
}

# Убедимся, что папка archive существует
if (-not (Test-Path -Path $outputFolder)) {
    Write-Host "Создаем папку для архива..."
    New-Item -ItemType Directory -Path $outputFolder | Out-Null
}

# Генерация клиента TypeScript с использованием swagger-codegen
Write-Host "Генерация API клиента..."
java -jar $generatorFile `
    generate -i $swaggerUrl -l typescript-fetch -o $outputFolder

# Проверяем, что архив был успешно создан и существует
if (-not (Test-Path -Path "$outputFolder")) {
    Write-Error "Не удалось найти папку после генерации. Проверьте путь."
    Exit 1
}

# Разархивируем сгенерированный клиент и достаем api.ts
Write-Host "Разархивируем файлы..."
Get-ChildItem -Path $outputFolder -Recurse | ForEach-Object {
    if ($_.Extension -eq ".zip") {
        Expand-Archive -Path $_.FullName -DestinationPath $outputFolder -Force
    }
}

# Ищем файл `api.ts`
$apiFile = Get-ChildItem -Path $outputFolder -Recurse | Where-Object { $_.Name -eq "api.ts" }
if ($null -eq $apiFile) {
    Write-Error "Файл api.ts не найден среди разархивированных файлов."
    Exit 1
}

# Проверяем путь назначения для `api.ts` и создаем, если нужно
if (-not (Test-Path -Path $apiDestination)) {
    Write-Host "Папка назначения не существует. Создаем..."
    New-Item -ItemType Directory -Path $apiDestination -Force | Out-Null
}

# Перемещаем api.ts в папку назначения
Write-Host "Перемещаем api.ts в $apiDestination..."
Move-Item -Path $apiFile.FullName -Destination $apiDestination -Force

Write-Host "Выполняем текстовые замены в api.ts..."
$apiFilePath = Join-Path $apiDestination "api.ts"

if (Test-Path -Path $apiFilePath) {
    $apiContent = Get-Content -Path $apiFilePath

    # 1. Замена импорта isomorphic-fetch на ESM-совместимый
    $apiContent = $apiContent -replace 'import\s+\*\s+as\s+isomorphicFetch\s+from\s+"isomorphic-fetch";', 'import isomorphicFetch from "isomorphic-fetch";'

    # 2. Делаем конфигурацию опциональной
    $apiContent = $apiContent -replace 'configuration:\s*Configuration;', 'configuration: Configuration | undefined;'

    # 3. Форматируем пробелы
    $apiContent = $apiContent | ForEach {$_.TrimEnd()}
    $apiContent = $apiContent -replace '\t', (' ' * 4)

    # Сохраняем изменения
    $apiContent | Set-Content -Path $apiFilePath -Encoding UTF8 -Force
} else {
    Write-Warning "Файл api.ts не найден по пути $apiFilePath для выполнения замен."
}

Write-Host "Готово! Файл api.ts подготовлен и обновлён."
