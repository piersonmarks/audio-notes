"use client";

import { useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateAllowedSenders } from "@/lib/actions";

export function AllowedSendersCell({
  email,
  senders,
  children,
}: {
  email: string;
  senders: string[];
  children: ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(senders.join(", "));
  const [isPending, startTransition] = useTransition();

  if (editing) {
    return (
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="domain.com, user@email.com"
          className="h-8 text-sm"
          autoFocus
        />
        <Button
          size="sm"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              try {
                await updateAllowedSenders(email, value);
                toast.success("Allowed senders updated");
                setEditing(false);
              } catch {
                toast.error("Failed to update allowed senders");
              }
            });
          }}
        >
          {isPending ? "..." : "Save"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setEditing(false);
            setValue(senders.join(", "));
          }}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div
      className="flex cursor-pointer flex-wrap gap-1"
      onClick={() => setEditing(true)}
    >
      {children}
    </div>
  );
}
