import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { uniqueNamesGenerator, adjectives, animals } from "unique-names-generator";
import { v } from "convex/values";
import { requireAuth } from "./utils";

const DOMAIN = "soleebpro.resend.app";

function generateEmailAddress(): string {
  const prefix = uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: "-",
    length: 2,
  });
  return `${prefix}@${DOMAIN}`;
}

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("inboundEmails")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
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
    allowedSenders: v.array(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const userEmails = await ctx.db
      .query("inboundEmails")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    if (userEmails.length >= 5) {
      console.warn("User attempted to create more than 5 email addresses");
      return null;
    }

    let email: string;
    let collision;
    do {
      email = generateEmailAddress();
      collision = await ctx.db
        .query("inboundEmails")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();
    } while (collision);

    return await ctx.db.insert("inboundEmails", {
      userId,
      email,
      enabled: true,
      allowedSenders: args.allowedSenders,
      tags: args.tags ?? [],
    });
  },
});

export const toggleEnabled = mutation({
  args: { id: v.id("inboundEmails"), enabled: v.boolean() },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const doc = await ctx.db.get(args.id);
    if (!doc) throw new Error("Not found");
    await ctx.db.patch(args.id, { enabled: args.enabled });
  },
});

export const updateAllowedSenders = mutation({
  args: { id: v.id("inboundEmails"), allowedSenders: v.array(v.string()) },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const doc = await ctx.db.get(args.id);
    if (!doc) throw new Error("Not found");
    await ctx.db.patch(args.id, { allowedSenders: args.allowedSenders });
  },
});

export const updateTags = mutation({
  args: { id: v.id("inboundEmails"), tags: v.array(v.string()) },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const doc = await ctx.db.get(args.id);
    if (!doc) throw new Error("Not found");
    await ctx.db.patch(args.id, { tags: args.tags });
  },
});

export const updateModel = mutation({
  args: { id: v.id("inboundEmails"), model: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const doc = await ctx.db.get(args.id);
    if (!doc) throw new Error("Not found");
    await ctx.db.patch(args.id, { model: args.model });
  },
});

export const remove = mutation({
  args: { id: v.id("inboundEmails") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const doc = await ctx.db.get(args.id);
    if (!doc) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});
