import { useState, useTransition } from "react";
import { DATA_BLOCKS, type DataBlock } from "@/lib/types";
import { useI18n } from "@/lib/i18n/client";
import { confirmToast } from "@/lib/confirm-toast";
import { showError } from "@/lib/toast";
import { ToggleChip } from "@/app/_components/toggle-chip";
import type { CustomPromptActionState } from "../_actions";

type Props = {
  onSubmit: (formData: FormData) => Promise<CustomPromptActionState>;
  onSuccess?: (state: CustomPromptActionState) => void;
  initialName?: string;
  initialQuestion?: string;
  initialBlocks?: DataBlock[];
  onDelete?: () => Promise<void>;
};

export function CustomPromptForm({
  onSubmit,
  onSuccess,
  initialName = "",
  initialQuestion = "",
  initialBlocks = [],
  onDelete,
}: Props) {
  const { t } = useI18n();
  const [isPending, startSave] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [selected, setSelected] = useState<Set<DataBlock>>(
    new Set(initialBlocks),
  );
  const [name, setName] = useState(initialName);
  const [question, setQuestion] = useState(initialQuestion);

  const toggleBlock = (block: DataBlock) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(block)) next.delete(block);
      else next.add(block);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startSave(async () => {
      const result = await onSubmit(formData);
      if (result.errorCode) {
        const msg =
          result.errorCode === "name_required"
            ? t.ai.custom.errors.nameRequired
            : t.ai.custom.errors.generic;
        showError(msg);
      } else {
        onSuccess?.(result);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div className="space-y-1">
        <label className="block text-xs font-medium">
          {t.ai.custom.nameLabel}
        </label>
        <input
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.ai.custom.namePlaceholder}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      {/* Data blocks */}
      <fieldset className="space-y-2">
        <legend className="text-xs font-medium">
          {t.ai.custom.dataBlocksLabel}
        </legend>
        <div className="flex flex-wrap gap-2">
          {DATA_BLOCKS.map((block) => (
            <ToggleChip
              key={block}
              label={t.ai.custom.blocks[block]}
              active={selected.has(block)}
              onClick={() => toggleBlock(block)}
            />
          ))}
        </div>
      </fieldset>
      {[...selected].map((block) => (
        <input key={block} type="hidden" name="data_blocks" value={block} />
      ))}

      {/* Question */}
      <div className="space-y-1">
        <label className="block text-xs font-medium">
          {t.ai.custom.questionLabel}
        </label>
        <textarea
          name="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t.ai.custom.questionPlaceholder}
          rows={6}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm leading-relaxed dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="safe-bottom sticky bottom-0 -mx-4 flex items-center gap-2 border-t border-zinc-200 bg-[var(--background)]/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 dark:border-zinc-800 ">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-zinc-50 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {isPending ? t.common.saving : t.ai.custom.save}
        </button>
        {onDelete && (
          <button
            type="button"
            disabled={isDeleting}
            onClick={() =>
              confirmToast({
                message: t.ai.custom.confirmDelete,
                detail: name,
                confirmLabel: t.common.delete,
                cancelLabel: t.common.cancel,
                onConfirm: () => startDelete(() => onDelete()),
                successMessage: t.common.deleted,
              })
            }
            className="inline-flex h-11 items-center justify-center rounded-md border border-red-200 px-4 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
          >
            {isDeleting ? t.common.deleting : t.ai.custom.delete}
          </button>
        )}
      </div>
    </form>
  );
}
