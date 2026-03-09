import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddEmailDialog } from "@/components/add-email-dialog";
import { EmailList } from "@/components/email-list";
import { EmailTableSkeleton } from "@/components/email-table-skeleton";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Audio Notes</h1>
            <p className="mt-1 text-muted-foreground">
              Send audio files to your unique email address. Get transcriptions
              and summaries back instantly.
            </p>
          </div>

          <AddEmailDialog />
        </div>

        <Suspense fallback={<EmailTableSkeleton />}>
          <EmailList />
        </Suspense>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="grid gap-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="font-bold text-foreground">1.</span>
                Create an inbound email address above and configure your allowed
                senders.
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-foreground">2.</span>
                Send an email with audio file attachments to your inbound
                address.
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-foreground">3.</span>
                The audio is automatically transcribed using OpenAI Whisper.
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-foreground">4.</span>
                Key information is extracted and organized: summaries, action
                items, dates, and more.
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-foreground">5.</span>
                You receive a formatted email with the transcription and
                analysis.
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
