# Testing Guide & Workflow Confirmation

This guide provides detailed instructions for testing the MVP blockchain diploma verification system and confirming the workflow is correctly working.

## Prerequisites

Before testing, ensure you have:

1. **Node.js 20.9.0+** installed (required for Convex CLI)
2. **Convex account** created at [convex.dev](https://convex.dev)
3. **Arbitrum Sepolia testnet ETH** for smart contract deployment
4. **MetaMask or similar wallet** for blockchain interactions
5. **Two browser tabs** - one for frontend, one for Convex dev server

## Setup Instructions

### 1. Install Dependencies

```bash
# Install Convex React client
npm install convex

# Install ethers.js for blockchain integration
npm install ethers

# Install additional UI dependencies (optional)
npm install lucide-react clsx tailwind-merge
```

### 2. Initialize Convex

```bash
# Login to Convex
npx convex login

# This will open a browser window for authentication
# Follow the prompts to create or login to your account
```

### 3. Deploy Schema to Convex

```bash
# Deploy the schema to Convex
npx convex dev

# This will:
# 1. Create the database tables
# 2. Generate TypeScript types in convex/_generated/
# 3. Start the Convex dev server
```

**Expected Output:**
```
✓ Connected to your Convex deployment
✓ Schema loaded
✓ Functions loaded
Convex server running at http://localhost:3210
```

### 4. Start Next.js Development Server

```bash
# In a new terminal, start the Next.js dev server
npm run dev

# This will start the frontend at http://localhost:3000
```

## Testing Workflow

### Phase 1: University Portal Testing

#### Test 1.1: University Registration

1. Navigate to `http://localhost:3000/university`
2. Click "Create Diploma" button
3. Fill in the form:
   - Student Name: "Test Student"
   - Degree: "Bachelor"
   - Specialty: "Computer Science"
   - Issue Date: Today's date
   - Graduation Date: Today's date
   - GPA: "4.5"
   - Diploma Number: "TEST-001"
4. Click "Create Diploma"
5. Verify:
   - Success message appears
   - Diploma appears in the list with "Pending" status
   - Stats update: "Total Diplomas" increases by 1

**Expected Result:** Diploma created successfully with status "pending"

#### Test 1.2: Publisher Attestation

1. On University Portal, click "Attest Publisher" button
2. Fill in the form:
   - University Name: "Test University"
   - Publisher Key: (auto-generated, leave as is)
3. Click "Attest on Blockchain"
4. Verify:
   - Success message appears
   - Transaction hash displayed
   - Link to block explorer provided
5. Click the block explorer link
6. Verify:
   - Transaction is confirmed on Arbitrum Sepolia
   - Publisher key is visible in transaction data
   - University name is visible

**Expected Result:** Publisher attested on-chain with transaction hash

#### Test 1.3: View Diploma Status

1. Click on a diploma in the list
2. Verify:
   - All diploma fields are displayed correctly
   - Status badge shows current status
   - If anchored, "Verify on Blockchain" button is visible

**Expected Result:** Diploma details displayed with correct status

### Phase 2: Wallet Testing (Simulated)

Since we don't have the mobile wallet implemented yet, we'll simulate wallet actions using the Convex dashboard.

#### Test 2.1: Create Wallet User

```bash
# Using Convex CLI or dashboard
npx convex dashboard

# Or use the Convex web console at https://dashboard.convex.dev
```

1. Navigate to "users" table
2. Click "Insert Document"
3. Create a new user:
   - email: "test@example.com"
   - phone: "+1234567890"
   - publicKey: "0x..." (optional)
4. Click "Save"

**Expected Result:** User created successfully

#### Test 2.2: Accept Diploma

1. In Convex dashboard, navigate to "diplomas" table
2. Find the diploma created in Test 1.1
3. Click "Edit"
4. Change status from "pending" to "accepted"
5. Click "Save"

**Expected Result:** Diploma status updated to "accepted"

### Phase 3: Batch Anchoring Testing

#### Test 3.1: Manual Batch Creation

1. In Convex dashboard, navigate to "batches" table
2. Click "Insert Document"
3. Create a batch:
   - universityId: (copy from universities table)
   - merkleRoot: "0x..." (generate a test hash)
   - status: "pending"
4. Click "Save"

**Expected Result:** Batch created successfully

#### Test 3.2: Verify Batch Processing

1. Wait for the cron job to run (or trigger manually)
2. Check "diplomas" table
3. Verify:
   - Diploma status changed from "accepted" to "anchored"
   - batchId is populated
   - txHash is populated

**Expected Result:** Diplomas anchored with transaction hash

### Phase 4: Verifier Portal Testing

#### Test 4.1: Create Verification Request

1. Navigate to `http://localhost:3000/verifier`
2. Click "Create Verification Request"
3. Fill in the form:
   - Diploma Hash: (copy from Convex diplomas table)
   - Requested Fields: Select "studentName", "degree", "gpa"
   - Access Duration: "1 Hour"
4. Click "Create Request"
5. Verify:
   - Success message appears
   - Request appears in the list with "Pending" status
   - Expires time is calculated correctly

**Expected Result:** Verification request created successfully

#### Test 4.2: View Verification Result

1. Click on the verification request
2. Verify:
   - Request details are displayed
   - Status shows current state
   - If approved, shared data is visible
   - If approved and anchored, "View on Blockchain" button is visible

**Expected Result:** Verification details displayed correctly

### Phase 5: Blockchain Verification Testing

#### Test 5.1: Deploy Smart Contracts

```bash
# Compile contracts
npx hardhat compile

# Deploy to Arbitrum Sepolia
npx hardhat run scripts/deploy.js --network arbitrumSepolia
```

1. Verify compilation succeeds
2. Verify deployment succeeds
3. Copy the contract addresses:
   - PublisherRegistry: 0x...
   - BatchAnchor: 0x...
4. Save these addresses for testing

**Expected Result:** Contracts deployed with addresses displayed

#### Test 5.2: Verify Contract Functions

Using the deployed contracts:

1. **Test Publisher Attestation:**
   - Use Hardhat console or Remix
   - Call `attestPublisher` with test data
   - Verify transaction succeeds
   - Check `isPublisherAttested` returns true

2. **Test Batch Anchoring:**
   - Create a test Merkle root
   - Call `anchorBatch` with test data
   - Verify transaction succeeds
   - Check `getBatch` returns correct data

3. **Test Diploma Verification:**
   - Create a test Merkle proof
   - Call `verifyDiploma` with test data
   - Verify returns true for valid proof
   - Verify returns false for invalid proof

**Expected Result:** All contract functions work correctly

## End-to-End Workflow Test

### Complete Flow Test

Follow this complete workflow to test the entire system:

#### Step 1: University Setup
1. Register university in University Portal
2. Attest publisher on-chain
3. Note the publisher key and transaction hash

#### Step 2: Diploma Issuance
1. Create a diploma in University Portal
2. Note the diploma hash
3. Send invitation (simulated by updating status)

#### Step 3: Wallet Acceptance
1. In Convex dashboard, create a user
2. Accept the diploma (change status to "accepted")

#### Step 4: Batch Anchoring
1. Wait for batch processing (or trigger manually)
2. Verify diploma status changes to "anchored"
3. Note the transaction hash

#### Step 5: Verification Request
1. In Verifier Portal, create verification request
2. Use the diploma hash from Step 2
3. Select fields to verify
4. Set TTL to 1 hour

#### Step 6: Wallet Approval
1. In Convex dashboard, find the verification request
2. Update status to "approved"
3. Add shared data with selected fields

#### Step 7: Verification Result
1. In Verifier Portal, view the verification request
2. Verify shared data is displayed
3. Click "View on Blockchain"
4. Verify transaction details are correct

**Expected Result:** Complete workflow from issuance to verification works end-to-end

## Verification Checklist

Use this checklist to confirm the system is working correctly:

### University Portal
- [ ] Can register university
- [ ] Can create diploma
- [ ] Can view diploma list
- [ ] Can view diploma details
- [ ] Can attest publisher on-chain
- [ ] Can view statistics
- [ ] Status badges display correctly
- [ ] "Verify on Blockchain" button appears for anchored diplomas

### Verifier Portal
- [ ] Can create verification request
- [ ] Can view request list
- [ ] Can view request details
- [ ] Can select requested fields
- [ ] Can set TTL
- [ ] Status badges display correctly
- [ ] "View on Blockchain" button appears for approved requests

### Convex Backend
- [ ] Schema deployed successfully
- [ ] All tables created
- [ ] All functions loaded
- [ ] Can create/read/update documents
- [ ] Indexes work correctly
- [ ] Real-time updates work

### Smart Contracts
- [ ] PublisherRegistry deployed
- [ ] BatchAnchor deployed
- [ ] Contracts verified on block explorer
- [ ] attestPublisher works
- [ ] anchorBatch works
- [ ] verifyDiploma works
- [ ] getPublisherInfo works
- [ ] getBatch works

### Integration
- [ ] Frontend connects to Convex
- [ ] Real-time updates work
- [ ] Errors are handled gracefully
- [ ] Loading states display correctly
- [ ] Success messages appear

## Troubleshooting

### Common Issues

#### Issue: Convex CLI not working
**Solution:** Ensure Node.js 20.9.0+ is installed
```bash
node --version  # Should be v20.9.0 or higher
```

#### Issue: TypeScript errors about _generated modules
**Solution:** Run `npx convex dev` to generate types
```bash
npx convex dev
# Wait for types to be generated
# Errors should resolve
```

#### Issue: Smart contract deployment fails
**Solution:** Check environment variables
```bash
# Ensure .env file exists with:
# - PRIVATE_KEY
# - ARBITRUM_SEPOLIA_RPC_URL
# - ARBISCAN_API_KEY
```

#### Issue: Frontend can't connect to Convex
**Solution:** Check Convex dev server is running
```bash
# In one terminal:
npx convex dev

# In another terminal:
npm run dev
```

#### Issue: Transactions not confirming
**Solution:** Check gas price and network status
- Use Arbitrum Sepolia explorer to check transaction
- Ensure sufficient testnet ETH
- Check network congestion

## Performance Testing

### Load Testing

Test the system with multiple concurrent operations:

1. **Create 10 diplomas simultaneously**
   - Measure response time
   - Check for errors
   - Verify all are created

2. **Create 5 verification requests simultaneously**
   - Measure response time
   - Check for errors
   - Verify all are created

3. **Process 3 batches**
   - Measure anchoring time
   - Check Merkle tree calculation
   - Verify blockchain transaction time

### Stress Testing

Test the system limits:

1. **Maximum batch size**
   - Create 100 diplomas
   - Trigger batch anchoring
   - Verify all are anchored

2. **Long TTL values**
   - Create request with 7-day TTL
   - Verify expiration works
   - Check cleanup of expired requests

## Security Testing

### Input Validation

Test for security vulnerabilities:

1. **SQL Injection**
   - Try SQL in input fields
   - Verify inputs are sanitized

2. **XSS Attacks**
   - Try script tags in input fields
   - Verify outputs are escaped

3. **Unauthorized Access**
   - Try accessing other users' data
   - Verify access control works

### Privacy Verification

Verify privacy guarantees:

1. **No PII on-chain**
   - Check smart contract transactions
   - Verify only hashes are stored

2. **Selective Disclosure**
   - Verify only selected fields are shared
   - Check other fields remain hidden

3. **TTL Enforcement**
   - Verify access expires after TTL
   - Check expired requests are inaccessible

## Success Criteria

The system is working correctly when:

✅ All verification checklist items are complete
✅ End-to-end workflow test passes
✅ Performance tests meet requirements (<500ms response time)
✅ Security tests pass (no vulnerabilities found)
✅ Privacy guarantees are maintained
✅ No critical errors in logs
✅ Real-time updates work correctly

## Next Steps After Testing

Once testing is complete and verified:

1. **Fix any issues** found during testing
2. **Optimize performance** based on test results
3. **Add error handling** for edge cases
4. **Implement mobile wallet** (React Native)
5. **Deploy to production**:
   - Convex production deployment
   - Smart contracts to Arbitrum mainnet
   - Frontend to Vercel
6. **Monitor** production system:
   - Set up error tracking (Sentry)
   - Monitor blockchain transactions
   - Track user metrics

## Support

If you encounter issues during testing:

1. Check the [Convex documentation](https://docs.convex.dev)
2. Review the [Arbitrum documentation](https://docs.arbitrum.io)
3. Check the [Hardhat documentation](https://hardhat.org/docs)
4. Review the implementation plan in [`plans/mvp-implementation-plan.md`](plans/mvp-implementation-plan.md)

## Conclusion

This testing guide provides comprehensive coverage of all system components. Follow each phase systematically and use the verification checklist to ensure the workflow is working correctly before proceeding to production deployment.
