import { task, logger, metadata } from "@trigger.dev/sdk";
import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { Resend } from "resend";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const summarySchema = z.object({
  title: z.string().describe("A single-line title summarizing the audio note"),
  summary: z.string().describe("Plain text summary of all key points from the audio"),
  actionItems: z.array(z.string()).describe("Single-line action items, tasks, or follow-ups mentioned"),
});

const resend = new Resend(process.env.RESEND_API_KEY);
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const DEFAULT_MODEL = "gpt-5.4";

interface AudioEmailPayload {
  userId: string;
  from: string;
  to: string;
  inboundEmailId: string;
  subject: string;
  attachments: Array<{
    filename: string;
    downloadUrl: string;
    contentType: string;
  }>;
  model?: string;
  messageId?: string;
}

export const processAudioEmail = task({
  id: "process-audio-email",
  retry: {
    maxAttempts: 3,
  },
  onFailure: async ({ error }) => {
    const id = metadata.get("processedEmailId") as
      | Id<"processedEmails">
      | undefined;
    if (id) {
      await convex.mutation(api.processedEmails.updateStatus, {
        id,
        status: "error",
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }
  },
  run: async (payload: AudioEmailPayload) => {
    const { userId, from, to, inboundEmailId, subject, attachments, model: modelId, messageId } = payload;
    const summaryModel = openai(modelId || DEFAULT_MODEL);

    // Create record with in_progress status (reuse on retry)
    let processedEmailId = metadata.get("processedEmailId") as
      | Id<"processedEmails">
      | undefined;
    if (!processedEmailId) {
      processedEmailId = await convex.mutation(api.processedEmails.create, {
        userId: userId as Id<"users">,
        inboundEmailId: inboundEmailId as Id<"inboundEmails">,
        inboundEmailAddress: to,
        sender: from,
        subject: subject || undefined,
      });
      metadata.set("processedEmailId", processedEmailId);
    }

    const startTime = Date.now();
    logger.info("Processing audio email", { from, to, subject });

    if (attachments.length === 0) {
      throw new Error("No audio attachments found");
    }

    const results = await Promise.all(
      attachments.map(async (attachment) => {
        logger.info(`Transcribing: ${attachment.filename}`);

        // Fetch audio and call doGenerate directly to set the correct mediaType.
        // The AI SDK's transcribe() auto-detects mediaType from magic bytes but
        // has a bug with m4a/mp4 files (checks for 'ftyp' at offset 0, but it's at offset 4).
        const audioResponse = await fetch(attachment.downloadUrl);
        if (!audioResponse.ok) {
          throw new Error(`Failed to download ${attachment.filename}: ${audioResponse.status}`);
        }
        const audioData = new Uint8Array(await audioResponse.arrayBuffer());

        const model = openai.transcription("whisper-1");
        const result = await model.doGenerate({
          audio: audioData,
          mediaType: attachment.contentType,
        });
        const transcription = result.text;

        logger.info("Transcription complete", {
          filename: attachment.filename,
          length: transcription.length,
        });

        const { output, usage } = await generateText({
          model: summaryModel,
          output: Output.object({ schema: summarySchema }),
          system: `You are an expert at analyzing transcribed audio notes. Extract all meaningful information and organize it clearly.

For the title: write a concise single-line summary of what the audio is about.
For the summary: write a thorough plain text summary covering all key points discussed.
For actionItems: extract any tasks, to-dos, follow-ups, or deadlines mentioned. Each item should be a single line. If none, return an empty array.`,
          prompt: `Please analyze this transcribed audio note:\n\n${transcription}`,
        });

        if (!output) throw new Error(`Failed to generate summary for ${attachment.filename}`);

        return { filename: attachment.filename, transcription, ...output, usage };
      })
    );

    // Send results email
    const emailBody = results
      .map(
        (r) => `
        <div style="margin-bottom: 32px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 18px;">${r.title}</h2>
          <p style="margin: 0 0 16px 0; color: #374151; line-height: 1.6;">${r.summary}</p>
          ${r.actionItems.length > 0 ? `
          <div style="margin-bottom: 16px;">
            <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 14px; font-weight: 600;">Action Items</h3>
            <ul style="margin: 0; padding-left: 20px; color: #374151;">
              ${r.actionItems.map((item) => `<li style="margin-bottom: 4px;">${item}</li>`).join("")}
            </ul>
          </div>` : ""}
        </div>`
      )
      .join("");

    const replySubject = subject
      ? `Re: ${subject} - Audio Notes Processed`
      : "Your Audio Notes - Processed";
    const sendingDomain = process.env.RESEND_SENDING_DOMAIN ?? "resend.dev";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    await resend.emails.send({
      from: `Audio Notes <notes@${sendingDomain}>`,
      to: from,
      subject: replySubject,
      ...(messageId && {
        headers: {
          "In-Reply-To": messageId,
          "References": messageId,
        },
      }),
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
          <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #111827;">
            <h1 style="margin: 0; font-size: 24px; color: #111827;">Audio Notes</h1>
            <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">
              ${results.length} audio file${results.length > 1 ? "s" : ""} processed
            </p>
          </div>
          ${emailBody}
          <div style="text-align: center; margin-top: 24px;">
            <a href="${appUrl}/app" style="display: inline-block; padding: 10px 24px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">View full transcription & details</a>
          </div>
          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; text-align: center;">
            Powered by <a href="${appUrl}" style="color: #9ca3af;">Audio Notes</a>
          </div>
        </div>`,
    });

    logger.info("Results email sent", { to: from });

    // Aggregate token usage
    const totalUsage = results.reduce(
      (acc, r) => ({
        input: acc.input + (r.usage?.inputTokens ?? 0),
        output: acc.output + (r.usage?.outputTokens ?? 0),
        total: acc.total + (r.usage?.totalTokens ?? 0),
      }),
      { input: 0, output: 0, total: 0 }
    );

    // Mark as complete
    await convex.mutation(api.processedEmails.updateStatus, {
      id: processedEmailId,
      status: "complete",
      title: results.map((r) => r.title).join(" | "),
      summary: results.map((r) => r.summary).join("\n\n"),
      actionItems: results.flatMap((r) => r.actionItems),
      content: results.map((r) => r.transcription).join("\n\n"),
      processingTimeMs: Date.now() - startTime,
      model: modelId || DEFAULT_MODEL,
      inputTokens: totalUsage.input,
      outputTokens: totalUsage.output,
      totalTokens: totalUsage.total,
    });

    return { status: "success", filesProcessed: results.length, sentTo: from };
  },
});
