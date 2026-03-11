"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Download } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ProcessedEmail = {
  _id: Id<"processedEmails">;
  _creationTime: number;
  inboundEmailAddress: string;
  status: "in_progress" | "error" | "complete";
  subject?: string;
  sender: string;
  forwardedBy?: string;
  receivedAt: number;
  title?: string;
  summary?: string;
  actionItems?: string[];
  content?: string;
  errorMessage?: string;
  processingTimeMs?: number;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
};

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

function EmailActions({ email }: { email: ProcessedEmail }) {
  const [isPending, setIsPending] = useState(false);
  const remove = useMutation(api.processedEmails.remove);

  function downloadFile(content: string, suffix: string) {
    const filename = `${email.subject || "email"}-${new Date(email.receivedAt).toISOString().slice(0, 10)}-${suffix}.md`;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex items-center justify-between pt-3 border-t mt-3">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-destructive border-destructive/30" disabled={isPending}>
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete processed email?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the processed data
              {email.subject ? (
                <>
                  {" "}for <strong>{email.subject}</strong>
                </>
              ) : null}
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isPending}
              onClick={async () => {
                setIsPending(true);
                try {
                  await remove({ id: email._id });
                  toast.success("Deleted");
                } catch {
                  toast.error("Failed to delete");
                } finally {
                  setIsPending(false);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="flex items-center gap-2">
        {email.content && (
          <Button variant="outline" size="sm" disabled={isPending} onClick={() => downloadFile(email.content!, "transcription")}>
            Download Transcription
          </Button>
        )}
        {email.summary && (
          <Button size="sm" disabled={isPending} onClick={() => downloadFile(email.summary!, "summary")}>
            <Download className="h-4 w-4" />
            Download
          </Button>
        )}
      </div>
    </div>
  );
}

export function ProcessedEmailAccordion({ emails }: { emails: ProcessedEmail[] }) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {emails.map((email) => {
        const status = statusConfig[email.status];
        return (
          <AccordionItem key={email._id} value={email._id}>
            <AccordionTrigger className="py-3 px-1 gap-3 hover:no-underline overflow-hidden">
              <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
                <Badge
                  variant={"variant" in status ? status.variant : "secondary"}
                  className={"className" in status ? status.className : undefined}
                >
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

                {email.errorMessage && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {email.errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 rounded-md bg-muted/50 p-3">
                  <MetadataItem label="Sender" value={email.sender} />
                  {email.forwardedBy && (
                    <MetadataItem label="Forwarded By" value={email.forwardedBy} />
                  )}
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

                <EmailActions email={email} />
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
