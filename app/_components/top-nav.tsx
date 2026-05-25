import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/browser";
import { getModuleFlags, DEFAULT_MODULE_FLAGS } from "@/lib/modules";
import { LocaleSwitcher } from "./locale-switcher";
import { NavDrawer } from "./nav-drawer";

export function TopNav({ rightSlot }: { rightSlot?: React.ReactNode }) {
  const { data: flags = DEFAULT_MODULE_FLAGS } = useQuery({
    queryKey: ["module-flags"],
    queryFn: () => getModuleFlags(supabase),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <header className="safe-top sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-zinc-200 bg-[var(--background)]/80 px-4 py-2 backdrop-blur dark:border-zinc-800">
      <Link
        to="/dashboard"
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
