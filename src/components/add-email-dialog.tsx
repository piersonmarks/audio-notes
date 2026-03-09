"use client";

import { useState } from "react";
import { useActionState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addInboundEmail } from "@/lib/actions";

export function AddEmailDialog({ label = "Add Email Address" }: { label?: string }) {
  const [open, setOpen] = useState(false);

  const [, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = await addInboundEmail(formData);
      if (result?.error) {
        toast.error(result.error);
        return result;
      }
      toast.success("Inbound email address created");
      setOpen(false);
      return result;
    },
    null
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{label}</Button>
      </DialogTrigger>
      <DialogContent>
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Create Inbound Email</DialogTitle>
            <DialogDescription>
              Set up a new email address that will accept audio attachments and
              process them.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Inbound Email Address</Label>
              <Input
                id="email"
                name="email"
                placeholder="mynotes@inbound.yourdomain.com"
                required
              />
              <p className="text-xs text-muted-foreground">
                This is the address people will send audio files to.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ownerEmail">Owner Email</Label>
              <Input
                id="ownerEmail"
                name="ownerEmail"
                placeholder="you@example.com"
                required
              />
              <p className="text-xs text-muted-foreground">
                Your real email for account management.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="allowedSenders">Allowed Senders (optional)</Label>
              <Input
                id="allowedSenders"
                name="allowedSenders"
                placeholder="example.com, user@other.com"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of domains or emails. Leave empty to allow
                all senders.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
