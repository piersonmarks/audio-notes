import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk";
import { Resend } from "resend";
import { getUserByInboundEmail, isSenderAllowed } from "@/lib/config";
import type { processAudioEmail } from "@/trigger/process-audio-email";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const event = await req.json();

    if (event.type !== "email.received") {
      return NextResponse.json({ status: "ignored" });
    }

    const { from, to, subject, email_id } = event.data;

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

      // Fetch attachments via Resend Attachments API
      const { data: attachmentsResponse } =
        await resend.emails.receiving.attachments.list({
          emailId: email_id,
        });

      const audioAttachments = (attachmentsResponse?.data ?? [])
        .filter((a) => a.content_type?.startsWith("audio/"))
        .map((att) => ({
          filename: att.filename ?? "audio",
          downloadUrl: att.download_url,
          contentType: att.content_type,
        }));

      if (audioAttachments.length === 0) {
        console.log("No audio attachments found");
        continue;
      }

      // Trigger the task with download URLs (valid for 1 hour)
      await tasks.trigger<typeof processAudioEmail>("process-audio-email", {
        from: senderEmail,
        to: inboundEmail,
        subject: subject ?? "",
        attachments: audioAttachments,
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
