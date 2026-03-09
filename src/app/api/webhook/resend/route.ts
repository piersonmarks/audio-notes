import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk";
import { put } from "@vercel/blob";
import { getUserByInboundEmail, isSenderAllowed } from "@/lib/config";
import type { processAudioEmail } from "@/trigger/process-audio-email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Resend inbound webhook payload
    const { from, to, subject, attachments } = body;

    if (!from || !to) {
      return NextResponse.json(
        { error: "Missing from or to" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawTo: any[] = Array.isArray(to) ? to : [to];
    const senderEmail: string =
      typeof from === "string"
        ? from
        : (from as Record<string, string>).address ??
          (from as Record<string, string>).email ??
          "";

    for (const toAddress of rawTo) {
      const inboundEmail: string =
        typeof toAddress === "string"
          ? toAddress
          : toAddress.address ?? toAddress.email ?? "";

      // Look up the user config for this inbound email
      const user = await getUserByInboundEmail(inboundEmail);

      if (!user) {
        console.log(`No user found for inbound email: ${inboundEmail}`);
        continue;
      }

      if (!user.enabled) {
        console.log(`User is disabled: ${inboundEmail}`);
        continue;
      }

      // Check sender allowlist
      if (!isSenderAllowed(user.allowedSenders, senderEmail)) {
        console.log(
          `Sender ${senderEmail} not in allowlist for ${inboundEmail}`
        );
        continue;
      }

      // Upload audio attachments to Vercel Blob in parallel
      const audioAttachments = (attachments ?? []).filter(
        (a: { content_type: string }) => a.content_type?.startsWith("audio/")
      );

      const blobUrls = await Promise.all(
        audioAttachments.map(async (att: { filename: string; content: string; content_type: string }) => {
          const buffer = Buffer.from(att.content, "base64");
          const blob = await put(
            `audio/${user.id}/${Date.now()}-${att.filename}`,
            buffer,
            { access: "public", contentType: att.content_type }
          );
          return {
            filename: att.filename,
            url: blob.url,
            contentType: att.content_type,
          };
        })
      );

      if (blobUrls.length === 0) {
        console.log("No audio attachments found");
        continue;
      }

      // Trigger the task with blob URLs instead of raw base64
      await tasks.trigger<typeof processAudioEmail>("process-audio-email", {
        from: senderEmail,
        to: inboundEmail,
        subject: subject ?? "",
        attachments: blobUrls,
      });

      console.log(`Triggered audio processing for ${inboundEmail}`);
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
