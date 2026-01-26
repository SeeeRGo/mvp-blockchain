import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createVerificationRequest = mutation({
  args: {
    verifierId: v.id("verifiers"),
    diplomaHash: v.string(),
    requestedFields: v.array(v.string()),
    ttlSeconds: v.number(),
  },
  handler: async (ctx, args) => {
    // Find diploma by hash
    const diploma = await ctx.db
      .query("diplomas")
      .withIndex("by_hash", (q) => q.eq("diplomaHash", args.diplomaHash))
      .first();
    
    if (!diploma) throw new Error("Diploma not found");
    
    const requestId = await ctx.db.insert("verificationRequests", {
      verifierId: args.verifierId,
      diplomaId: diploma._id,
      requestedFields: args.requestedFields,
      ttlSeconds: args.ttlSeconds,
      status: "pending",
      expiresAt: Date.now() + args.ttlSeconds * 1000,
      createdAt: Date.now(),
    });
    
    // Send notification to wallet owner
    return requestId;
  },
});

export const getVerificationResult = query({
  args: { requestId: v.id("verificationRequests") },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) return null;
    
    const diploma = await ctx.db.get(request.diplomaId);
    const university = diploma ? await ctx.db.get(diploma.universityId) : null;
    const batch = diploma?.batchId ? await ctx.db.get(diploma.batchId) : null;
    
    return {
      request,
      diploma,
      university,
      batch,
    };
  },
});

export const getOnChainProof = query({
  args: { diplomaHash: v.string() },
  handler: async (ctx, args) => {
    const diploma = await ctx.db
      .query("diplomas")
      .withIndex("by_hash", (q) => q.eq("diplomaHash", args.diplomaHash))
      .first();
    
    if (!diploma || !diploma.batchId) return null;
    
    const batch = await ctx.db.get(diploma.batchId);
    const batchItem = await ctx.db
      .query("batchItems")
      .withIndex("by_diploma", (q) => q.eq("diplomaId", diploma._id))
      .first();
    
    return {
      batch,
      batchItem,
      merkleProof: batchItem?.merkleProof,
    };
  },
});

export const listVerificationRequests = query({
  args: { verifierId: v.id("verifiers") },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("verificationRequests")
      .withIndex("by_verifier", (q) => q.eq("verifierId", args.verifierId))
      .collect();
    return requests;
  },
});

export const registerVerifier = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    organization: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const verifierId = await ctx.db.insert("verifiers", {
      name: args.name,
      email: args.email,
      organization: args.organization,
      createdAt: Date.now(),
    });
    return verifierId;
  },
});
