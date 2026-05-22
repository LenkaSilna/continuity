import Link from "next/link";
import { getModuleFlagsCached } from "@/lib/modules";
import { LocaleSwitcher } from "./locale-switcher";
import { NavDrawer } from "./nav-drawer";

export async function TopNav({ rightSlot }: { rightSlot?: React.ReactNode }) {
  const flags = await getModuleFlagsCached();

  return (
    <header className="safe-top sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-zinc-200 bg-white/80 px-4 py-2 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <Link
        href="/dashboard"
        className="-mx-2 inline-flex items-center rounded-md px-2 py-1 text-2xl font-semibold tracking-tight transition hover:bg-zinc-100 dark:hover:bg-zinc-900"
      >
        Continuity
      </Link>
      <div className="flex items-center gap-2">
        {rightSlot}
        <LocaleSwitcher />
        <NavDrawer flags={flags} />
      </div>
    </header>
  );
}
