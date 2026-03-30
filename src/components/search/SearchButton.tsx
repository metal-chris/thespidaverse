"use client";

import { useState, useCallback } from "react";
import { Search } from "lucide-react";
import { SearchDialog, useSearchShortcut } from "./SearchDialog";

export function SearchButton() {
  const [open, setOpen] = useState(false);
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  useSearchShortcut(handleOpen);

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground rounded-md border border-border hover:border-accent hover:text-foreground transition-colors"
        aria-label="Search (Cmd+K)"
      >
        <Search className="w-4 h-4" />
        <span className="hidden md:inline">Search</span>
        <kbd className="hidden md:inline text-xs text-muted-foreground/60 px-1 rounded border border-border/50 font-mono ml-1">
          ⌘K
        </kbd>
      </button>
      <SearchDialog open={open} onClose={handleClose} />
    </>
  );
}
