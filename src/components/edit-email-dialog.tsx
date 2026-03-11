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
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MODEL_OPTIONS = [
  { value: "default", label: "Default (GPT-5.4)" },
  { value: "gpt-5.4", label: "GPT-5.4" },
  { value: "gpt-5.2", label: "GPT-5.2" },
  { value: "gpt-5.1", label: "GPT-5.1" },
  { value: "gpt-5", label: "GPT-5" },
  { value: "gpt-5-mini", label: "GPT-5 Mini" },
  { value: "gpt-5-nano", label: "GPT-5 Nano" },
];

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
  model,
  children,
}: {
  id: Id<"inboundEmails">;
  email: string;
  tags: string[];
  allowedSenders: string[];
  model?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [tagValue, setTagValue] = useState(tags);
  const [sendersValue, setSendersValue] = useState(
    allowedSenders.join(", ")
  );
  const [modelValue, setModelValue] = useState(model ?? "default");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const updateTagsMut = useMutation(api.inboundEmails.updateTags);
  const updateSendersMut = useMutation(api.inboundEmails.updateAllowedSenders);
  const updateModelMut = useMutation(api.inboundEmails.updateModel);

  function handleOpenChange(value: boolean) {
    setOpen(value);
    if (!value) {
      setTagValue(tags);
      setSendersValue(allowedSenders.join(", "));
      setModelValue(model ?? "default");
      setShowAdvanced(false);
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
        updateModelMut({
          id,
          model: modelValue === "default" ? undefined : modelValue,
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

          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showAdvanced ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              Advanced Settings
            </button>

            {showAdvanced && (
              <div className="mt-3 grid gap-4">
                <Field>
                  <FieldLabel>Summarization Model</FieldLabel>
                  <Select value={modelValue} onValueChange={setModelValue}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MODEL_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    The AI model used to summarize transcribed audio. Leave as
                    default unless you have a reason to change it.
                  </FieldDescription>
                </Field>
              </div>
            )}
          </div>
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
