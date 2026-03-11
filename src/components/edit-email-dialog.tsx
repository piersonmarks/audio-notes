"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { TagInput } from "@/components/tag-input";

function parseSendersList(input: string): string[] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function EditEmailDialog({
  id,
  email,
  tags,
  allowedSenders,
  children,
}: {
  id: Id<"inboundEmails">;
  email: string;
  tags: string[];
  allowedSenders: string[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [tagValue, setTagValue] = useState(tags);
  const [sendersValue, setSendersValue] = useState(
    allowedSenders.join(", ")
  );
  const [saving, setSaving] = useState(false);
  const updateTagsMut = useMutation(api.inboundEmails.updateTags);
  const updateSendersMut = useMutation(api.inboundEmails.updateAllowedSenders);

  function handleOpenChange(value: boolean) {
    setOpen(value);
    if (!value) {
      setTagValue(tags);
      setSendersValue(allowedSenders.join(", "));
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await Promise.all([
        updateTagsMut({ id, tags: tagValue }),
        updateSendersMut({
          id,
          allowedSenders: sendersValue ? parseSendersList(sendersValue) : [],
        }),
      ]);
      toast.success("Settings updated");
      setOpen(false);
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Email Settings</DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {email}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Field>
            <FieldLabel>Tags</FieldLabel>
            <TagInput
              value={tagValue}
              onChange={setTagValue}
              placeholder="Type a tag and press Enter"
            />
            <FieldDescription>
              Press Enter or comma to add a tag.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel>Allowed Senders</FieldLabel>
            <Input
              value={sendersValue}
              onChange={(e) => setSendersValue(e.target.value)}
              placeholder="example.com, user@other.com"
              autoComplete="off"
            />
            <FieldDescription>
              Comma-separated list of domains or emails. Leave empty to allow
              all senders.
            </FieldDescription>
          </Field>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
