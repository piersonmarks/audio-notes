"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TableCell } from "@/components/ui/table";
import { toggleInboundEmail, deleteInboundEmail } from "@/lib/actions";

export function EmailRowActions({
  email,
  enabled,
}: {
  email: string;
  enabled: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <TableCell>
        <Switch
          checked={enabled}
          disabled={isPending}
          onCheckedChange={(checked) => {
            startTransition(async () => {
              try {
                await toggleInboundEmail(email, checked);
              } catch {
                toast.error("Failed to update");
              }
            });
          }}
        />
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              try {
                await deleteInboundEmail(email);
                toast.success("Deleted");
              } catch {
                toast.error("Failed to delete");
              }
            });
          }}
        >
          Delete
        </Button>
      </TableCell>
    </>
  );
}
