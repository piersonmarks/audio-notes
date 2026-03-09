import { db } from ".";
import { inboundEmails, allowedSenders } from "./schema";
import { eq } from "drizzle-orm";

export type InboundEmailWithSenders = typeof inboundEmails.$inferSelect & {
  allowedSenders: string[];
};

function groupSenders(
  rows: Array<{
    inbound_emails: typeof inboundEmails.$inferSelect;
    allowed_senders: typeof allowedSenders.$inferSelect | null;
  }>
): InboundEmailWithSenders[] {
  const map = new Map<string, InboundEmailWithSenders>();
  for (const row of rows) {
    const email = row.inbound_emails;
    const existing = map.get(email.id);
    if (existing) {
      if (row.allowed_senders) {
        existing.allowedSenders.push(row.allowed_senders.sender);
      }
    } else {
      map.set(email.id, {
        ...email,
        allowedSenders: row.allowed_senders
          ? [row.allowed_senders.sender]
          : [],
      });
    }
  }
  return Array.from(map.values());
}

export async function getAllInboundEmails(): Promise<InboundEmailWithSenders[]> {
  const rows = await db
    .select()
    .from(inboundEmails)
    .leftJoin(allowedSenders, eq(inboundEmails.id, allowedSenders.inboundEmailId));

  return groupSenders(rows);
}

export async function getInboundEmailByAddress(
  email: string
): Promise<InboundEmailWithSenders | undefined> {
  const rows = await db
    .select()
    .from(inboundEmails)
    .leftJoin(allowedSenders, eq(inboundEmails.id, allowedSenders.inboundEmailId))
    .where(eq(inboundEmails.email, email.toLowerCase()));

  const results = groupSenders(rows);
  return results[0];
}

export function parseSendersList(input: string): string[] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
