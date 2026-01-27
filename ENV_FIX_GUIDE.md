# Fixing Convex Environment Variables Error

## Problem

The error `Missing ARBITRUM_SEPOLIA_RPC_URL or PRIVATE_KEY environment variables` occurs because Convex server functions (actions) run in a separate environment and don't have access to the local `.env.local` file.

## Solution

You need to set the required environment variables in your Convex deployment environment. Here are the methods to do this:

### Method 1: Using Convex CLI (Recommended)

Run these commands in your terminal:

```bash
# Set PRIVATE_KEY
npx convex env set PRIVATE_KEY "d74503deddeada5186cc24a26922c343e62cb8fe8ed5d1196dd139c1875d2a4a"

# Set ARBITRUM_SEPOLIA_RPC_URL
npx convex env set ARBITRUM_SEPOLIA_RPC_URL "https://sepolia-rollup.arbitrum.io/rpc"

# Set ARBISCAN_API_KEY (optional, for contract verification)
npx convex env set ARBISCAN_API_KEY "4BCZCZ9P5H3ETGB8WUY437A5MU9C7WJU6T"
```

### Method 2: Using Convex Dashboard

1. Go to your Convex project dashboard: https://dashboard.convex.dev
2. Select your project: `enduring-squid-390`
3. Navigate to Settings → Environment Variables
4. Add the following variables:
   - `PRIVATE_KEY`: `d74503deddeada5186cc24a26922c343e62cb8fe8ed5d1196dd139c1875d2a4a`
   - `ARBITRUM_SEPOLIA_RPC_URL`: `https://sepolia-rollup.arbitrum.io/rpc`
   - `ARBISCAN_API_KEY`: `4BCZCZ9P5H3ETGB8WUY437A5MU9C7WJU6T`

### Method 3: Using the Setup Script

I've created a script at `scripts/setup-convex-env.js` that automates this process:

```bash
node scripts/setup-convex-env.js
```

## Verification

After setting the environment variables, you can verify they're set correctly:

```bash
npx convex env list
```

## Testing

Once the environment variables are set, try creating a batch anchor again through your application. The error should be resolved.

## Important Notes

1. **Security**: The `PRIVATE_KEY` in your `.env.local` appears to be a real private key. In production, you should:
   - Never commit `.env.local` to version control
   - Use a separate wallet for development
   - Rotate keys regularly

2. **Environment Separation**: Remember that:
   - `.env.local` is for your Next.js frontend
   - Convex environment variables are for your Convex backend functions
   - They need to be set separately

3. **Development vs Production**: You'll need to set these variables for each Convex deployment (dev, preview, production).

## Troubleshooting

If you still encounter issues after setting the variables:

1. Restart your Convex dev server:
   ```bash
   npx convex dev
   ```

2. Clear any cached Convex data:
   ```bash
   rm -rf .convex
   npx convex dev
   ```

3. Check the Convex function logs for more detailed error messages.

## Related Files

- `convex/blockchain.ts` - Contains the `getProviderAndSigner()` function that requires these variables
- `.env.local` - Contains the environment variable values
- `scripts/setup-convex-env.js` - Automated setup script