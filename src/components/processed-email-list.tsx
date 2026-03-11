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
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { ProcessedEmailAccordion } from "@/components/processed-email-accordion";

export function ProcessedEmailList() {
  const emails = useQuery(api.processedEmails.getAll);

  if (emails === undefined) {
    return null; // loading
  }

  if (emails.length === 0) {
    return (
      <Card className="mt-8">
        <CardContent className="py-16">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No processed emails yet</EmptyTitle>
              <EmptyDescription>
                Processed emails will appear here as they are received and analyzed.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Processed Emails</CardTitle>
        <CardDescription>
          Received emails and their processing status. Click to expand.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProcessedEmailAccordion emails={emails} />
      </CardContent>
    </Card>
  );
}
