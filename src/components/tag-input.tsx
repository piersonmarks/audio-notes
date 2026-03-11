"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { XIcon } from "@phosphor-icons/react";

export function TagInput({
  value,
  onChange,
  placeholder = "Type and press Enter or comma",
  autoFocus,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function addTag(raw: string) {
    const tag = raw.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
      setInput("");
    } else if (e.key === "Backspace" && input === "" && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  }

  function handleChange(text: string) {
    // If pasting comma-separated values, split them into tags
    if (text.includes(",")) {
      const parts = text.split(",");
      // Add all complete parts (before last comma) as tags
      for (const part of parts.slice(0, -1)) {
        addTag(part);
      }
      // Keep the text after the last comma as ongoing input
      setInput(parts[parts.length - 1]);
    } else {
      setInput(text);
    }
  }

  return (
    <div>
      <div
        className="flex min-h-8 w-full flex-wrap items-center gap-1.5 rounded-none border border-input bg-transparent px-2.5 py-1 text-xs transition-colors cursor-text focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50 dark:bg-input/30"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <Badge key={tag} variant="default" className="gap-1">
            {tag}
            <button
              type="button"
              className="hover:text-primary-foreground/80 ml-0.5"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
            >
              <XIcon className="size-3" />
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (input.trim()) {
              addTag(input);
              setInput("");
            }
          }}
          placeholder={value.length === 0 ? placeholder : ""}
          className="placeholder:text-muted-foreground min-w-[80px] flex-1 bg-transparent text-xs outline-none md:text-xs"
          autoFocus={autoFocus}
        />
      </div>
    </div>
  );
}
