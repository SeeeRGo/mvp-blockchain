import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Universities (Publishers)
  universities: defineTable({
    name: v.string(),
    publisherKey: v.optional(v.string()), // Ethereum address
    attestationTxHash: v.optional(v.string()),
    attestedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_publisher_key", ["publisherKey"])
    .index("by_name", ["name"]),

  // Diplomas
  diplomas: defineTable({
    universityId: v.id("universities"),
    ownerId: v.id("users"),
    diplomaHash: v.string(),
    batchId: v.optional(v.id("batches")),
    status: v.string(), // pending, accepted, anchored
    data: v.any(), // Encrypted diploma data
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_university", ["universityId"])
    .index("by_owner", ["ownerId"])
    .index("by_hash", ["diplomaHash"])
    .index("by_status", ["status"]),

  // Users (Wallet Owners)
  users: defineTable({
    email: v.string(),
    phone: v.optional(v.string()),
    deviceToken: v.optional(v.string()), // For push notifications
    publicKey: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_phone", ["phone"]),

  // Verification Requests
  verificationRequests: defineTable({
    verifierId: v.id("verifiers"),
    diplomaId: v.id("diplomas"),
    requestedFields: v.array(v.string()),
    ttlSeconds: v.number(),
    status: v.string(), // pending, approved, rejected, expired
    sharedData: v.optional(v.any()),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_verifier", ["verifierId"])
    .index("by_diploma", ["diplomaId"])
    .index("by_status", ["status"])
    .index("by_expires", ["expiresAt"]),

  // Verifiers
  verifiers: defineTable({
    name: v.string(),
    email: v.string(),
    organization: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_email", ["email"]),

  // Batches (for blockchain anchoring)
  batches: defineTable({
    universityId: v.id("universities"),
    merkleRoot: v.string(),
    txHash: v.optional(v.string()),
    anchoredAt: v.optional(v.number()),
    status: v.string(), // pending, anchored, failed
    createdAt: v.number(),
  })
    .index("by_university", ["universityId"])
    .index("by_status", ["status"]),

  // Batch Items (Merkle tree leaves)
  batchItems: defineTable({
    batchId: v.id("batches"),
    diplomaId: v.id("diplomas"),
    diplomaHash: v.string(),
    merkleProof: v.optional(v.array(v.string())),
    position: v.number(),
    createdAt: v.number(),
  })
    .index("by_batch", ["batchId"])
    .index("by_diploma", ["diplomaId"]),
});
