# setup-dev.ps1 - PowerShell setup script for development environment on Windows

Write-Host "Setting up development environment with Neon Local..." -ForegroundColor Green

# Check if .env.development exists
if (-not (Test-Path ".env.development")) {
    Write-Host "Creating .env.development from template..." -ForegroundColor Yellow
    Copy-Item ".env.development" ".env.development.tmp"
    Write-Host "Please edit .env.development with your actual Neon API key and Project ID" -ForegroundColor Yellow
} else {
    Write-Host ".env.development already exists" -ForegroundColor Green
}

# Create .neon_local directory for Git branch integration
if (-not (Test-Path ".neon_local")) {
    New-Item -ItemType Directory -Path ".neon_local" -Force | Out-Null
    Write-Host "Created .neon_local directory" -ForegroundColor Green
}

# Add .neon_local to .gitignore if not already present
if (Test-Path ".gitignore") {
    $gitignoreContent = Get-Content ".gitignore" -ErrorAction SilentlyContinue
    if ($gitignoreContent -notcontains ".neon_local/") {
        Add-Content -Path ".gitignore" -Value ".neon_local/"
        Write-Host "Added .neon_local/ to .gitignore" -ForegroundColor Green
    }
} else {
    Set-Content -Path ".gitignore" -Value ".neon_local/"
    Write-Host "Created .gitignore and added .neon_local/" -ForegroundColor Green
}

# Build and start development environment
Write-Host "Building and starting development containers..." -ForegroundColor Green
docker-compose -f docker-compose.dev.yml --env-file .env.development up --build -d

Write-Host ""
Write-Host "Development environment is starting up..." -ForegroundColor Green
Write-Host "Your application will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Neon Local proxy is running on: localhost:5432" -ForegroundColor Cyan
Write-Host ""
Write-Host "To view logs: docker-compose -f docker-compose.dev.yml logs -f" -ForegroundColor Yellow
Write-Host "To stop: docker-compose -f docker-compose.dev.yml down" -ForegroundColor Yellow