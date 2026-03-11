import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("processedEmails")
      .withIndex("by_receivedAt")
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("processedEmails") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db.get(args.id);
  },
});

export const remove = mutation({
  args: { id: v.id("processedEmails") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const doc = await ctx.db.get(args.id);
    if (!doc) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});
