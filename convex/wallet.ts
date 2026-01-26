import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listDiplomas = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const diplomas = await ctx.db
      .query("diplomas")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.userId))
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

export const acceptDiploma = mutation({
  args: {
    diplomaId: v.id("diplomas"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.diplomaId, {
      status: "accepted",
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const listVerificationRequests = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get user's diplomas
    const diplomas = await ctx.db
      .query("diplomas")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.userId))
      .collect();
    
    const diplomaIds = diplomas.map(d => d._id);
    
    // Get verification requests for these diplomas
    const requests = await ctx.db
      .query("verificationRequests")
      .collect()
      .then(reqs => reqs.filter(r => diplomaIds.includes(r.diplomaId)));
    
    return requests;
  },
});

export const approveSharing = mutation({
  args: {
    requestId: v.id("verificationRequests"),
    sharedFields: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");
    
    const diploma = await ctx.db.get(request.diplomaId);
    if (!diploma) throw new Error("Diploma not found");
    
    // Filter diploma data to only include shared fields
    const sharedData = {};
    args.sharedFields.forEach(field => {
      sharedData[field] = diploma.data[field];
    });
    
    await ctx.db.patch(args.requestId, {
      status: "approved",
      sharedData,
    });
    
    return { success: true };
  },
});

export const rejectSharing = mutation({
  args: {
    requestId: v.id("verificationRequests"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.requestId, {
      status: "rejected",
    });
    return { success: true };
  },
});

export const registerUser = mutation({
  args: {
    email: v.string(),
    phone: v.optional(v.string()),
    publicKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      email: args.email,
      phone: args.phone,
      publicKey: args.publicKey,
      createdAt: Date.now(),
    });
    return userId;
  },
});

export const updateUserDeviceToken = mutation({
  args: {
    userId: v.id("users"),
    deviceToken: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      deviceToken: args.deviceToken,
    });
    return { success: true };
  },
});
