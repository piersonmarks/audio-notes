"use server";

import { revalidatePath } from "next/cache";
import { fetchMutation } from "convex/nextjs";
import { api } from "../../convex/_generated/api";

function parseSendersList(input: string): string[] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function addInboundEmail(formData: FormData) {
  const email = formData.get("email") as string;
  const ownerEmail = formData.get("ownerEmail") as string;
  const sendersRaw = formData.get("allowedSenders") as string;

  if (!email || !ownerEmail) {
    return { error: "Email and owner email are required" };
  }

  const allowedSenders = sendersRaw ? parseSendersList(sendersRaw) : [];

  try {
    await fetchMutation(api.inboundEmails.create, {
      email,
      ownerEmail,
      allowedSenders,
    });
  } catch {
    return { error: "Email address already exists" };
  }

  revalidatePath("/");
  return { success: true };
}

export async function toggleInboundEmail(email: string, enabled: boolean) {
  await fetchMutation(api.inboundEmails.toggleEnabled, { email, enabled });
  revalidatePath("/");
}

export async function updateAllowedSenders(
  email: string,
  sendersRaw: string
) {
  const allowedSenders = sendersRaw ? parseSendersList(sendersRaw) : [];
  await fetchMutation(api.inboundEmails.updateAllowedSenders, {
    email,
    allowedSenders,
  });
  revalidatePath("/");
}

export async function deleteInboundEmail(email: string) {
  await fetchMutation(api.inboundEmails.remove, { email });
  revalidatePath("/");
}
