import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AudioLines, Loader2 } from "lucide-react";
import { GitHubIcon } from "@/components/icons";

const FAKE_EMAILS = [
  {
    id: "1",
    email: "notes-7f3a@inbound.audionotes.app",
    tags: ["work"],
    allowedSenders: ["me@example.com"],
    enabled: true,
  },
  {
    id: "2",
    email: "ideas-b2c9@inbound.audionotes.app",
    tags: ["personal"],
    allowedSenders: [],
    enabled: true,
  },
];

const FAKE_PROCESSED = [
  {
    id: "1",
    status: "complete" as const,
    title: "Q1 Planning Meeting Notes",
    subject: "Voice memo — Q1 planning",
    sender: "me@example.com",
    inboundEmailAddress: "notes-7f3a@inbound.audionotes.app",
    receivedAt: Date.now() - 2 * 60 * 60 * 1000,
    summary:
      "Discussed roadmap priorities for Q1. Agreed to focus on mobile app launch and API v2. Marketing will prepare launch assets by end of January.",
    actionItems: [
      "Finalize mobile app feature list by Friday",
      "Schedule API v2 design review with backend team",
      "Share launch timeline with stakeholders",
    ],
    model: "gpt-5",
    processingTimeMs: 12400,
    inputTokens: 8200,
    outputTokens: 420,
    totalTokens: 8620,
  },
  {
    id: "2",
    status: "complete" as const,
    title: "Product Feedback from Customer Call",
    subject: "Audio — customer call recap",
    sender: "me@example.com",
    inboundEmailAddress: "notes-7f3a@inbound.audionotes.app",
    receivedAt: Date.now() - 26 * 60 * 60 * 1000,
    summary:
      "Customer highlighted need for better search and batch export. Very positive on recent onboarding improvements. Willing to do a case study.",
    actionItems: [
      "Add search feature to backlog as high priority",
      "Follow up about case study participation",
    ],
    model: "gpt-5",
    processingTimeMs: 9800,
    inputTokens: 6100,
    outputTokens: 310,
    totalTokens: 6410,
  },
  {
    id: "3",
    status: "in_progress" as const,
    title: "Weekly standup recap",
    subject: "Voice memo",
    sender: "me@example.com",
    inboundEmailAddress: "ideas-b2c9@inbound.audionotes.app",
    receivedAt: Date.now() - 5 * 60 * 1000,
    summary: undefined,
    actionItems: undefined,
    model: undefined,
    processingTimeMs: undefined,
    inputTokens: undefined,
    outputTokens: undefined,
    totalTokens: undefined,
  },
];

const statusConfig = {
  in_progress: { label: "In Progress", className: "bg-yellow-100 text-yellow-800" },
  error: { label: "Error", variant: "destructive" as const },
  complete: { label: "Complete", className: "bg-green-100 text-green-800" },
};

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatTokens(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function MetadataItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-mono">{value}</span>
    </div>
  );
}

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
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <a href="https://github.com/piersonmarks/audio-notes" target="_blank" rel="noopener noreferrer">
                <GitHubIcon className="h-4 w-4" />
              </a>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signin">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 py-8 flex-1">
        <p className="mb-8 text-sm text-muted-foreground">
          Send voice memos and audio files to your unique email address. Receive a summary and action items as an email reply. 100% Open Source.
        </p>

        {/* Email Addresses — fake data */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle>Email Addresses</CardTitle>
              <CardDescription>
                Manage your inbound audio processing email addresses.
              </CardDescription>
            </div>
            <Button size="sm" asChild>
              <Link href="/signin">Add Email</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Inbound Email</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Allowed Senders</TableHead>
                  <TableHead>Enabled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {FAKE_EMAILS.map((email) => (
                  <TableRow key={email.id}>
                    <TableCell className="max-w-[200px]">
                      <span className="font-mono text-sm line-clamp-1 overflow-x-auto break-all">{email.email}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {email.tags.map((tag) => (
                          <Badge key={tag} variant="default">{tag}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {email.allowedSenders.length === 0 ? (
                        <Badge variant="secondary">All senders</Badge>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {email.allowedSenders.map((s) => (
                            <Badge key={s} variant="outline">{s}</Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{email.enabled ? "Yes" : "No"}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Processed Emails — fake data */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Processed Emails</CardTitle>
            <CardDescription>
              Received emails and their processing status. Click to expand.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full" defaultValue="2">
              {FAKE_PROCESSED.map((email) => {
                const status = statusConfig[email.status];
                return (
                  <AccordionItem key={email.id} value={email.id}>
                    <AccordionTrigger className="py-3 px-1 gap-3 hover:no-underline overflow-hidden">
                      <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
                        <Badge
                          variant={"variant" in status ? (status.variant as "destructive") : "secondary"}
                          className={"className" in status ? status.className : undefined}
                        >
                          {email.status === "in_progress" && (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          )}
                          {status.label}
                        </Badge>
                        <span className="truncate font-medium text-sm min-w-0 flex-1">
                          {email.title || email.subject || "—"}
                        </span>
                        <span className="text-muted-foreground text-xs whitespace-nowrap shrink-0 mr-2">
                          {formatDate(email.receivedAt)}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-1">
                      <div className="space-y-3">
                        {email.summary && (
                          <div>
                            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                              Summary
                            </span>
                            <p className="text-sm mt-0.5 whitespace-pre-line">{email.summary}</p>
                          </div>
                        )}

                        {email.actionItems && email.actionItems.length > 0 && (
                          <div>
                            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                              Action Items
                            </span>
                            <ul className="mt-1 list-disc list-inside space-y-0.5">
                              {email.actionItems.map((item, i) => (
                                <li key={i} className="text-sm">{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 rounded-md bg-muted/50 p-3">
                          <MetadataItem label="Sender" value={email.sender} />
                          <MetadataItem label="Inbound Address" value={<span className="line-clamp-1 overflow-x-auto break-all">{email.inboundEmailAddress}</span>} />
                          <MetadataItem label="Received" value={formatDate(email.receivedAt)} />
                          {email.subject && (
                            <MetadataItem label="Subject" value={email.subject} />
                          )}
                        </div>

                        {(email.processingTimeMs != null || email.totalTokens != null || email.model) && (
                          <div>
                            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                              Processing Details
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 rounded-md bg-muted/50 p-3 mt-1">
                              {email.model && (
                                <MetadataItem label="Model" value={email.model} />
                              )}
                              {email.processingTimeMs != null && (
                                <MetadataItem label="Processing Time" value={formatDuration(email.processingTimeMs)} />
                              )}
                              {email.inputTokens != null && (
                                <MetadataItem label="Input Tokens" value={formatTokens(email.inputTokens)} />
                              )}
                              {email.outputTokens != null && (
                                <MetadataItem label="Output Tokens" value={formatTokens(email.outputTokens)} />
                              )}
                              {email.totalTokens != null && (
                                <MetadataItem label="Total Tokens" value={formatTokens(email.totalTokens)} />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>

        {/* How It Works */}
        <div className="mt-8 border bg-muted/50 p-4">
          <p className="text-xs font-medium mb-2">How It Works</p>
          <ol className="grid gap-1 text-xs text-muted-foreground">
            <li><span className="font-medium text-foreground">1.</span> Create an inbound email and add allowed senders.</li>
            <li><span className="font-medium text-foreground">2.</span> Send an email with audio attachments to your address.</li>
            <li><span className="font-medium text-foreground">3.</span> Get a transcription, summary, and action items back.</li>
          </ol>
        </div>
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
