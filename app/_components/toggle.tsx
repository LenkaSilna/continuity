type ToggleProps = {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  ariaLabel?: string;
};

export function Toggle({ checked, onChange, disabled, ariaLabel }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onChange}
      className={[
        "relative h-6 w-11 shrink-0 cursor-pointer rounded-(--cui-radius-full) transition-colors duration-(--cui-dur) ease-(--cui-ease) disabled:opacity-50",
        checked ? "bg-accent" : "bg-(--border-strong)",
      ].join(" ")}
    >
      <span
        aria-hidden
        className={[
          "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-(--cui-shadow-sm) transition-transform duration-(--cui-dur) ease-(--cui-ease-out)",
          checked ? "translate-x-5" : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );
}
