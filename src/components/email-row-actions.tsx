"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TableCell } from "@/components/ui/table";
import { EditEmailDialog } from "@/components/edit-email-dialog";

export function EmailRowActions({
  id,
  email,
  enabled,
  tags,
  allowedSenders,
  model,
}: {
  id: Id<"inboundEmails">;
  email: string;
  enabled: boolean;
  tags: string[];
  allowedSenders: string[];
  model?: string;
}) {
  const [isPending, setIsPending] = useState(false);
  const toggle = useMutation(api.inboundEmails.toggleEnabled);
  const remove = useMutation(api.inboundEmails.remove);

  return (
    <>
      <TableCell>
        <Switch
          checked={enabled}
          disabled={isPending}
          onCheckedChange={async (checked) => {
            setIsPending(true);
            try {
              await toggle({ id, enabled: checked });
            } catch {
              toast.error("Failed to update");
            } finally {
              setIsPending(false);
            }
          }}
        />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <EditEmailDialog
            id={id}
            email={email}
            tags={tags}
            allowedSenders={allowedSenders}
            model={model}
          >
            <Button variant="ghost" size="sm" disabled={isPending}>
              Edit
            </Button>
          </EditEmailDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                disabled={isPending}
              >
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete email?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove the email configuration for{" "}
                  <strong>{email}</strong>. Processed emails will be preserved.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={isPending}
                  onClick={async () => {
                    setIsPending(true);
                    try {
                      await remove({ id });
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
        </div>
      </TableCell>
    </>
  );
}
