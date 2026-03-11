"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "how-it-works-dismissed";

export function HowItWorks() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  if (dismissed) return null;

  return (
    <div className="mt-8 border bg-muted/50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium mb-2">How It Works</p>
          <ol className="grid gap-1 text-xs text-muted-foreground">
            <li><span className="font-medium text-foreground">1.</span> Create an inbound email and add allowed senders.</li>
            <li><span className="font-medium text-foreground">2.</span> Send an email with audio attachments to your address.</li>
            <li><span className="font-medium text-foreground">3.</span> Get a transcription, summary, and action items back.</li>
          </ol>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={() => {
            localStorage.setItem(STORAGE_KEY, "true");
            setDismissed(true);
          }}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
