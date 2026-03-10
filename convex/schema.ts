import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  inboundEmails: defineTable({
    email: v.string(),
    ownerEmail: v.string(),
    enabled: v.boolean(),
    allowedSenders: v.array(v.string()),
  }).index("by_email", ["email"]),
});
