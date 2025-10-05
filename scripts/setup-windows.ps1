# Bitcoin Yield Bridge - Windows Setup Script
# Run this script to install required dependencies

Write-Host "🚀 Setting up Bitcoin Yield Bridge development environment..." -ForegroundColor Green

# Check if Rust is installed
Write-Host "Checking Rust installation..." -ForegroundColor Yellow
try {
    $rustVersion = rustc --version 2>$null
    Write-Host "✅ Rust is installed: $rustVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Rust not found. Installing Rust..." -ForegroundColor Red
    Write-Host "Please visit: https://rustup.rs/ to install Rust" -ForegroundColor Yellow
    Write-Host "After installing Rust, run this script again." -ForegroundColor Yellow
    exit 1
}

# Install Scarb (Cairo package manager)
Write-Host "Installing Scarb..." -ForegroundColor Yellow
try {
    # Download and install Scarb
    Invoke-WebRequest -Uri "https://docs.swmansion.com/scarb/install.html" -UseBasicParsing | Out-Null
    Write-Host "Please visit: https://docs.swmansion.com/scarb/install.html" -ForegroundColor Yellow
    Write-Host "And follow the installation instructions for Windows" -ForegroundColor Yellow
} catch {
    Write-Host "Please install Scarb manually from: https://docs.swmansion.com/scarb/install.html" -ForegroundColor Yellow
}

# Install Starknet Foundry
Write-Host "Installing Starknet Foundry..." -ForegroundColor Yellow
try {
    Write-Host "Please visit: https://foundry-rs.github.io/starknet-foundry/getting-started/installation.html" -ForegroundColor Yellow
    Write-Host "And follow the installation instructions for Windows" -ForegroundColor Yellow
} catch {
    Write-Host "Please install Starknet Foundry manually" -ForegroundColor Yellow
}

# Check if Node.js is installed (for frontend)
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found." -ForegroundColor Red
    Write-Host "Please visit: https://nodejs.org/ to install Node.js" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Manual Installation Required:" -ForegroundColor Cyan
Write-Host "1. Install Scarb: https://docs.swmansion.com/scarb/install.html" -ForegroundColor White
Write-Host "2. Install Starknet Foundry: https://foundry-rs.github.io/starknet-foundry/" -ForegroundColor White
Write-Host "3. Install Node.js: https://nodejs.org/" -ForegroundColor White
Write-Host ""
Write-Host "After installation, run:" -ForegroundColor Yellow
Write-Host "  scarb build" -ForegroundColor White
Write-Host "  scarb test" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Green
Write-Host "1. Copy scripts/.env.example to .env" -ForegroundColor White
Write-Host "2. Update .env with your configuration" -ForegroundColor White
Write-Host "3. Run 'scarb build' to compile contracts" -ForegroundColor White
Write-Host "4. Run 'scarb test' to execute tests" -ForegroundColor White