"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
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
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AddEmailDialog } from "@/components/add-email-dialog";
import { EmailRowActions } from "@/components/email-row-actions";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6"
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        toast.success("Copied to clipboard", { description: value });
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );
}

export function EmailList() {
  const emails = useQuery(api.inboundEmails.getAll);

  if (emails === undefined) {
    return null; // loading
  }

  if (emails.length === 0) {
    return (
      <Card>
        <CardContent className="py-16">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No email addresses yet</EmptyTitle>
              <EmptyDescription>
                Create an inbound email address to start processing audio notes.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <AddEmailDialog label="Add Your First Email" />
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1.5">
          <CardTitle>Email Addresses</CardTitle>
          <CardDescription>
            Manage your inbound audio processing email addresses.
          </CardDescription>
        </div>
        <AddEmailDialog label="Add Email" />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Inbound Email</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Allowed Senders</TableHead>
              <TableHead>Enabled</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emails.map((email) => (
              <TableRow key={email._id}>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-sm">{email.email}</span>
                    <CopyButton value={email.email} />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(email.tags ?? []).length === 0 ? (
                      <Badge variant="secondary">No tags</Badge>
                    ) : (
                      (email.tags ?? []).map((tag) => (
                        <Badge key={tag} variant="default">
                          {tag}
                        </Badge>
                      ))
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {email.allowedSenders.length === 0 ? (
                    <Badge variant="secondary">All senders</Badge>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {email.allowedSenders.map((s) => (
                        <Badge key={s} variant="outline">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  )}
                </TableCell>
                <EmailRowActions
                  id={email._id}
                  email={email.email}
                  enabled={email.enabled}
                  tags={email.tags ?? []}
                  allowedSenders={email.allowedSenders}
                />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
