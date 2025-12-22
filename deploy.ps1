$ErrorActionPreference = "Stop"

Write-Host "Reading .env configuration..."
$envFile = ".env"
if (-not (Test-Path $envFile)) {
    Write-Error ".env file not found!"
    exit 1
}

$envVars = @()
Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#")) {
        # Split by first = to get key and value
        $parts = $line -split '=', 2
        if ($parts.Length -eq 2) {
            $key = $parts[0].Trim()
            $value = $parts[1].Trim()
            
            # Remove surrounding quotes from value if present
            if ($value.StartsWith('"') -and $value.EndsWith('"')) {
                $value = $value.Substring(1, $value.Length - 2)
            }
            elseif ($value.StartsWith("'") -and $value.EndsWith("'")) {
                $value = $value.Substring(1, $value.Length - 2)
            }
            
            $envVars += "$key=$value"
        }
    }
}

$envString = $envVars -join ","

Write-Host "Deploying caterham-rotary to Google Cloud Run (us-central1)..."
# Using --source . performs a cloud build using the Dockerfile
gcloud run deploy caterham-rotary `
    --project micro-meadow-app `
    --source . `
    --platform managed `
    --region us-central1 `
    --allow-unauthenticated `
    --set-env-vars "$envString"

Write-Host "Deployment initiated."
