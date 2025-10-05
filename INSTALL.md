# Installation Guide for BitcoinYieldBridge

## Quick Setup for Windows

### 1. Install Scarb (Cairo Package Manager)

**Option A - Using Windows Installer:**
```powershell
# Download and run the Windows installer
Invoke-WebRequest -Uri "https://github.com/software-mansion/scarb/releases/latest/download/scarb-windows-x86_64.msi" -OutFile "scarb-installer.msi"
Start-Process msiexec.exe -Wait -ArgumentList '/I scarb-installer.msi /quiet'
```

**Option B - Using asdf (if you have asdf installed):**
```powershell
asdf plugin add scarb
asdf install scarb latest
asdf global scarb latest
```

**Option C - Manual Installation:**
1. Go to https://github.com/software-mansion/scarb/releases/latest
2. Download `scarb-windows-x86_64.zip`
3. Extract to `C:\Program Files\Scarb`
4. Add `C:\Program Files\Scarb\bin` to your PATH environment variable

### 2. Install Starknet Foundry

```powershell
# Install using the official installer
curl -L https://raw.githubusercontent.com/foundry-rs/starknet-foundry/master/scripts/install.sh | sh
```

### 3. Verify Installation

```powershell
# Check Scarb version
scarb --version

# Check Starknet Foundry
snforge --version

# Check Rust (should already be installed)
rustc --version
```

### 4. Build and Test Project

```powershell
# Navigate to project directory
cd "D:\project\open\Resolve"

# Build contracts
scarb build

# Run tests
scarb test

# Run specific test file
snforge test --package bitcoin_yield_bridge tests::test_comprehensive

# Run with verbose output
scarb test -v
```

### 5. Environment Setup

```powershell
# Copy environment template
copy scripts\.env.example .env

# Edit .env file with your configuration
notepad .env
```

## Alternative: Docker Setup

If you prefer using Docker:

```powershell
# Create Dockerfile
@"
FROM rust:1.70

# Install Scarb
RUN curl -L https://github.com/software-mansion/scarb/releases/latest/download/scarb-linux-x86_64.tar.gz | tar -xz -C /usr/local --strip-components=1

# Install Starknet Foundry
RUN curl -L https://raw.githubusercontent.com/foundry-rs/starknet-foundry/master/scripts/install.sh | sh

WORKDIR /workspace
COPY . .

CMD ["scarb", "build"]
"@ | Out-File -FilePath Dockerfile -Encoding utf8

# Build and run
docker build -t bitcoin-yield-bridge .
docker run -v ${PWD}:/workspace bitcoin-yield-bridge scarb test
```

## Troubleshooting

### Common Issues:

1. **"scarb: command not found"**
   - Ensure Scarb is in your PATH
   - Restart your terminal after installation

2. **Cairo compilation errors**
   - Update to latest Scarb version
   - Check Cairo syntax compatibility

3. **Starknet Foundry not found**
   - Install using the official script
   - Ensure `~/.starknet` is in your PATH

4. **Test failures**
   - Ensure all dependencies are installed
   - Check mock contract deployments

### Performance Tips:

- Use `scarb build --release` for optimized builds
- Use `snforge test --jobs 4` for parallel testing
- Set `RUST_LOG=debug` for detailed logging

## Next Steps After Installation

1. **Compile Contracts:**
   ```bash
   scarb build
   ```

2. **Run Full Test Suite:**
   ```bash
   scarb test
   ```

3. **Deploy to Testnet:**
   ```bash
   ./scripts/deploy.sh sepolia
   ```

4. **Start Frontend Development:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

Your BitcoinYieldBridge project is now ready for Phase 2 development! 🚀