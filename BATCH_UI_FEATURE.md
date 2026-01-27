# Manual Batch Trigger UI Feature

## Overview
This document describes the implementation of a manual batch trigger UI feature that allows university administrators to manually create and anchor batches of diplomas on the blockchain, and view the results.

## Implementation Details

### 1. Backend Changes

#### Added Query: `listBatchesWithDetails` in `convex/batches.ts`
- Returns all batches for a university with additional details
- Includes the count of diplomas in each batch
- Sorted by creation date (newest first)

```typescript
export const listBatchesWithDetails = query({
  args: { universityId: v.id("universities") },
  handler: async (ctx, args) => {
    const batches = await ctx.db
      .query("batches")
      .withIndex("by_university", (q) => q.eq("universityId", args.universityId))
      .collect();
    
    // Get batch items count for each batch
    const batchesWithDetails = await Promise.all(
      batches.map(async (batch) => {
        const batchItems = await ctx.db
          .query("batchItems")
          .withIndex("by_batch", (q) => q.eq("batchId", batch._id))
          .collect();
        
        return {
          ...batch,
          itemCount: batchItems.length,
        };
      })
    );
    
    // Sort by creation date, newest first
    return batchesWithDetails.sort((a, b) => b.createdAt - a.createdAt);
  },
});
```

### 2. Frontend Changes

#### Updated `BatchList` Component in `app/university/page.tsx`

The BatchList component now includes:

1. **Statistics Cards**
   - Pending Diplomas: Shows count of diplomas with "pending" status
   - Ready to Anchor: Shows count of diplomas with "accepted" status
   - Total Batches: Shows total number of batches created

2. **Manual Batch Trigger Button**
   - "Create Batch Now" button to manually trigger batch creation
   - Disabled when no diplomas are ready to anchor
   - Shows loading state during batch creation
   - Displays success/error messages after batch creation

3. **Batch History Table**
   - Shows all batches with their details:
     - Status (Pending/Anchored/Failed)
     - Number of diplomas in the batch
     - Merkle root (with copy functionality)
     - Transaction hash (with link to Arbiscan and copy functionality)
     - Creation date
     - View Details button

4. **New Components**
   - `BatchStatusBadge`: Displays batch status with appropriate color coding
   - Copy functionality for merkle roots and transaction hashes

## How to Use

### Prerequisites
1. Ensure the demo university is initialized in the database
2. Have at least one diploma with "accepted" status ready to be anchored

### Steps

1. **Navigate to University Portal**
   - Go to `/university` route
   - Click on the "Batches" tab

2. **View Statistics**
   - Check the statistics cards to see:
     - How many diplomas are pending
     - How many are ready to anchor (accepted status)
     - Total batches created

3. **Create a Batch**
   - Click the "Create Batch Now" button
   - Wait for the batch to be created and anchored
   - View the success message with batch ID and transaction hash

4. **View Batch History**
   - Scroll down to see all batches
   - Click on transaction hash to view on Arbiscan
   - Copy merkle root or transaction hash using the copy buttons
   - Click "View Details" to see more information about a batch

## Technical Details

### Batch Creation Process

When you click "Create Batch Now":

1. The system queries all diplomas with "accepted" status for the university
2. A Merkle tree is built from the diploma hashes
3. A batch record is created with the Merkle root
4. Batch items are created for each diploma with their Merkle proofs
5. The batch is anchored on the blockchain (simulated in this MVP)
6. The batch status is updated to "anchored"
7. All diplomas in the batch are updated to "anchored" status

### Data Flow

```
User clicks "Create Batch Now"
    ↓
createBatchAnchor action is called
    ↓
Get pending diplomas (status: "accepted")
    ↓
Build Merkle tree from diploma hashes
    ↓
Create batch record with merkleRoot
    ↓
Create batch items with merkleProofs
    ↓
Anchor batch on blockchain (get txHash)
    ↓
Update batch status to "anchored"
    ↓
Update all diplomas in batch to "anchored"
    ↓
Return batchId and txHash to UI
```

## Files Modified

1. `convex/batches.ts` - Added `listBatchesWithDetails` query
2. `app/university/page.tsx` - Updated `BatchList` component with full UI implementation

## Future Enhancements

Potential improvements for production:

1. **Real Blockchain Integration**
   - Replace simulated blockchain anchoring with actual ethers.js calls
   - Connect to Arbitrum mainnet or testnet

2. **Batch Details View**
   - Implement the "View Details" button to show:
     - List of all diplomas in the batch
     - Individual Merkle proofs
     - Gas costs and transaction details

3. **Batch Scheduling**
   - Add option to schedule batches for specific times
   - Configure automatic batch intervals

4. **Error Handling**
   - More detailed error messages
   - Retry mechanism for failed batches
   - Batch rollback functionality

5. **Notifications**
   - Email notifications when batches are created
   - Push notifications to university administrators

6. **Export Functionality**
   - Export batch data to CSV/JSON
   - Generate batch reports

## Testing

To test the feature:

1. Create several diplomas via the University Portal
2. Accept the diplomas (change status to "accepted")
3. Navigate to the Batches tab
4. Click "Create Batch Now"
5. Verify the batch appears in the batch history
6. Check that diplomas are updated to "anchored" status
7. Verify transaction hash links to Arbiscan
8. Test copy functionality for merkle root and transaction hash

## Notes

- The current implementation uses simulated blockchain anchoring for MVP purposes
- In production, this would integrate with actual smart contracts on Arbitrum
- The batch creation process is atomic - either all diplomas are anchored or none
- Batches are sorted by creation date, showing the most recent first