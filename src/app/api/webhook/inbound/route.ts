import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk";
import { Resend } from "resend";
import { getInboundEmailConfig, isSenderAllowed } from "@/lib/config";
import type { processAudioEmail } from "@/trigger/process-audio-email";

const resend = new Resend(process.env.RESEND_API_KEY);

function extractEmail(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, string>;
    return obj.address ?? obj.email ?? "";
  }
  return "";
}

export async function POST(req: NextRequest) {
  console.log("[webhook/inbound] Received request");
  try {
    const body = await req.text();

    // Verify webhook signature
    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json(
        { error: "Missing webhook signature headers" },
        { status: 401 }
      );
    }

    let event;
    try {
      event = resend.webhooks.verify({
        payload: body,
        headers: {
          id: svixId,
          timestamp: svixTimestamp,
          signature: svixSignature,
        },
        webhookSecret: process.env.RESEND_SIGNING_SECRET!,
      });
    } catch {
      console.error("Webhook signature verification failed");
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    if (event.type !== "email.received") {
      return NextResponse.json({ status: "ignored" });
    }

    const { from, to, subject, email_id, message_id } = event.data;

    if (!from || !to) {
      return NextResponse.json(
        { error: "Missing from or to" },
        { status: 400 }
      );
    }

    const rawTo: unknown[] = Array.isArray(to) ? to : [to];
    const senderEmail = extractEmail(from);

    // Fetch attachments once (same for all recipients)
    const { data: attachmentsResponse } =
      await resend.emails.receiving.attachments.list({ emailId: email_id });

    const audioAttachments = (attachmentsResponse?.data ?? [])
      .filter((a) => a.content_type?.startsWith("audio/"))
      .map((att) => ({
        filename: att.filename ?? "audio",
        downloadUrl: att.download_url,
        contentType: att.content_type,
      }));

    if (audioAttachments.length === 0) {
      console.log("No audio attachments found");
      return NextResponse.json({ status: "no_audio" });
    }

    for (const toAddress of rawTo) {
      const inboundAddress = extractEmail(toAddress);

      const emailConfig = await getInboundEmailConfig(inboundAddress);

      if (!emailConfig) {
        console.log(`No inbound email config found for: ${inboundAddress}`);
        continue;
      }

      if (!emailConfig.enabled) {
        console.log(`Inbound email is disabled: ${inboundAddress}`);
        continue;
      }

      if (!isSenderAllowed(emailConfig.allowedSenders, senderEmail)) {
        console.log(
          `Sender ${senderEmail} not in allowlist for ${inboundAddress}`
        );
        continue;
      }

      await tasks.trigger<typeof processAudioEmail>("process-audio-email", {
        userId: emailConfig.userId,
        from: senderEmail,
        to: inboundAddress,
        inboundEmailId: emailConfig._id,
        subject: subject ?? "",
        attachments: audioAttachments,
        model: emailConfig.model,
        messageId: message_id,
      });

      console.log(`Triggered audio processing for ${inboundAddress}`);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
