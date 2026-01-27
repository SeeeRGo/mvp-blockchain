#!/usr/bin/env node

/**
 * Setup script to configure environment variables for Convex deployment
 * This script reads from .env.local and sets the required variables in Convex
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

// Parse environment variables
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && !key.startsWith('#') && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

// Required environment variables for Convex
const requiredVars = [
  'PRIVATE_KEY',
  'ARBITRUM_SEPOLIA_RPC_URL',
  'ARBISCAN_API_KEY'
];

console.log('Setting up Convex environment variables...\n');

// Set each required variable in Convex
requiredVars.forEach(varName => {
  const value = envVars[varName];
  if (!value) {
    console.error(`❌ Missing ${varName} in .env.local`);
    process.exit(1);
  }

  try {
    console.log(`Setting ${varName}...`);
    execSync(`npx convex env set ${varName} "${value}"`, { stdio: 'inherit' });
    console.log(`✅ ${varName} set successfully\n`);
  } catch (error) {
    console.error(`❌ Failed to set ${varName}:`, error.message);
    process.exit(1);
  }
});

console.log('\n✅ All environment variables have been set in Convex!');
console.log('\nYou can now use the blockchain functions in your Convex deployment.');