"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
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
  FieldError,
} from "@/components/ui/field";
import { TagInput } from "@/components/tag-input";

const formSchema = z.object({
  allowedSenders: z.string(),
  tags: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

function parseSendersList(input: string): string[] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function AddEmailDialog({
  label = "Add Email Address",
}: {
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const create = useMutation(api.inboundEmails.create);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      allowedSenders: "",
      tags: [],
    },
  });

  async function onSubmit(data: FormValues) {
    try {
      await create({
        allowedSenders: data.allowedSenders
          ? parseSendersList(data.allowedSenders)
          : [],
        tags: data.tags,
      });
      toast.success("Inbound email address created");
      form.reset();
      setOpen(false);
    } catch {
      toast.error("Failed to create inbound email");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>{label}</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create Inbound Email</DialogTitle>
            <DialogDescription>
              A unique email address will be generated that accepts audio
              attachments and processes them.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Controller
              name="allowedSenders"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Allowed Senders (optional)
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="example.com, user@other.com"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Comma-separated list of domains or emails. Leave empty to
                    allow all senders.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="tags"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Tags (optional)</FieldLabel>
                  <TagInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Type a tag and press Enter"
                  />
                  <FieldDescription>
                    Press Enter or comma to add a tag.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
