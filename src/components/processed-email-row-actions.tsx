"use client";

import { useTransition } from "react";
import { toast } from "sonner";
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
import { TableCell } from "@/components/ui/table";
import { deleteProcessedEmail, getProcessedEmailContent } from "@/lib/actions";

export function ProcessedEmailRowActions({
  id,
  subject,
  hasContent,
}: {
  id: string;
  subject?: string;
  hasContent: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDownload() {
    startTransition(async () => {
      try {
        const { filename, content } = await getProcessedEmailContent(id);
        const blob = new Blob([content], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {
        toast.error("Failed to download");
      }
    });
  }

  return (
    <TableCell className="text-right">
      <div className="flex items-center justify-end gap-2">
        {hasContent && (
          <Button
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={handleDownload}
          >
            Download
          </Button>
        )}
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
              <AlertDialogTitle>Delete processed email?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove the processed data
                {subject ? (
                  <>
                    {" "}for <strong>{subject}</strong>
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
                onClick={() => {
                  startTransition(async () => {
                    try {
                      await deleteProcessedEmail(id);
                      toast.success("Deleted");
                    } catch {
                      toast.error("Failed to delete");
                    }
                  });
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TableCell>
  );
}
