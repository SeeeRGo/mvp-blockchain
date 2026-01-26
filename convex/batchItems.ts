import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    batchId: v.id("batches"),
    diplomaId: v.id("diplomas"),
    diplomaHash: v.string(),
    merkleProof: v.optional(v.array(v.string())),
    position: v.number(),
  },
  handler: async (ctx, args) => {
    const batchItemId = await ctx.db.insert("batchItems", {
      batchId: args.batchId,
      diplomaId: args.diplomaId,
      diplomaHash: args.diplomaHash,
      merkleProof: args.merkleProof,
      position: args.position,
      createdAt: Date.now(),
    });
    return batchItemId;
  },
});
