"use server";

import { revalidatePath } from "next/cache";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

function parseSendersList(input: string): string[] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function addInboundEmail(formData: FormData) {
  const sendersRaw = formData.get("allowedSenders") as string;
  const tagsRaw = formData.get("tags") as string;

  const allowedSenders = sendersRaw ? parseSendersList(sendersRaw) : [];
  const tags = tagsRaw ? parseSendersList(tagsRaw) : [];

  try {
    const token = await convexAuthNextjsToken();
    await fetchMutation(
      api.inboundEmails.create,
      { allowedSenders, tags },
      { token }
    );
  } catch {
    return { error: "Failed to create inbound email" };
  }

  revalidatePath("/app");
  return { success: true };
}

export async function toggleInboundEmail(id: string, enabled: boolean) {
  const token = await convexAuthNextjsToken();
  await fetchMutation(
    api.inboundEmails.toggleEnabled,
    { id: id as Id<"inboundEmails">, enabled },
    { token },
  );
  revalidatePath("/app");
}

export async function updateAllowedSenders(id: string, sendersRaw: string) {
  const allowedSenders = sendersRaw ? parseSendersList(sendersRaw) : [];
  const token = await convexAuthNextjsToken();
  await fetchMutation(
    api.inboundEmails.updateAllowedSenders,
    { id: id as Id<"inboundEmails">, allowedSenders },
    { token },
  );
  revalidatePath("/app");
}

export async function updateTags(id: string, tagsRaw: string) {
  const tags = tagsRaw ? parseSendersList(tagsRaw) : [];
  const token = await convexAuthNextjsToken();
  await fetchMutation(
    api.inboundEmails.updateTags,
    { id: id as Id<"inboundEmails">, tags },
    { token },
  );
  revalidatePath("/app");
}

export async function deleteInboundEmail(id: string) {
  const token = await convexAuthNextjsToken();
  await fetchMutation(
    api.inboundEmails.remove,
    { id: id as Id<"inboundEmails"> },
    { token },
  );
  revalidatePath("/app");
}

export async function deleteProcessedEmail(id: string) {
  const token = await convexAuthNextjsToken();
  await fetchMutation(
    api.processedEmails.remove,
    { id: id as Id<"processedEmails"> },
    { token },
  );
  revalidatePath("/app");
}

export async function getProcessedEmailContent(id: string) {
  const token = await convexAuthNextjsToken();
  const doc = await fetchQuery(
    api.processedEmails.getById,
    { id: id as Id<"processedEmails"> },
    { token },
  );
  if (!doc) throw new Error("Not found");
  return {
    filename: `${doc.subject || "email"}-${new Date(doc.receivedAt).toISOString().slice(0, 10)}.md`,
    content: doc.content || "",
  };
}
