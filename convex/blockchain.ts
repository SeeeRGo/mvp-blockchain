import { action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { ethers } from "ethers";

// Contract addresses on Arbitrum Sepolia
const PUBLISHER_REGISTRY_ADDRESS = "0x314419ee6E79F28Db6433669CfFa3fc79e997542";
const BATCH_ANCHOR_ADDRESS = "0xB56313F400DBc99e54F375f7a099d9C7F1F2A740";

// PublisherRegistry ABI
const PUBLISHER_REGISTRY_ABI = [
  "function attestPublisher(address _publisherKey, string calldata _universityName) external",
  "function isPublisherAttested(address _publisherKey) external view returns (bool)",
  "function getPublisherInfo(address _publisherKey) external view returns (address publisherKey, string universityName, uint256 attestedAt, bool isActive)",
  "event PublisherAttested(address indexed publisherKey, string universityName, uint256 timestamp)"
];

// BatchAnchor ABI
const BATCH_ANCHOR_ABI = [
  "function anchorBatch(bytes32 _batchId, bytes32 _merkleRoot, uint256 _diplomaCount) external",
  "function getBatch(bytes32 _batchId) external view returns (address publisher, bytes32 merkleRoot, uint256 timestamp, uint256 diplomaCount)",
  "function verifyDiploma(bytes32 _batchId, bytes32 _diplomaHash, bytes32[] calldata _merkleProof) external view returns (bool)",
  "function getPublisherBatches(address _publisher) external view returns (bytes32[])",
  "event BatchAnchored(bytes32 indexed batchId, address indexed publisher, bytes32 merkleRoot, uint256 timestamp, uint256 diplomaCount)"
];

// Get provider and signer
function getProviderAndSigner() {
  const rpcUrl = process.env.ARBITRUM_SEPOLIA_RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;

  if (!rpcUrl || !privateKey) {
    throw new Error("Missing ARBITRUM_SEPOLIA_RPC_URL or PRIVATE_KEY environment variables");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);

  return { provider, signer };
}

// Get contract instances
function getContracts() {
  const { provider, signer } = getProviderAndSigner();

  const publisherRegistry = new ethers.Contract(
    PUBLISHER_REGISTRY_ADDRESS,
    PUBLISHER_REGISTRY_ABI,
    signer
  );

  const batchAnchor = new ethers.Contract(
    BATCH_ANCHOR_ADDRESS,
    BATCH_ANCHOR_ABI,
    signer
  );

  return { publisherRegistry, batchAnchor, provider, signer };
}

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
    universityName: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const { publisherRegistry, signer } = getContracts();

      // Get publisher key from the signer (wallet address)
      const publisherKey = await signer.getAddress();

      // Check if publisher is already attested
      const isAttested = await publisherRegistry.isPublisherAttested(publisherKey);
      if (isAttested) {
        throw new Error("Publisher is already attested on-chain");
      }

      // Attest publisher on-chain
      const tx = await publisherRegistry.attestPublisher(
        publisherKey as `0x${string}`,
        args.universityName
      );

      // Wait for transaction to be mined
      const receipt = await tx.wait();
      const txHash = receipt?.hash || "";

      // Update university record with publisher key and attestation
      await ctx.runMutation((internal as any).universities.updateAttestation, {
        universityId: args.universityId,
        txHash,
      });

      // Also update the publisher key in the university record
      await ctx.runMutation((internal as any).universities.attestPublisher, {
        universityName: args.universityName,
        publisherKey: publisherKey,
      });

      return { txHash, publisherKey };
    } catch (error: any) {
      console.error("Error attesting publisher on-chain:", error);
      throw new Error(`Failed to attest publisher: ${error.message}`);
    }
  },
});

export const createBatchAnchor = action({
  args: {
    universityId: v.id("universities"),
  },
  handler: async (ctx, args) => {
    try {
      const { publisherRegistry, signer } = getContracts();

      // Get publisher key from the signer (wallet address)
      const publisherKey = await signer.getAddress();

      // Check if publisher is attested before attempting to anchor
      const isAttested = await publisherRegistry.isPublisherAttested(publisherKey);
      if (!isAttested) {
        throw new Error(
          "Publisher is not attested on-chain. Please attest your publisher first by clicking the 'Attest Publisher' button in the Dashboard."
        );
      }

      // Get pending diplomas
      const diplomas = await ctx.runQuery((internal as any).diplomas.getPendingForBatch, {
        universityId: args.universityId,
      });

      if (diplomas.length === 0) return { message: "No diplomas to anchor" };

      // Build Merkle tree
      const hashes = diplomas.map((d: any) => d.diplomaHash);
      const { root, proofs } = buildMerkleTree(hashes);

      // Create batch record
      const batchId: any = await ctx.runMutation((internal as any).batches.create, {
        universityId: args.universityId,
        merkleRoot: root,
      });

      // Create batch items
      for (let i = 0; i < diplomas.length; i++) {
        await ctx.runMutation((internal as any).batchItems.create, {
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
      await ctx.runMutation((internal as any).batches.updateStatus, {
        batchId,
        txHash,
        status: "anchored",
      });

      // Update diplomas status
      for (const diploma of diplomas) {
        await ctx.runMutation((internal as any).diplomas.updateStatus, {
          diplomaId: diploma._id,
          status: "anchored",
        });
      }

      return { batchId, txHash };
    } catch (error: any) {
      console.error("Error creating batch anchor:", error);
      throw new Error(`Failed to create batch anchor: ${error.message}`);
    }
  },
});

export const verifyDiplomaOnChain = action({
  args: { diplomaHash: v.string() },
  handler: async (ctx, args) => {
    try {
      const proof: any = await ctx.runQuery((internal as any).verifiers.getOnChainProof, {
        diplomaHash: args.diplomaHash,
      });

      if (!proof) return { verified: false };

      const verified = await verifyOnChain(
        proof.batch.merkleRoot,
        args.diplomaHash,
        proof.merkleProof
      );

      return { verified, txHash: proof.batch.txHash };
    } catch (error: any) {
      console.error("Error verifying diploma on-chain:", error);
      throw new Error(`Failed to verify diploma: ${error.message}`);
    }
  },
});

// Helper functions
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
  try {
    const { batchAnchor } = getContracts();

    // Ensure merkleRoot has 0x prefix for ethers.js v6
    const merkleRootWithPrefix = merkleRoot.startsWith('0x') ? merkleRoot : `0x${merkleRoot}`;

    // Generate a unique batch ID from the merkle root
    const batchId = ethers.keccak256(ethers.toUtf8Bytes(merkleRootWithPrefix));

    // Anchor batch on-chain
    const tx = await batchAnchor.anchorBatch(
      batchId,
      merkleRootWithPrefix as `0x${string}`,
      count
    );

    // Wait for transaction to be mined
    const receipt = await tx.wait();
    return receipt?.hash || "";
  } catch (error: any) {
    console.error("Error anchoring batch on-chain:", error);
    throw new Error(`Failed to anchor batch: ${error.message}`);
  }
}

async function verifyOnChain(merkleRoot: string, diplomaHash: string, proof: string[]): Promise<boolean> {
  try {
    const { batchAnchor } = getContracts();

    // Ensure merkleRoot has 0x prefix for ethers.js v6
    const merkleRootWithPrefix = merkleRoot.startsWith('0x') ? merkleRoot : `0x${merkleRoot}`;

    // Ensure diplomaHash has 0x prefix for ethers.js v6
    const diplomaHashWithPrefix = diplomaHash.startsWith('0x') ? diplomaHash : `0x${diplomaHash}`;

    // Ensure all proof elements have 0x prefix
    const proofWithPrefix = proof.map(p => p.startsWith('0x') ? p : `0x${p}`);

    // Generate batch ID from merkle root
    const batchId = ethers.keccak256(ethers.toUtf8Bytes(merkleRootWithPrefix));

    // Verify diploma on-chain
    const verified = await batchAnchor.verifyDiploma(
      batchId,
      diplomaHashWithPrefix as `0x${string}`,
      proofWithPrefix as unknown as `0x${string}[]`
    );

    return verified;
  } catch (error: any) {
    console.error("Error verifying on-chain:", error);
    throw new Error(`Failed to verify on-chain: ${error.message}`);
  }
}
