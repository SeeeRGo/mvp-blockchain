import { action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Simple hash function for diploma fingerprinting
// In production, use proper SHA-256 with crypto module
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

export const attestPublisherOnChain = action({
  args: {
    universityId: v.id("universities"),
    publisherKey: v.string(),
    universityName: v.string(),
  },
  handler: async (ctx, args) => {
    // Connect to Arbitrum and submit transaction
    // This is a placeholder - actual implementation would use ethers.js
    const txHash = "0x" + Math.random().toString(16).substr(2, 64);
    
    // Update university record
    await ctx.runMutation(internal.universities.updateAttestation, {
      universityId: args.universityId,
      txHash,
    });
    
    return { txHash };
  },
});

export const createBatchAnchor = action({
  args: {
    universityId: v.id("universities"),
  },
  handler: async (ctx, args) => {
    // Get pending diplomas
    const diplomas = await ctx.runQuery(internal.diplomas.getPendingForBatch, {
      universityId: args.universityId,
    });
    
    if (diplomas.length === 0) return { message: "No diplomas to anchor" };
    
    // Build Merkle tree
    const hashes = diplomas.map(d => d.diplomaHash);
    const { root, proofs } = buildMerkleTree(hashes);
    
    // Create batch record
    const batchId = await ctx.runMutation(internal.batches.create, {
      universityId: args.universityId,
      merkleRoot: root,
    });
    
    // Create batch items
    for (let i = 0; i < diplomas.length; i++) {
      await ctx.runMutation(internal.batchItems.create, {
        batchId,
        diplomaId: diplomas[i]._id,
        diplomaHash: diplomas[i].diplomaHash,
        merkleProof: proofs[i],
        position: i,
      });
    }
    
    // Anchor on blockchain
    const txHash = await anchorBatch(args.universityId, root, diplomas.length);
    
    // Update batch status
    await ctx.runMutation(internal.batches.updateStatus, {
      batchId,
      txHash,
      status: "anchored",
    });
    
    // Update diplomas status
    for (const diploma of diplomas) {
      await ctx.runMutation(internal.diplomas.updateStatus, {
        diplomaId: diploma._id,
        status: "anchored",
      });
    }
    
    return { batchId, txHash };
  },
});

export const verifyDiplomaOnChain = action({
  args: { diplomaHash: v.string() },
  handler: async (ctx, args) => {
    const proof = await ctx.runQuery(internal.blockchain.getOnChainProof, {
      diplomaHash: args.diplomaHash,
    });
    
    if (!proof) return { verified: false };
    
    const verified = await verifyOnChain(
      proof.batch.merkleRoot,
      args.diplomaHash,
      proof.merkleProof
    );
    
    return { verified, txHash: proof.batch.txHash };
  },
});

// Helper functions (would be in a separate utils file)
function buildMerkleTree(hashes: string[]): { root: string; proofs: string[][] } {
  // Simplified Merkle tree implementation
  // In production, use a proper Merkle tree library
  const proofs: string[][] = hashes.map(() => []);
  let level = hashes;
  
  while (level.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = level[i + 1] || level[i];
      const combined = left + right;
      const hash = simpleHash(combined);
      nextLevel.push(hash);
      
      // Add to proofs
      for (let j = 0; j < hashes.length; j++) {
        if (j >= i && j < i + 2) {
          proofs[j].push(level[i + 1] || level[i]);
        }
      }
    }
    level = nextLevel;
  }
  
  return {
    root: level[0] || "",
    proofs,
  };
}

async function anchorBatch(universityId: string, merkleRoot: string, count: number): Promise<string> {
  // Placeholder for blockchain anchoring
  // In production, this would use ethers.js to submit transaction to Arbitrum
  return "0x" + Math.random().toString(16).substr(2, 64);
}

async function verifyOnChain(merkleRoot: string, diplomaHash: string, proof: string[]): Promise<boolean> {
  // Placeholder for on-chain verification
  // In production, this would call the smart contract
  return true;
}
