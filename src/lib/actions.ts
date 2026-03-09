"use server";

import { revalidatePath } from "next/cache";
import { db } from "./db";
import { inboundEmails, allowedSenders } from "./db/schema";
import { eq } from "drizzle-orm";
import { parseSendersList } from "./db/queries";

export async function addInboundEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const ownerEmail = formData.get("ownerEmail") as string;
  const sendersRaw = formData.get("allowedSenders") as string;

  if (!email || !ownerEmail) {
    return { error: "Email and owner email are required" };
  }

  const senders = sendersRaw ? parseSendersList(sendersRaw) : [];

  try {
    const [inserted] = await db
      .insert(inboundEmails)
      .values({ email: email.toLowerCase(), ownerEmail })
      .returning();

    if (senders.length) {
      await db.insert(allowedSenders).values(
        senders.map((s) => ({
          inboundEmailId: inserted.id,
          sender: s,
        }))
      );
    }
  } catch {
    return { error: "Email address already exists" };
  }

  revalidatePath("/");
  return { success: true };
}

export async function toggleInboundEmail(email: string, enabled: boolean) {
  await db
    .update(inboundEmails)
    .set({ enabled })
    .where(eq(inboundEmails.email, email.toLowerCase()));

  revalidatePath("/");
}

export async function updateAllowedSenders(
  email: string,
  sendersRaw: string
) {
  const [user] = await db
    .select()
    .from(inboundEmails)
    .where(eq(inboundEmails.email, email.toLowerCase()))
    .limit(1);

  if (!user) return { error: "Not found" };

  const senders = sendersRaw ? parseSendersList(sendersRaw) : [];

  await db
    .delete(allowedSenders)
    .where(eq(allowedSenders.inboundEmailId, user.id));

  if (senders.length) {
    await db.insert(allowedSenders).values(
      senders.map((s) => ({
        inboundEmailId: user.id,
        sender: s,
      }))
    );
  }

  revalidatePath("/");
}

export async function deleteInboundEmail(email: string) {
  await db
    .delete(inboundEmails)
    .where(eq(inboundEmails.email, email.toLowerCase()));

  revalidatePath("/");
}
