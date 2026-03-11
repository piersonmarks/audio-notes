import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const processedEmailStatus = v.union(
  v.literal("in_progress"),
  v.literal("error"),
  v.literal("complete")
);

export default defineSchema({
  ...authTables,
  inboundEmails: defineTable({
    userId: v.id("users"),
    email: v.string(),
    enabled: v.boolean(),
    allowedSenders: v.array(v.string()),
    tags: v.optional(v.array(v.string())),
    model: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_userId", ["userId"]),

  processedEmails: defineTable({
    userId: v.id("users"),
    inboundEmailId: v.optional(v.id("inboundEmails")),
    inboundEmailAddress: v.string(),
    status: processedEmailStatus,
    subject: v.optional(v.string()),
    sender: v.string(),
    forwardedBy: v.optional(v.string()),
    receivedAt: v.number(),
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
  })
    .index("by_inboundEmailId", ["inboundEmailId"])
    .index("by_userId_receivedAt", ["userId", "receivedAt"]),
});
