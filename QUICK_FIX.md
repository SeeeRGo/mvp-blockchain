# Quick Fix: Missing Environment Variables Error

## Problem
```
Error: Missing ARBITRUM_SEPOLIA_RPC_URL or PRIVATE_KEY environment variables
```

## Immediate Solution

### Option 1: Use the Setup Script (Recommended)
```bash
npm run setup:convex
```

### Option 2: Manual Setup
Run these commands in your terminal:

```bash
npx convex env set PRIVATE_KEY "d74503deddeada5186cc24a26922c343e62cb8fe8ed5d1196dd139c1875d2a4a"
npx convex env set ARBITRUM_SEPOLIA_RPC_URL "https://sepolia-rollup.arbitrum.io/rpc"
npx convex env set ARBISCAN_API_KEY "4BCZCZ9P5H3ETGB8WUY437A5MU9C7WJU6T"
```

### Option 3: Use Convex Dashboard
1. Go to https://dashboard.convex.dev
2. Select your project: `enduring-squid-390`
3. Navigate to **Settings** → **Environment Variables**
4. Add these variables:
   - `PRIVATE_KEY`: `d74503deddeada5186cc24a26922c343e62cb8fe8ed5d1196dd139c1875d2a4a`
   - `ARBITRUM_SEPOLIA_RPC_URL`: `https://sepolia-rollup.arbitrum.io/rpc`
   - `ARBISCAN_API_KEY`: `4BCZCZ9P5H3ETGB8WUY437A5MU9C7WJU6T`

## After Setting Variables

1. **Restart your Convex dev server**:
   ```bash
   # Stop the current server (Ctrl+C)
   npx convex dev
   ```

2. **Verify variables are set**:
   ```bash
   npx convex env list
   ```

3. **Test the application** - Try creating a batch anchor again

## Why This Happens

Convex server functions (actions) run in a separate environment from your Next.js frontend. The `.env.local` file only provides variables to your frontend, not to Convex backend functions. You must set these variables in the Convex deployment environment separately.

## Security Warning

⚠️ **The private key in your `.env.local` appears to be a real key.** For production:
- Use a separate development wallet
- Never commit `.env.local` to version control
- Rotate keys regularly
- Use environment-specific keys for dev/staging/production

## Need More Help?

- See [`ENV_FIX_GUIDE.md`](ENV_FIX_GUIDE.md) for detailed troubleshooting
- See [`scripts/README.md`](scripts/README.md) for script documentation
- See [`README.md`](README.md) for full project documentation