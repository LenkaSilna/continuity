import { useState, useTransition } from "react";
import { useI18n } from "@/lib/i18n/client";
import { showError, showSuccess } from "@/lib/toast";
import { savePromptOverride, deletePromptOverride } from "../_actions";

type Props = {
  initialText: string;
  promptType?: string;
  hasOverride?: boolean;
  generatedText?: string;
  onRegenerate?: () => void;
};

export function PromptEditor({
  initialText,
  promptType,
  hasOverride = false,
  generatedText,
  onRegenerate,
}: Props) {
  const { t } = useI18n();
  const [text, setText] = useState(initialText);
  const [copiedAt, setCopiedAt] = useState<number | null>(null);
  const [isRegen, startRegen] = useTransition();
  const [isSaving, startSave] = useTransition();
  const [isRestoring, startRestore] = useTransition();

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAt(Date.now());
      setTimeout(() => setCopiedAt(null), 2000);
    } catch {
      // Clipboard API can fail in iframes or insecure contexts; fall back
      // to manual selection.
      const textarea = document.querySelector<HTMLTextAreaElement>(
        "textarea[data-prompt]",
      );
      textarea?.select();
    }
  };

  const handleRegenerate = () => {
    startRegen(() => {
      onRegenerate?.();
    });
  };

  const onSave = () => {
    if (!promptType) return;
    startSave(async () => {
      const result = await savePromptOverride(promptType, text);
      if (result.error) showError(t.ai.detail.saveError);
      else showSuccess(t.ai.detail.saved);
    });
  };

  const onRestore = () => {
    if (!promptType || generatedText === undefined) return;
    startRestore(async () => {
      const result = await deletePromptOverride(promptType);
      if (result.error) {
        showError(t.ai.detail.saveError);
      } else {
        setText(generatedText);
        onRegenerate?.();
      }
    });
  };

  const copyIcon = (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="h-4 w-4"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );

  const checkIcon = (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="h-4 w-4"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  const regenIcon = (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="h-4 w-4"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );

  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-500">{t.ai.detail.hint}</p>
      <textarea
        data-prompt
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={24}
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-xs leading-relaxed dark:border-zinc-700 dark:bg-zinc-900"
      />

      <div className="safe-bottom sticky bottom-0 -mx-4 flex flex-col gap-2 border-t border-zinc-200 bg-[var(--background)]/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 dark:border-zinc-800 ">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCopy}
            aria-label={copiedAt ? t.ai.detail.copied : t.ai.detail.copy}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-zinc-900 px-4 text-sm font-medium text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {copiedAt ? checkIcon : copyIcon}
            {copiedAt ? t.ai.detail.copied : t.ai.detail.copy}
          </button>
          {promptType && (
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={isRegen}
              aria-label={t.ai.detail.regenerate}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-zinc-300 px-4 text-sm text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              <span className={isRegen ? "animate-spin" : ""}>{regenIcon}</span>
              {isRegen ? t.common.loading : t.ai.detail.regenerate}
            </button>
          )}
        </div>
        {promptType && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving || text === initialText}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-zinc-300 px-3 text-sm text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              {isSaving ? t.common.saving : t.ai.detail.save}
            </button>
            {hasOverride && (
              <button
                type="button"
                onClick={onRestore}
                disabled={isRestoring}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-zinc-300 px-3 text-sm text-zinc-500 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
              >
                {isRestoring ? t.common.loading : t.ai.detail.restore}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
