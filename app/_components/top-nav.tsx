import { LocaleSwitcher } from "./locale-switcher";

export function TopNav({ rightSlot }: { rightSlot?: React.ReactNode }) {
  return (
    <header className="safe-top sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-zinc-200 bg-white/80 px-4 py-2 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <span className="text-sm font-semibold tracking-tight">Continuity</span>
      <div className="flex items-center gap-2">
        {rightSlot}
        <LocaleSwitcher />
      </div>
    </header>
  );
}
