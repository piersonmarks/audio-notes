import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("inboundEmails").collect();
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("inboundEmails")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();
  },
});

export const create = mutation({
  args: {
    email: v.string(),
    ownerEmail: v.string(),
    allowedSenders: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("inboundEmails")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existing) {
      throw new Error("Email address already exists");
    }

    return await ctx.db.insert("inboundEmails", {
      email: args.email.toLowerCase(),
      ownerEmail: args.ownerEmail,
      enabled: true,
      allowedSenders: args.allowedSenders,
    });
  },
});

export const toggleEnabled = mutation({
  args: { email: v.string(), enabled: v.boolean() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("inboundEmails")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!doc) throw new Error("Not found");

    await ctx.db.patch(doc._id, { enabled: args.enabled });
  },
});

export const updateAllowedSenders = mutation({
  args: { email: v.string(), allowedSenders: v.array(v.string()) },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("inboundEmails")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!doc) throw new Error("Not found");

    await ctx.db.patch(doc._id, { allowedSenders: args.allowedSenders });
  },
});

export const remove = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("inboundEmails")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!doc) throw new Error("Not found");

    await ctx.db.delete(doc._id);
  },
});
