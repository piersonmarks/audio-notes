"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TagInput } from "@/components/tag-input";
import { updateTags } from "@/lib/actions";

export function TagsCell({
  email,
  tags,
}: {
  email: string;
  tags: string[];
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(tags);
  const [isPending, startTransition] = useTransition();

  if (editing) {
    return (
      <div className="flex flex-col gap-2">
        <TagInput
          value={value}
          onChange={setValue}
          placeholder="Type a tag and press Enter"
          autoFocus
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                try {
                  await updateTags(email, value.join(", "));
                  toast.success("Tags updated");
                  setEditing(false);
                } catch {
                  toast.error("Failed to update tags");
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
              setValue(tags);
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex cursor-pointer flex-wrap gap-1"
      onClick={() => setEditing(true)}
    >
      {tags.length === 0 ? (
        <Badge variant="secondary">No tags</Badge>
      ) : (
        tags.map((tag) => (
          <Badge key={tag} variant="default">
            {tag}
          </Badge>
        ))
      )}
    </div>
  );
}
