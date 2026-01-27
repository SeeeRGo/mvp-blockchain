import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    universityId: v.id("universities"),
    merkleRoot: v.string(),
  },
  handler: async (ctx, args) => {
    const batchId = await ctx.db.insert("batches", {
      universityId: args.universityId,
      merkleRoot: args.merkleRoot,
      status: "pending",
      createdAt: Date.now(),
    });
    return batchId;
  },
});

export const updateStatus = mutation({
  args: {
    batchId: v.id("batches"),
    txHash: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.batchId, {
      txHash: args.txHash,
      status: args.status,
      anchoredAt: Date.now(),
    });
  },
});

export const getBatchStatus = query({
  args: { batchId: v.id("batches") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.batchId);
  },
});

export const listBatches = query({
  args: { universityId: v.id("universities") },
  handler: async (ctx, args) => {
    const batches = await ctx.db
      .query("batches")
      .withIndex("by_university", (q) => q.eq("universityId", args.universityId))
      .collect();
    return batches;
  },
});

export const listBatchesWithDetails = query({
  args: { universityId: v.id("universities") },
  handler: async (ctx, args) => {
    const batches = await ctx.db
      .query("batches")
      .withIndex("by_university", (q) => q.eq("universityId", args.universityId))
      .collect();
    
    // Get batch items count for each batch
    const batchesWithDetails = await Promise.all(
      batches.map(async (batch) => {
        const batchItems = await ctx.db
          .query("batchItems")
          .withIndex("by_batch", (q) => q.eq("batchId", batch._id))
          .collect();
        
        return {
          ...batch,
          itemCount: batchItems.length,
        };
      })
    );
    
    // Sort by creation date, newest first
    return batchesWithDetails.sort((a, b) => b.createdAt - a.createdAt);
  },
});
