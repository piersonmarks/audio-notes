import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  inboundEmails: defineTable({
    email: v.string(),
    enabled: v.boolean(),
    allowedSenders: v.array(v.string()),
    tags: v.optional(v.array(v.string())),
  }).index("by_email", ["email"]),

  processedEmails: defineTable({
    inboundEmailId: v.optional(v.id("inboundEmails")),
    inboundEmailAddress: v.string(),
    status: v.union(
      v.literal("in_progress"),
      v.literal("error"),
      v.literal("complete")
    ),
    subject: v.optional(v.string()),
    sender: v.string(),
    forwardedBy: v.optional(v.string()),
    receivedAt: v.number(),
    summary: v.optional(v.string()),
    content: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    // Developer / processing metadata
    processingTimeMs: v.optional(v.number()),
    model: v.optional(v.string()),
    inputTokens: v.optional(v.number()),
    outputTokens: v.optional(v.number()),
    totalTokens: v.optional(v.number()),
  })
    .index("by_inboundEmailId", ["inboundEmailId"])
    .index("by_receivedAt", ["receivedAt"]),
});
