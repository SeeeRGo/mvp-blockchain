import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getPendingForBatch = query({
  args: { universityId: v.id("universities") },
  handler: async (ctx, args) => {
    const diplomas = await ctx.db
      .query("diplomas")
      .withIndex("by_university", (q) => 
        q.eq("universityId", args.universityId).eq("status", "accepted")
      )
      .collect();
    return diplomas;
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
