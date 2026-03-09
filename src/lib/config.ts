import { getInboundEmailByAddress } from "./db/queries";

export { getInboundEmailByAddress as getUserByInboundEmail };

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
