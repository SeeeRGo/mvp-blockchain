import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const anchorPendingBatches = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Get universities with pending diplomas
    const universities = await ctx.db.query("universities").collect();
    
    for (const university of universities) {
      if (!university.publisherKey) continue;
      
      // Trigger batch anchoring
      await ctx.scheduler.runAfter(0, internal.blockchain.createBatchAnchor, {
        universityId: university._id,
      });
    }
  },
});

// Schedule to run every hour
export const scheduleBatchAnchoring = internalMutation({
  args: {},
  handler: async (ctx) => {
    await ctx.scheduler.runAfter(60 * 60 * 1000, internal.cron.anchorPendingBatches, {});
  },
});
