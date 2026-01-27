import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get user by email
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    return user;
  },
});

// Get or create user by email
export const getOrCreate = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      email: args.email,
      createdAt: Date.now(),
    });

    return userId;
  },
});

// Update user public key
export const updatePublicKey = mutation({
  args: {
    userId: v.id("users"),
    publicKey: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      publicKey: args.publicKey,
    });
    return { success: true };
  },
});

// Update user device token for push notifications
export const updateDeviceToken = mutation({
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
