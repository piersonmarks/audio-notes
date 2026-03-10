import { task, logger } from "@trigger.dev/sdk";
import { experimental_transcribe as transcribe, generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface AudioEmailPayload {
  from: string;
  to: string;
  subject: string;
  attachments: Array<{
    filename: string;
    downloadUrl: string; // Resend temporary download URL (valid 1 hour)
    contentType: string;
  }>;
}

export const processAudioEmail = task({
  id: "process-audio-email",
  retry: {
    maxAttempts: 3,
  },
  run: async (payload: AudioEmailPayload) => {
    const { from, to, subject, attachments } = payload;

    logger.info("Processing audio email", { from, to, subject });

    if (attachments.length === 0) {
      logger.warn("No audio attachments found in email");
      return { status: "no_audio", message: "No audio attachments found" };
    }

    // Process all attachments in parallel
    const results = await Promise.all(
      attachments.map(async (attachment) => {
        logger.info(`Transcribing: ${attachment.filename}`);

        const { text: transcription } = await transcribe({
          model: openai.transcription("whisper-1"),
          audio: new URL(attachment.downloadUrl),
        });

        logger.info("Transcription complete", {
          filename: attachment.filename,
          length: transcription.length,
        });

        const { text: summary } = await generateText({
          model: openai("gpt-4o-mini"),
          system: `You are an expert at analyzing transcribed audio notes. Extract all meaningful information and organize it clearly.

Your response should include:
1. **Summary** - A concise summary of the main points
2. **Key Points** - Bullet points of important information
3. **Action Items** - Any tasks, to-dos, or follow-ups mentioned
4. **Dates & Deadlines** - Any dates or deadlines mentioned
5. **People & Contacts** - Any people or organizations mentioned
6. **Additional Notes** - Any other relevant information

Only include sections that have content. Format using clean HTML for email readability.`,
          prompt: `Please analyze this transcribed audio note:\n\n${transcription}`,
        });

        return {
          filename: attachment.filename,
          transcription,
          summary,
        };
      })
    );

    // Send the results back via email
    const emailBody = results
      .map(
        (r) => `
        <div style="margin-bottom: 32px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 18px;">
            ${r.filename}
          </h2>

          <div style="margin-bottom: 20px;">
            ${r.summary}
          </div>

          <details style="margin-top: 16px;">
            <summary style="cursor: pointer; color: #6b7280; font-size: 14px;">
              View Full Transcription
            </summary>
            <div style="margin-top: 8px; padding: 12px; background: #f9fafb; border-radius: 4px; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">
              ${r.transcription}
            </div>
          </details>
        </div>
      `
      )
      .join("");

    const replySubject = subject
      ? `Re: ${subject} - Audio Notes Processed`
      : "Your Audio Notes - Processed";

    const fromDomain = process.env.RESEND_INBOUND_DOMAIN ?? "yourdomain.com";

    await resend.emails.send({
      from: `Audio Notes <notes@${fromDomain}>`,
      to: from,
      subject: replySubject,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
          <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #111827;">
            <h1 style="margin: 0; font-size: 24px; color: #111827;">Audio Notes</h1>
            <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">
              ${results.length} audio file${results.length > 1 ? "s" : ""} processed
            </p>
          </div>

          ${emailBody}

          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px;">
            Processed by Audio Notes
          </div>
        </div>
      `,
    });

    logger.info("Results email sent", { to: from });

    return {
      status: "success",
      filesProcessed: results.length,
      sentTo: from,
    };
  },
});
