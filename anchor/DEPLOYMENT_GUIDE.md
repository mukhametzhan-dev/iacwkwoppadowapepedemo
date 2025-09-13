# 🚀 Anchor Program Deployment Guide

## 📋 Prerequisites

### Ubuntu VPS Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.18.22/install)"
export PATH="~/.local/share/solana/install/active_release/bin:$PATH"

# Install Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# Install Node.js and Yarn
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g yarn

# Verify installations
solana --version
anchor --version
node --version
yarn --version
```

## 🔧 Project Setup

### 1. Configure Solana CLI
```bash
# Configure for devnet
solana config set --url https://api.devnet.solana.com

# Generate keypair (if you don't have one)
solana-keygen new --outfile ~/.config/solana/id.json

# Get devnet SOL for deployment
solana airdrop 2

# Check balance
solana balance
```

### 2. Navigate to Anchor Directory
```bash
cd /path/to/your/project/anchor
```

### 3. Install Dependencies
```bash
# Install Anchor workspace dependencies
yarn install
```

## 🏗️ Build Process

### **CRITICAL**: Generate New Program ID
```bash
# Generate a new program keypair
anchor keys list

# This should output something like:
# pepelab_program: Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS

# If you need to generate a new one:
solana-keygen new --outfile target/deploy/pepelab_program-keypair.json --force
```

### Update Program ID in Code
1. Copy the program ID from `anchor keys list`
2. Update it in these files:
   - `anchor/Anchor.toml` (programs.devnet.pepelab_program)
   - `anchor/pepelab_program/src/lib.rs` (declare_id! macro)

### Build the Program
```bash
# Clean previous builds
anchor clean

# Build the program
anchor build

# Expected output:
# BPF SDK: /home/user/.local/share/solana/install/active_release/bin/sdk/bpf
# cargo-build-bpf child: rustup toolchain list -v
# cargo-build-bpf child: cargo +bpf build --target bpfel-unknown-unknown --release
#    Compiling pepelab_program v0.1.0 (/path/to/anchor/pepelab_program)
#     Finished release [optimized] target(s) in X.XXs
# To deploy this program:
#   $ solana program deploy /path/to/anchor/target/deploy/pepelab_program.so
# The program address will default to this keypair (override with --program-id):
#   /path/to/anchor/target/deploy/pepelab_program-keypair.json
```

## 🚀 Deployment Process

### **Method 1: Using Anchor Deploy (Recommended)**
```bash
# Deploy to devnet
anchor deploy --provider.cluster devnet

# Expected output:
# Deploying workspace: https://api.devnet.solana.com
# Upgrade authority: /home/user/.config/solana/id.json
# Deploying program "pepelab_program"...
# Program path: /path/to/anchor/target/deploy/pepelab_program.so...
# Program Id: Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
# 
# Deploy success
```

### **Method 2: Using Solana CLI Directly**
```bash
# Deploy the .so file directly
solana program deploy target/deploy/pepelab_program.so \
  --keypair target/deploy/pepelab_program-keypair.json \
  --url https://api.devnet.solana.com

# Expected output:
# Program Id: Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
```

## ✅ Verification Steps

### 1. Check Program Account
```bash
# Verify the program is deployed as executable
solana account Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS --url devnet

# Expected output should show:
# Public Key: Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
# Balance: 0.00114144 SOL
# Owner: BPFLoaderUpgradeab1e11111111111111111111111
# Executable: true  <-- THIS IS CRITICAL
# Rent Epoch: XXX
```

### 2. Check in Solana Explorer
Visit: `https://explorer.solana.com/address/Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS?cluster=devnet`

You should see:
- ✅ **Account Type**: Program
- ✅ **Executable**: Yes
- ✅ **Owner**: BPF Upgradeable Loader
- ✅ **Program Data**: Shows your program data account

### 3. Test the Program
```bash
# Run Anchor tests
anchor test --skip-local-validator

# Or run specific test
yarn test
```

## 🛠️ Troubleshooting

### **Issue**: Program deploys as regular account
**Cause**: Incorrect deployment process or corrupted build
**Solution**:
```bash
# 1. Clean everything
anchor clean
rm -rf target/
rm -rf node_modules/

# 2. Reinstall and rebuild
yarn install
anchor build

# 3. Generate new program ID if needed
solana-keygen new --outfile target/deploy/pepelab_program-keypair.json --force
anchor keys sync

# 4. Update program ID in lib.rs and Anchor.toml
# 5. Rebuild and deploy
anchor build
anchor deploy --provider.cluster devnet
```

### **Issue**: "Program Id mismatch" during deployment
**Solution**:
```bash
# Sync the program IDs
anchor keys sync

# Update declare_id! in lib.rs to match Anchor.toml
# Rebuild
anchor build
anchor deploy --provider.cluster devnet
```

### **Issue**: Insufficient funds for deployment
**Solution**:
```bash
# Get more SOL
solana airdrop 2 --url devnet

# Check balance
solana balance --url devnet

# Typical deployment costs 0.001-0.002 SOL
```

### **Issue**: Build fails with BPF errors
**Solution**:
```bash
# Update Solana CLI
solana-install update

# Update Anchor
avm install latest
avm use latest

# Clear cache
anchor clean
cargo clean

# Rebuild
anchor build
```

## 📝 Final Integration

### Update Environment Variables
After successful deployment, update your frontend `.env`:
```env
# Update with your deployed program ID
VITE_SOLANA_PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_SOLANA_NETWORK=devnet
```

### Update Anchor Client
Update `src/solana/anchorClient.ts` with the new program ID:
```typescript
const PROGRAM_ID = new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
```

## 🎯 Success Checklist

- [ ] ✅ `anchor build` completes without errors
- [ ] ✅ `anchor deploy` returns program ID
- [ ] ✅ `solana account <PROGRAM_ID>` shows `Executable: true`
- [ ] ✅ Explorer shows program as executable
- [ ] ✅ Frontend can connect to deployed program
- [ ] ✅ Tests pass with deployed program

## 🚀 Commands Summary

```bash
# Complete deployment flow
cd anchor/
anchor clean
anchor build
anchor deploy --provider.cluster devnet

# Verify deployment
solana account <PROGRAM_ID> --url devnet

# Test the deployment
anchor test --skip-local-validator
```

Your program should now be deployed as an **executable program account** on Solana devnet! 🎉