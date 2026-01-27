import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createVerificationRequest = mutation({
  args: {
    verifierId: v.optional(v.id("verifiers")),
    diplomaHash: v.string(),
    requestedFields: v.array(v.string()),
    ttlSeconds: v.number(),
  },
  handler: async (ctx, args) => {
    // Find diploma by hash or ID
    let diploma = await ctx.db
      .query("diplomas")
      .withIndex("by_hash", (q) => q.eq("diplomaHash", args.diplomaHash))
      .first();
    
    // If not found by hash, try to find by ID
    if (!diploma) {
      try {
        const result = await ctx.db.get(args.diplomaHash as any);
        // Check if the result is actually a diploma (has diplomaHash property)
        if (result && "diplomaHash" in result) {
          diploma = result as any;
        }
      } catch (e) {
        // Invalid ID format, continue to error
      }
    }
    
    if (!diploma) throw new Error("Diploma not found. Please check the Diploma ID or hash and try again.");
    
    // If no verifierId provided, create a default verifier
    let verifierId = args.verifierId;
    if (!verifierId) {
      // Check if a default verifier exists
      const defaultVerifier = await ctx.db
        .query("verifiers")
        .withIndex("by_email", (q) => q.eq("email", "default@verifier.com"))
        .first();
      
      if (defaultVerifier) {
        verifierId = defaultVerifier._id;
      } else {
        // Create default verifier
        verifierId = await ctx.db.insert("verifiers", {
          name: "Default Verifier",
          email: "default@verifier.com",
          organization: "Default Organization",
          createdAt: Date.now(),
        });
      }
    }
    
    const requestId = await ctx.db.insert("verificationRequests", {
      verifierId,
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
  args: { verifierId: v.optional(v.id("verifiers")) },
  handler: async (ctx, args) => {
    // If no verifierId provided, get default verifier
    let verifierId = args.verifierId;
    if (!verifierId) {
      const defaultVerifier = await ctx.db
        .query("verifiers")
        .withIndex("by_email", (q) => q.eq("email", "default@verifier.com"))
        .first();
      
      if (defaultVerifier) {
        verifierId = defaultVerifier._id;
      } else {
        // Return empty array if no default verifier exists
        return [];
      }
    }
    
    const requests = await ctx.db
      .query("verificationRequests")
      .withIndex("by_verifier", (q) => q.eq("verifierId", verifierId))
      .collect();
    return requests;
  },
});

export const listVerificationRequestsWithDiploma = query({
  args: { verifierId: v.optional(v.id("verifiers")) },
  handler: async (ctx, args) => {
    // If no verifierId provided, get default verifier
    let verifierId = args.verifierId;
    if (!verifierId) {
      const defaultVerifier = await ctx.db
        .query("verifiers")
        .withIndex("by_email", (q) => q.eq("email", "default@verifier.com"))
        .first();
      
      if (defaultVerifier) {
        verifierId = defaultVerifier._id;
      } else {
        // Return empty array if no default verifier exists
        return [];
      }
    }
    
    const requests = await ctx.db
      .query("verificationRequests")
      .withIndex("by_verifier", (q) => q.eq("verifierId", verifierId))
      .collect();
    
    // Fetch diploma and batch information for each request
    const requestWithDiploma = await Promise.all(
      requests.map(async (request) => {
        const diploma = await ctx.db.get(request.diplomaId);
        let batch = null;
        if (diploma?.batchId) {
          batch = await ctx.db.get(diploma.batchId);
        }
        return {
          ...request,
          diploma,
          batch,
        };
      })
    );
    
    return requestWithDiploma;
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
