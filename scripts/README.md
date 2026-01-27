# Scripts Directory

This directory contains utility scripts for the MVP Blockchain project.

## Available Scripts

### setup-convex-env.js

Automates the setup of environment variables for your Convex deployment.

**Usage:**
```bash
node scripts/setup-convex-env.js
```

Or using the npm script:
```bash
npm run setup:convex
```

**What it does:**
- Reads environment variables from `.env.local`
- Sets the following variables in your Convex deployment:
  - `PRIVATE_KEY` - Private key for blockchain transactions
  - `ARBITRUM_SEPOLIA_RPC_URL` - RPC URL for Arbitrum Sepolia testnet
  - `ARBISCAN_API_KEY` - API key for Arbiscan (optional)

**Prerequisites:**
- Convex CLI must be installed (`npm install -g convex` or use `npx convex`)
- You must be authenticated with Convex
- `.env.local` file must exist with the required variables

### init-demo-university.js

Initializes a demo university with sample data for testing.

**Usage:**
```bash
node scripts/init-demo-university.js
```

**What it does:**
- Creates a demo university in the database
- Sets up sample diplomas
- Prepares the system for testing

### deploy.js

Deploys smart contracts to the blockchain using Hardhat.

**Usage:**
```bash
node scripts/deploy.js
```

**What it does:**
- Deploys PublisherRegistry contract
- Deploys BatchAnchor contract
- Saves contract addresses to `addresses.txt`

## Environment Variables

The following environment variables are required for blockchain operations:

- `PRIVATE_KEY` - Wallet private key for signing transactions
- `ARBITRUM_SEPOLIA_RPC_URL` - RPC endpoint for Arbitrum Sepolia testnet
- `ARBISCAN_API_KEY` - API key for contract verification (optional)

## Security Notes

⚠️ **Important Security Warnings:**

1. **Never commit `.env.local` to version control** - It contains sensitive credentials
2. **Use separate wallets for development and production**
3. **Rotate private keys regularly**
4. **Never share your private keys**
5. **The current private key in `.env.local` should be replaced with a development-only key**

## Troubleshooting

### "npx: command not found"
- Install Node.js and npm from https://nodejs.org/
- Or use `npm install -g npx`

### "convex: command not found"
- Install Convex CLI: `npm install -g convex`
- Or use `npx convex` instead

### Authentication errors
- Make sure you're logged in to Convex: `npx convex login`
- Check your Convex project ID in `.env.local`

### Environment variable errors
- Ensure `.env.local` exists and contains all required variables
- Run the setup script to sync variables to Convex
- Check Convex dashboard to verify variables are set

## Additional Resources

- [Convex Documentation](https://docs.convex.dev)
- [Arbitrum Sepolia Documentation](https://docs.arbitrum.io/node-running/node-providers/public-rpc)
- [Hardhat Documentation](https://hardhat.org/docs)