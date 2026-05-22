"use client";

import { useState, type ReactNode } from "react";

export function CollapsibleSection({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  title: string;
  subtitle: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = `collapsible-${title.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <section className="rounded-lg border border-zinc-200 dark:border-zinc-800">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            {title}
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>
        </div>
        <span className="text-xl text-zinc-400" aria-hidden>
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div id={contentId} className="space-y-3 border-t border-zinc-200 p-4 dark:border-zinc-800">
          {children}
        </div>
      )}
    </section>
  );
}
