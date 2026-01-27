# Publisher Attestation Fix

## Problem

The error "Publisher not attested" occurred when trying to create a batch anchor on the blockchain. This happened because:

1. The [`BatchAnchor`](contracts/BatchAnchor.sol:48-52) contract requires that the publisher (wallet address) is attested in the [`PublisherRegistry`](contracts/BatchAnchor.sol:146-148) contract before they can call [`anchorBatch()`](contracts/BatchAnchor.sol:43-73)
2. The UI's "Attest Publisher" button was only updating the database, not actually attesting the publisher on-chain
3. The [`createBatchAnchor`](convex/blockchain.ts:113-171) action didn't check if the publisher was attested before attempting to anchor

## Solution

### 1. Updated [`attestPublisherOnChain`](convex/blockchain.ts:73-111) Action

**Changes:**
- Removed the `publisherKey` parameter (now auto-generated from wallet)
- Added automatic extraction of the publisher key from the wallet signer
- Added a check to see if the publisher is already attested
- Updates both the attestation record and the publisher key in the university record

**Before:**
```typescript
export const attestPublisherOnChain = action({
  args: {
    universityId: v.id("universities"),
    publisherKey: v.string(),  // Required parameter
    universityName: v.string(),
  },
  handler: async (ctx, args) => {
    // ... used args.publisherKey
  },
});
```

**After:**
```typescript
export const attestPublisherOnChain = action({
  args: {
    universityId: v.id("universities"),
    universityName: v.string(),  // publisherKey removed
  },
  handler: async (ctx, args) => {
    const { publisherRegistry, signer } = getContracts();
    const publisherKey = await signer.getAddress();  // Auto-generated
    // ... uses publisherKey from wallet
  },
});
```

### 2. Updated [`getContracts()`](convex/blockchain.ts:42-59) Function

**Changes:**
- Added `signer` to the return value so it can be used to get the wallet address

**Before:**
```typescript
return { publisherRegistry, batchAnchor, provider };
```

**After:**
```typescript
return { publisherRegistry, batchAnchor, provider, signer };
```

### 3. Updated [`createBatchAnchor`](convex/blockchain.ts:113-171) Action

**Changes:**
- Added a check to verify the publisher is attested before attempting to anchor
- Provides a clear error message if the publisher is not attested

**Added:**
```typescript
// Get publisher key from the signer (wallet address)
const publisherKey = await signer.getAddress();

// Check if publisher is attested before attempting to anchor
const isAttested = await publisherRegistry.isPublisherAttested(publisherKey);
if (!isAttested) {
  throw new Error(
    "Publisher is not attested on-chain. Please attest your publisher first by clicking the 'Attest Publisher' button in the Dashboard."
  );
}
```

### 4. Updated UI ([`app/university/page.tsx`](app/university/page.tsx))

**Changes:**
- Added `attestPublisherOnChain` action to the component
- Updated [`AttestationModal`](app/university/page.tsx:766-841) to call the action instead of the mutation
- Simplified the modal to auto-generate the publisher key from the wallet
- Added loading state and result display
- Removed the publisher key input field (now auto-generated)

**Before:**
```typescript
const attestPublisher = useMutation(api.universities.attestPublisher);

// In AttestationModal:
await attestPublisher(data);
```

**After:**
```typescript
const attestPublisherOnChain = useAction(api.blockchain.attestPublisherOnChain);

// In AttestationModal:
const response = await attestPublisherOnChain({
  universityId: university._id,
  universityName: university.name,
});
```

## How to Use

### Step 1: Attest Publisher (One-time Setup)

1. Navigate to the University Portal
2. Go to the Dashboard tab
3. Click the "Attest Publisher" button
4. The modal will show your university name
5. Click "Attest on Blockchain"
6. Wait for the transaction to complete
7. You'll see the publisher key (your wallet address) and transaction hash

### Step 2: Create Batch Anchor

1. Create diplomas using the "Create New Diploma" button
2. Go to the Batches tab
3. Click "Create Batch Now"
4. The batch will be anchored on the blockchain
5. You'll see the batch ID and transaction hash

## Testing

### Test Case 1: Publisher Not Attested

1. Ensure the publisher is not attested (check the PublisherRegistry contract)
2. Try to create a batch anchor
3. Expected: Error message "Publisher is not attested on-chain. Please attest your publisher first..."

### Test Case 2: Publisher Already Attested

1. Attest the publisher
2. Try to attest again
3. Expected: Error message "Publisher is already attested on-chain"

### Test Case 3: Successful Batch Creation

1. Attest the publisher
2. Create some diplomas
3. Create a batch anchor
4. Expected: Batch created successfully with transaction hash

## Environment Variables Required

Make sure these are set in your `.env.local` file:

```env
ARBITRUM_SEPOLIA_RPC_URL=https://arbitrum-sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here
```

## Contract Addresses

- **PublisherRegistry**: `0x314419ee6E79F28Db6433669CfFa3fc79e997542`
- **BatchAnchor**: `0xB56313F400DBc99e54F375f7a099d9C7F1F2A740`

## Files Modified

1. [`convex/blockchain.ts`](convex/blockchain.ts) - Updated attestation and batch creation logic
2. [`app/university/page.tsx`](app/university/page.tsx) - Updated UI to call attestation action

## Summary

The fix ensures that:
1. Publishers must be attested on-chain before creating batch anchors
2. The attestation process is streamlined and user-friendly
3. Clear error messages guide users when attestation is required
4. The publisher key is automatically derived from the wallet, reducing user error