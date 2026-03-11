"use client";

import { useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ProcessedEmailAccordion } from "@/components/processed-email-accordion";

const PAGE_SIZE = 5;

export function ProcessedEmailList() {
  const emails = useQuery(api.processedEmails.getAll);
  const [page, setPage] = useState(0);

  if (emails === undefined) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Processed Emails</CardTitle>
          <CardDescription>
            Received emails and their processing status. Click to expand.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 py-3 px-1 border-b last:border-b-0">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-48 flex-shrink" />
                <Skeleton className="h-4 w-28 ml-auto" />
                <Skeleton className="h-4 w-4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
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

  const totalPages = Math.ceil(emails.length / PAGE_SIZE);
  const paged = emails.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Processed Emails</CardTitle>
        <CardDescription>
          Received emails and their processing status. Click to expand.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProcessedEmailAccordion emails={paged} />
        {totalPages > 1 && (
          <div className="grid grid-cols-3 items-center pt-4 mt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              className="justify-self-start"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground text-center">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="justify-self-end"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
