import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query functions
export const getProfile = query({
  args: { universityId: v.id("universities") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.universityId);
  },
});

export const listDiplomas = query({
  args: { universityId: v.id("universities") },
  handler: async (ctx, args) => {
    const diplomas = await ctx.db
      .query("diplomas")
      .withIndex("by_university", (q) => q.eq("universityId", args.universityId))
      .collect();
    return diplomas;
  },
});

export const getDiploma = query({
  args: { diplomaId: v.id("diplomas") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.diplomaId);
  },
});

export const getDiplomaStatus = query({
  args: { diplomaId: v.id("diplomas") },
  handler: async (ctx, args) => {
    const diploma = await ctx.db.get(args.diplomaId);
    if (!diploma) return null;
    
    const batch = diploma.batchId ? await ctx.db.get(diploma.batchId) : null;
    return {
      status: diploma.status,
      batchStatus: batch?.status,
      txHash: batch?.txHash,
      anchoredAt: batch?.anchoredAt,
    };
  },
});

export const getStats = query({
  args: { universityId: v.id("universities") },
  handler: async (ctx, args) => {
    const diplomas = await ctx.db
      .query("diplomas")
      .withIndex("by_university", (q) => q.eq("universityId", args.universityId))
      .collect();
    
    const pending = diplomas.filter(d => d.status === "pending").length;
    const accepted = diplomas.filter(d => d.status === "accepted").length;
    const anchored = diplomas.filter(d => d.status === "anchored").length;
    
    return {
      total: diplomas.length,
      pending,
      accepted,
      anchored,
    };
  },
});

// Mutation functions
export const register = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const universityId = await ctx.db.insert("universities", {
      name: args.name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return universityId;
  },
});

export const attestPublisher = mutation({
  args: {
    universityId: v.id("universities"),
    publisherKey: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.universityId, {
      publisherKey: args.publisherKey,
      updatedAt: Date.now(),
    });
    // Trigger blockchain attestation via action
    return { success: true };
  },
});

export const updateAttestation = mutation({
  args: {
    universityId: v.id("universities"),
    txHash: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.universityId, {
      attestationTxHash: args.txHash,
      attestedAt: Date.now(),
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const createDiploma = mutation({
  args: {
    universityId: v.id("universities"),
    ownerId: v.id("users"),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    // Calculate diploma hash using simple hash function
    const dataString = JSON.stringify(args.data);
    const diplomaHash = simpleHash(dataString);
    
    const diplomaId = await ctx.db.insert("diplomas", {
      universityId: args.universityId,
      ownerId: args.ownerId,
      diplomaHash,
      status: "pending",
      data: args.data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return diplomaId;
  },
});

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

export const sendInvitation = mutation({
  args: {
    diplomaId: v.id("diplomas"),
  },
  handler: async (ctx, args) => {
    // Send notification to owner
    // This would integrate with push notification service
    return { success: true };
  },
});
