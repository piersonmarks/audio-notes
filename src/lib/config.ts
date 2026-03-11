import { fetchQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";

export async function getInboundEmailConfig(email: string) {
  return await fetchQuery(api.inboundEmails.getByEmail, { email });
}

export function isSenderAllowed(
  allowedList: string[],
  senderEmail: string
): boolean {
  if (allowedList.length === 0) return true;
  const senderDomain = senderEmail.split("@")[1]?.toLowerCase();
  return allowedList.some((allowed) => {
    const lower = allowed.toLowerCase();
    if (lower.includes("@")) {
      return lower === senderEmail.toLowerCase();
    }
    return senderDomain === lower;
  });
}
