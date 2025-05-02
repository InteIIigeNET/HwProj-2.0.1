$generatorUrls = @(
    "https://repo.maven.apache.org/maven2/io/swagger/codegen/v3/swagger-codegen-cli/3.0.68/swagger-codegen-cli-3.0.68.jar",
    "https://mirrors.ocf.berkeley.edu/maven2/io/swagger/codegen/v3/swagger-codegen-cli/3.0.68/swagger-codegen-cli-3.0.68.jar"
)

$swaggerUrl = "http://localhost:5000/swagger/v1/swagger.json"
$generatorFolder = Join-Path $PSScriptRoot "swagger-codegen" 
$generatorFile = Join-Path $generatorFolder "swagger-codegen-cli-3.0.68.jar"
$outputFolder = Join-Path $generatorFolder "archive"
$apiDestination = Join-Path $PSScriptRoot "hwproj.front\src\api"

$foldersToCreate = @($generatorFolder, $outputFolder, $apiDestination)

foreach ($folder in $foldersToCreate) {
    if (-not (Test-Path -Path $folder)) {
        try {
            New-Item -ItemType Directory -Path $folder -ErrorAction Stop | Out-Null
            Write-Host "Created directory: $folder"
        } catch {
            Write-Error "Failed to create directory $folder : $($_.Exception.Message)"
            exit 1
        }
    }
}

Set-Location -Path $generatorFolder -ErrorAction Stop

if (-not (Test-Path -Path $generatorFile)) {
    $downloadSuccess = $false
    
    foreach ($url in $generatorUrls) {
        try {
            Write-Host "Attempting to download from $url"
            Invoke-WebRequest -Uri $url -OutFile $generatorFile -ErrorAction Stop
            $downloadSuccess = $true
            Write-Host "Successfully downloaded codegen tool"
            break
        } catch {
            Write-Warning "Failed to download from $url : $($_.Exception.Message)"
        }
    }

    if (-not $downloadSuccess) {
        Write-Error "All download attempts failed. Please check your internet connection."
        exit 1
    }
} else {
    Write-Host "Codegen tool already exists at $generatorFile"
}

try {
    Write-Host "Generating TypeScript API client..."
    java -jar $generatorFile generate -i $swaggerUrl -l typescript-fetch -o $outputFolder
    
    if (-not $?) {
        throw "Codegen execution failed with exit code $LASTEXITCODE"
    }
} catch {
    Write-Error "Failed to generate API client: $($_.Exception.Message)"
    exit 1
}

try {
    $apiFile = Get-ChildItem -Path $outputFolder -Recurse -Filter "api.ts" -ErrorAction Stop | Select-Object -First 1
    
    if (-not $apiFile) {
        throw "api.ts file not found in generated output"
    }

    Write-Host "Found API file at: $($apiFile.FullName)"

    $apiContent = Get-Content -Path $apiFile.FullName -Raw -ErrorAction Stop

    $replacements = @{
        'import\s+\*\s+as\s+isomorphicFetch\s+from\s+"isomorphic-fetch";' = 'import isomorphicFetch from "isomorphic-fetch";'
        'configuration:\s*Configuration;' = 'configuration: Configuration | undefined;'
    }

    foreach ($pattern in $replacements.Keys) {
        $apiContent = $apiContent -replace $pattern, $replacements[$pattern]
    }

    $apiContent = $apiContent -replace '\t', '    '
    $apiContent = $apiContent.TrimEnd()

    Set-Content -Path $apiFile.FullName -Value $apiContent -Encoding UTF8 -Force -ErrorAction Stop

    Move-Item -Path $apiFile.FullName -Destination $apiDestination -Force -ErrorAction Stop
    Write-Host "API file successfully processed and moved to $apiDestination"
} catch {
    Write-Error "Failed to process API file: $($_.Exception.Message)"
    exit 1
}

Write-Host "API client generation completed successfully!"
exit 0
