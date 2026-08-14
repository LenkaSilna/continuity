import { Button } from "./button";

export function FormActions({
  isPending,
  onCancel,
  saveLabel,
  savingLabel,
  cancelLabel,
}: {
  isPending: boolean;
  onCancel: () => void;
  saveLabel: string;
  savingLabel: string;
  cancelLabel: string;
}) {
  return (
    <div className="flex gap-2 pt-1">
      <Button type="submit" size="sm" disabled={isPending} className="flex-1">
        {isPending ? savingLabel : saveLabel}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
        {cancelLabel}
      </Button>
    </div>
  );
}
