import { EmailList } from "@/components/email-list";
import { ProcessedEmailList } from "@/components/processed-email-list";
import { SignOutButton } from "@/components/sign-out-button";
import { HowItWorks } from "@/components/how-it-works";
import { AudioLines } from "lucide-react";
import { GitHubIcon } from "@/components/icons";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-primary text-primary-foreground">
              <AudioLines className="h-4 w-4" />
            </div>
            <div className="flex h-8 flex-col justify-between">
              <span className="text-sm font-semibold tracking-tight leading-none">Audio Notes</span>
              <span className="text-[11px] leading-none text-muted-foreground">Voice to Notes</span>
            </div>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
        </div>

        <EmailList />
        <ProcessedEmailList />
        <HowItWorks />
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 text-[11px] text-muted-foreground">
          <a href="https://www.jellypod.com/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">&copy; {new Date().getFullYear()} Jellypod, Inc.</a>
          <a
            href="https://github.com/piersonmarks/audio-notes"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <GitHubIcon className="h-3 w-3" />
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
