import {
  pgTable,
  text,
  boolean,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const inboundEmails = pgTable("inbound_emails", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(), // e.g. notes@inbound.yourdomain.com
  ownerEmail: text("owner_email").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const allowedSenders = pgTable("allowed_senders", {
  id: uuid("id").defaultRandom().primaryKey(),
  inboundEmailId: uuid("inbound_email_id")
    .notNull()
    .references(() => inboundEmails.id, { onDelete: "cascade" }),
  sender: text("sender").notNull(), // domain or full email
});
