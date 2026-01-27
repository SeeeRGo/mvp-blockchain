# Blockchain Integration Fix

## Problem

The transaction hashes being generated in the application were mock/random values that had nothing to do with the actual blockchain. When users tried to look up these transaction hashes on Arbitrum Sepolia block explorer, they would get "Transaction Hash not found" errors.

## Root Cause

The [`convex/blockchain.ts`](convex/blockchain.ts:1-169) file was using placeholder functions that:
- Generated random transaction hashes using `crypto.getRandomValues()` instead of submitting real blockchain transactions
- Used mock implementations for `anchorBatch()` and `verifyOnChain()` that didn't interact with the deployed smart contracts
- Had no actual connection to the Arbitrum Sepolia network

## Solution

Replaced the mock implementation with real blockchain integration using ethers.js:

### Changes Made to [`convex/blockchain.ts`](convex/blockchain.ts:1-268)

1. **Added ethers.js import and contract configuration**
   - Imported ethers library for blockchain interactions
   - Defined contract addresses for deployed contracts on Arbitrum Sepolia:
     - PublisherRegistry: `0x314419ee6E79F28Db6433669CfFa3fc79e997542`
     - BatchAnchor: `0xB56313F400DBc99e54F375f7a099d9C7F1F2A740`
   - Added contract ABIs for both contracts

2. **Created helper functions for blockchain connectivity**
   - `getProviderAndSigner()`: Creates provider and signer using environment variables
   - `getContracts()`: Returns contract instances for PublisherRegistry and BatchAnchor

3. **Updated `attestPublisherOnChain()` action**
   - Now calls the actual `attestPublisher()` function on the PublisherRegistry contract
   - Submits a real transaction to Arbitrum Sepolia
   - Waits for transaction to be mined and returns the actual transaction hash
   - Updates university record with the real transaction hash

4. **Updated `anchorBatch()` function**
   - Now calls the actual `anchorBatch()` function on the BatchAnchor contract
   - Submits a real transaction with the merkle root and diploma count
   - Waits for transaction to be mined and returns the actual transaction hash
   - Generates a unique batch ID using `ethers.keccak256()`

5. **Updated `verifyOnChain()` function**
   - Now calls the actual `verifyDiploma()` function on the BatchAnchor contract
   - Performs real on-chain verification using the merkle proof
   - Returns the actual verification result from the smart contract

6. **Added error handling**
   - Wrapped all blockchain calls in try-catch blocks
   - Provides meaningful error messages for debugging
   - Logs errors to console for troubleshooting

## Environment Variables Required

The following environment variables must be set in `.env.local`:

```env
PRIVATE_KEY=<your_private_key>
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
```

## Smart Contract Functions Used

### PublisherRegistry Contract
- `attestPublisher(address _publisherKey, string calldata _universityName)`: Attests a new publisher (university) on-chain
- `isPublisherAttested(address _publisherKey)`: Checks if a publisher is attested

### BatchAnchor Contract
- `anchorBatch(bytes32 _batchId, bytes32 _merkleRoot, uint256 _diplomaCount)`: Anchors a batch of diplomas on-chain
- `verifyDiploma(bytes32 _batchId, bytes32 _diplomaHash, bytes32[] calldata _merkleProof)`: Verifies a diploma using Merkle proof

## Testing

To test the blockchain integration:

1. Ensure the environment variables are properly configured
2. Deploy the smart contracts to Arbitrum Sepolia (if not already deployed)
3. Update the contract addresses in [`convex/blockchain.ts`](convex/blockchain.ts:8-9) if different
4. Test the attestation flow:
   - Register a university with a publisher key
   - Trigger the attestation process
   - Verify the transaction hash on Arbiscan (https://sepolia.arbiscan.io/)
5. Test the batch anchoring flow:
   - Create and accept diplomas
   - Create a batch anchor
   - Verify the transaction hash on Arbiscan
6. Test the verification flow:
   - Verify a diploma using the verification page
   - Confirm the on-chain verification succeeds

## Benefits

1. **Real blockchain transactions**: All transaction hashes are now actual blockchain transactions that can be verified on Arbiscan
2. **Transparency**: Users can verify all operations on the blockchain
3. **Security**: Uses proper cryptographic functions from ethers.js
4. **Reliability**: Real blockchain interactions ensure data integrity
5. **Auditability**: All operations are recorded on-chain for audit purposes

## Notes

- The private key in `.env.local` should be kept secure and never committed to version control
- Ensure the wallet has enough ETH on Arbitrum Sepolia to pay for gas fees
- The RPC URL can be changed to use a custom RPC endpoint if needed
- Contract addresses should be updated if deploying to a different network

## Related Files

- [`convex/blockchain.ts`](convex/blockchain.ts:1-268): Main blockchain integration file
- [`convex/universities.ts`](convex/universities.ts:158-171): University attestation functions
- [`convex/diplomas.ts`](convex/diplomas.ts:4-30): Diploma batch functions
- [`convex/verifiers.ts`](convex/verifiers.ts:89-111): Verification functions
- [`convex/batchItems.ts`](convex/batchItems.ts:4-23): Batch item creation
- [`contracts/PublisherRegistry.sol`](contracts/PublisherRegistry.sol:1-107): Publisher registry smart contract
- [`contracts/BatchAnchor.sol`](contracts/BatchAnchor.sol:1-148): Batch anchor smart contract
- [`hardhat.config.js`](hardhat.config.js:1-42): Hardhat configuration for deployment
- [`scripts/deploy.js`](scripts/deploy.js:1-62): Deployment script