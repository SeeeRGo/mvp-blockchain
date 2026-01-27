import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getPendingForBatch = query({
  args: { universityId: v.id("universities") },
  handler: async (ctx, args) => {
    const diplomas = await ctx.db
      .query("diplomas")
      .withIndex("by_university", (q) =>
        q.eq("universityId", args.universityId)
      )
      .collect();
    // Filter by status after query since index doesn't include status
    return diplomas.filter((d: any) => d.status === "accepted");
  },
});

export const updateStatus = mutation({
  args: {
    diplomaId: v.id("diplomas"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.diplomaId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const getDiplomaByHash = query({
  args: { diplomaHash: v.string() },
  handler: async (ctx, args) => {
    const diploma = await ctx.db
      .query("diplomas")
      .withIndex("by_hash", (q) => q.eq("diplomaHash", args.diplomaHash))
      .first();
    return diploma;
  },
});

export const getDiplomaById = query({
  args: { diplomaId: v.id("diplomas") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.diplomaId);
  },
});

export const searchDiploma = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    // First try to search by hash
    const byHash = await ctx.db
      .query("diplomas")
      .withIndex("by_hash", (q) => q.eq("diplomaHash", args.searchTerm))
      .first();
    
    if (byHash) {
      return byHash;
    }
    
    // If not found by hash, try to search by ID
    // Note: Convex IDs are in format like "1234567890..."
    // We need to validate if it's a valid ID format
    try {
      const diploma = await ctx.db.get(args.searchTerm as any);
      if (diploma) {
        return diploma;
      }
    } catch (e) {
      // Invalid ID format, return null
    }
    
    return null;
  },
});
