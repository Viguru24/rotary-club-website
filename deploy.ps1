$ErrorActionPreference = "Stop"

Write-Host "Reading .env configuration..."
$envFile = ".env"
if (-not (Test-Path $envFile)) {
    Write-Error ".env file not found!"
    exit 1
}

$envVars = @()
$viteClientId = ""
$viteMemberPassword = ""

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
            
            # Capture VITE variables separately for build args
            if ($key -eq "VITE_GOOGLE_CLIENT_ID") {
                $viteClientId = $value
            }
            elseif ($key -eq "VITE_MEMBER_PASSWORD") {
                $viteMemberPassword = $value
            }
            
            $envVars += "$key=$value"
        }
    }
}

$envString = $envVars -join ","

# Add NODE_ENV=production and VITE variables for Cloud Run
$envString = "NODE_ENV=production,VITE_GOOGLE_CLIENT_ID=$viteClientId,VITE_MEMBER_PASSWORD=$viteMemberPassword,$envString"

Write-Host "Deploying caterham-rotary to Google Cloud Run (europe-west2)..."
# Using --source . performs a cloud build using the Dockerfile
gcloud run deploy caterham-rotary `
    --project caterham-rotary-web-2025 `
    --source . `
    --platform managed `
    --region europe-west2 `
    --allow-unauthenticated `
    --quiet `
    --set-env-vars "$envString"

Write-Host "Deployment initiated."
