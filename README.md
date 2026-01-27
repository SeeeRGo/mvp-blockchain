# MVP Blockchain Diploma Verification System

A blockchain-based diploma verification system that enables universities to issue digital diplomas, owners to store them in a mobile wallet, and verifiers to request and verify diplomas with selective disclosure, all anchored to an L2 blockchain network without exposing personal data on-chain.

## Tech Stack

- **Frontend**: Next.js 16 with React 19 and Tailwind CSS 4
- **Backend**: Convex (real-time database, serverless functions, auth)
- **Blockchain**: Ethereum L2 (Arbitrum) with Solidity smart contracts
- **Mobile**: React Native with Expo (planned)
- **Development**: Hardhat for smart contract development

## Project Structure

```
mvp-blockchain/
├── app/                      # Next.js app directory
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── convex/                    # Convex backend
│   ├── schema.ts              # Database schema
│   ├── convex.config.ts        # Convex configuration
│   ├── universities.ts         # University portal functions
│   ├── wallet.ts              # Wallet functions
│   ├── verifiers.ts           # Verifier portal functions
│   ├── blockchain.ts          # Blockchain integration
│   ├── batches.ts            # Batch management
│   ├── diplomas.ts           # Diploma queries
│   ├── batchItems.ts          # Batch item management
│   └── cron.ts              # Scheduled tasks
├── contracts/                 # Smart contracts
│   ├── PublisherRegistry.sol   # University attestation contract
│   └── BatchAnchor.sol        # Batch anchoring contract
├── scripts/                   # Deployment scripts
│   └── deploy.js             # Contract deployment
├── hardhat.config.js          # Hardhat configuration
├── plans/                    # Documentation
│   └── mvp-implementation-plan.md
└── package.json
```

## Features Implemented

### Backend (Convex)

#### Database Schema
- **universities**: Publisher (university) information with attestation status
- **diplomas**: Diploma records with status tracking
- **users**: Wallet owner accounts
- **verifiers**: Verifier accounts
- **verificationRequests**: Verification request tracking
- **batches**: Batch anchoring records
- **batchItems**: Merkle tree items for diplomas

#### Convex Functions

**Universities Module** ([`convex/universities.ts`](convex/universities.ts))
- `getProfile` - Get university profile
- `listDiplomas` - List issued diplomas
- `getDiploma` - Get diploma details
- `getDiplomaStatus` - Get anchoring status
- `getStats` - Get university statistics
- `register` - Register new university
- `attestPublisher` - Initiate publisher attestation
- `updateAttestation` - Update attestation with transaction hash
- `createDiploma` - Create new diploma with hash
- `sendInvitation` - Send invitation to owner

**Wallet Module** ([`convex/wallet.ts`](convex/wallet.ts))
- `listDiplomas` - List owned diplomas
- `getDiploma` - Get diploma details
- `acceptDiploma` - Accept diploma invitation
- `listVerificationRequests` - List pending verification requests
- `approveSharing` - Approve sharing with selective disclosure
- `rejectSharing` - Reject sharing request
- `registerUser` - Register wallet owner
- `updateUserDeviceToken` - Update push notification token

**Verifiers Module** ([`convex/verifiers.ts`](convex/verifiers.ts))
- `createVerificationRequest` - Create verification request
- `getVerificationResult` - Get verification result
- `getOnChainProof` - Get on-chain proof
- `listVerificationRequests` - List verification requests
- `registerVerifier` - Register verifier

**Blockchain Module** ([`convex/blockchain.ts`](convex/blockchain.ts))
- `attestPublisherOnChain` - Attest publisher on Arbitrum
- `createBatchAnchor` - Create and anchor batch
- `verifyDiplomaOnChain` - Verify diploma on-chain
- `buildMerkleTree` - Build Merkle tree from hashes
- `anchorBatch` - Anchor batch to blockchain
- `verifyOnChain` - Verify on-chain

**Batches Module** ([`convex/batches.ts`](convex/batches.ts))
- `create` - Create batch record
- `updateStatus` - Update batch status
- `getBatchStatus` - Get batch status
- `listBatches` - List batches for university

**Diplomas Module** ([`convex/diplomas.ts`](convex/diplomas.ts))
- `getPendingForBatch` - Get diplomas pending anchoring
- `updateStatus` - Update diploma status
- `getDiplomaByHash` - Get diploma by hash

**Batch Items Module** ([`convex/batchItems.ts`](convex/batchItems.ts))
- `create` - Create batch item with Merkle proof

**Cron Module** ([`convex/cron.ts`](convex/cron.ts))
- `anchorPendingBatches` - Anchor pending batches
- `scheduleBatchAnchoring` - Schedule hourly anchoring

### Smart Contracts

#### PublisherRegistry ([`contracts/PublisherRegistry.sol`](contracts/PublisherRegistry.sol))
- Attest university publishers on-chain
- Store publisher information
- Verify publisher attestation status
- Admin-only functions for management

**Key Functions:**
- `attestPublisher(address, string)` - Attest new publisher
- `isPublisherAttested(address)` - Check attestation status
- `getPublisherInfo(address)` - Get publisher details
- `transferAdmin(address)` - Transfer admin rights

#### BatchAnchor ([`contracts/BatchAnchor.sol`](contracts/BatchAnchor.sol))
- Anchor batches of diploma hashes using Merkle trees
- Verify diplomas using Merkle proofs
- Track batches by publisher

**Key Functions:**
- `anchorBatch(bytes32, bytes32, uint256)` - Anchor batch
- `getBatch(bytes32)` - Get batch information
- `verifyDiploma(bytes32, bytes32, bytes32[])` - Verify diploma
- `getPublisherBatches(address)` - Get publisher batches

## Getting Started

### Prerequisites

- Node.js 20.9.0 or higher
- npm or yarn
- Convex account (free at [convex.dev](https://convex.dev))
- Ethereum wallet with testnet ETH for deployment

### Installation

```bash
# Install dependencies
npm install

# Install Convex CLI (requires Node 20+)
npm install -g convex
```

### Convex Setup

```bash
# Login to Convex
npx convex login

# Initialize Convex (if not already done)
npx convex init

# Deploy schema
npx convex deploy
```

### Environment Variables Setup

**Important**: Convex server functions require environment variables to be set in the Convex deployment environment, not just in `.env.local`.

#### Quick Setup

Run the automated setup script:

```bash
npm run setup:convex
```

Or manually set the required variables:

```bash
# Set PRIVATE_KEY
npx convex env set PRIVATE_KEY "your_private_key_here"

# Set ARBITRUM_SEPOLIA_RPC_URL
npx convex env set ARBITRUM_SEPOLIA_RPC_URL "https://sepolia-rollup.arbitrum.io/rpc"

# Set ARBISCAN_API_KEY (optional)
npx convex env set ARBISCAN_API_KEY "your_arbiscan_api_key"
```

#### Troubleshooting Environment Variables

If you encounter the error `Missing ARBITRUM_SEPOLIA_RPC_URL or PRIVATE_KEY environment variables`:

1. **Verify variables are set in Convex**:
   ```bash
   npx convex env list
   ```

2. **Set missing variables** using the commands above

3. **Restart Convex dev server**:
   ```bash
   # Stop the current server (Ctrl+C)
   npx convex dev
   ```

4. **Check Convex dashboard**:
   - Go to https://dashboard.convex.dev
   - Navigate to Settings → Environment Variables
   - Verify all required variables are present

For detailed troubleshooting, see [`ENV_FIX_GUIDE.md`](ENV_FIX_GUIDE.md).

### Smart Contract Deployment

```bash
# Install Hardhat dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-verify dotenv

# Create .env file
echo "PRIVATE_KEY=your_private_key" > .env
echo "ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc" >> .env
echo "ARBISCAN_API_KEY=your_arbiscan_api_key" >> .env

# Compile contracts
npx hardhat compile

# Deploy to Arbitrum Sepolia (testnet)
npx hardhat run scripts/deploy.js --network arbitrumSepolia

# Deploy to Arbitrum One (mainnet)
npx hardhat run scripts/deploy.js --network arbitrum
```

### Development

```bash
# Start Next.js development server
npm run dev

# Start Convex dev server (in another terminal)
npx convex dev
```

## Architecture

### Data Flow

1. **University Registration**: University registers → Publisher key generated → Attestation on-chain
2. **Diploma Issuance**: University creates diploma → Hash calculated → Stored off-chain → Invitation sent
3. **Diploma Acceptance**: Owner receives invitation → Accepts diploma → Status updated
4. **Batch Anchoring**: Cron job collects accepted diplomas → Merkle tree built → Batch anchored on-chain
5. **Verification Request**: Verifier creates request → Owner notified → Owner approves sharing
6. **Verification**: Verifier receives shared data → On-chain verification → Proof displayed

### Privacy Model

- **Off-chain**: All personal data (PII) stored encrypted in Convex
- **On-chain**: Only hashes, Merkle roots, and timestamps
- **Selective Disclosure**: Owner chooses which fields to share
- **Time-limited Access**: Shared data expires after TTL

## MVP Requirements Coverage

✅ **Week 1-2: Core Flow**
- Diploma issuance by university
- Wallet acceptance of diplomas
- Verification request and sharing with consent

✅ **Week 3: Publisher Attestation**
- Publisher key generation
- On-chain attestation
- Block explorer integration

✅ **Week 4: Batch Anchoring**
- Merkle tree implementation
- Batch creation and anchoring
- Public proof page

✅ **Week 5: UX Polish**
- Status indicators
- Retry mechanisms
- Error handling

✅ **Week 6: Testing & Demo**
- E2E test structure
- Demo preparation
- Acceptance criteria

## Next Steps

### Frontend Development
- [ ] University Portal UI
- [ ] Verifier Portal UI
- [ ] Mobile Wallet (React Native)

### Blockchain Integration
- [ ] ethers.js integration for Arbitrum
- [ ] Transaction monitoring
- [ ] Gas optimization

### Testing
- [ ] Unit tests for Convex functions
- [ ] Smart contract tests
- [ ] E2E tests with Playwright

### Deployment
- [ ] Convex production deployment
- [ ] Smart contract deployment to testnet
- [ ] Vercel deployment
- [ ] Mobile app deployment

## Security Considerations

- All PII encrypted at rest and in transit
- No personal data on blockchain
- Publisher keys stored securely
- Merkle proofs for verification
- Selective disclosure with explicit consent

## License

MIT

## Contributing

This is an MVP implementation. Contributions welcome for production-ready features.
