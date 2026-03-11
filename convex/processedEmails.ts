import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { processedEmailStatus } from "./schema";
import { requireAuth } from "./utils";

// Called from Trigger.dev tasks (no user session available)
export const create = mutation({
  args: {
    userId: v.id("users"),
    inboundEmailId: v.optional(v.id("inboundEmails")),
    inboundEmailAddress: v.string(),
    sender: v.string(),
    subject: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("processedEmails", {
      userId: args.userId,
      inboundEmailId: args.inboundEmailId,
      inboundEmailAddress: args.inboundEmailAddress,
      status: "in_progress",
      sender: args.sender,
      subject: args.subject,
      receivedAt: Date.now(),
    });
  },
});

// Called from Trigger.dev tasks (no user session available)
export const updateStatus = mutation({
  args: {
    id: v.id("processedEmails"),
    status: processedEmailStatus,
    title: v.optional(v.string()),
    summary: v.optional(v.string()),
    actionItems: v.optional(v.array(v.string())),
    content: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    processingTimeMs: v.optional(v.number()),
    model: v.optional(v.string()),
    inputTokens: v.optional(v.number()),
    outputTokens: v.optional(v.number()),
    totalTokens: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("processedEmails")
      .withIndex("by_userId_receivedAt", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("processedEmails") },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const doc = await ctx.db.get(args.id);
    if (!doc || doc.userId !== userId) return null;
    return doc;
  },
});

export const remove = mutation({
  args: { id: v.id("processedEmails") },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const doc = await ctx.db.get(args.id);
    if (!doc || doc.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});
