import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <nav className="flex items-center justify-between mb-16">
          <span className="text-sm font-bold tracking-tight">Audio Notes</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <a href="https://github.com/piersonmarks/audio-notes" target="_blank" rel="noopener noreferrer">
                <GitHubIcon className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/signin">Sign in</Link>
            </Button>
          </div>
        </nav>

        {/* Hero */}
        <div className="mb-16 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Audio in. Notes out.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground sm:text-lg">
            Forward emails with audio attachments to your unique address.
            Get transcriptions, summaries, and action items back instantly.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link href="/signin">Get started</Link>
            </Button>
          </div>
        </div>

        {/* How it works */}
        <div className="mb-16">
          <h2 className="mb-6 text-center text-lg font-semibold tracking-tight">
            How It Works
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Create an address",
                description:
                  "Set up a unique inbound email address and configure your allowed senders.",
              },
              {
                step: "2",
                title: "Send audio",
                description:
                  "Forward or send emails with audio attachments to your inbound address.",
              },
              {
                step: "3",
                title: "Get notes",
                description:
                  "Receive a transcription, summary, and action items — processed by AI.",
              },
            ].map((item) => (
              <Card key={item.step}>
                <CardContent className="pt-6">
                  <div className="mb-2 text-2xl font-bold text-muted-foreground/40">
                    {item.step}
                  </div>
                  <h3 className="mb-1 font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>Audio Notes</span>
          <span>&middot;</span>
          <a
            href="https://github.com/piersonmarks/audio-notes"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <GitHubIcon className="h-3 w-3" />
            GitHub
          </a>
        </footer>
      </div>
    </div>
  );
}
