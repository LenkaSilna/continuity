import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMessages } from "@/lib/i18n/server";
import type {
  Habit,
  Product,
  ProductBrand,
  RoutineItem,
  Supplement,
  SupplementBrand,
} from "@/lib/types";
import { TopNav } from "../_components/top-nav";
import { RoutineTabs } from "./_components/routine-tabs";

export default async function RoutinePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [
    { data: products },
    { data: productBrands },
    { data: supplements },
    { data: supplementBrands },
    { data: habits },
    { data: routineItems },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true }),
    supabase.from("product_brands").select("*"),
    supabase
      .from("supplements")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true }),
    supabase.from("supplement_brands").select("*"),
    supabase
      .from("habits")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true }),
    supabase
      .from("routine_items")
      .select("*")
      .order("created_at", { ascending: true }),
  ]);

  const t = await getMessages();

  return (
    <>
      <TopNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10">
        <header>
          <Link
            href="/dashboard"
            className="-ml-3 mb-2 inline-flex h-10 items-center gap-1 rounded-md px-3 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
          >
            ← {t.common.backToDashboard}
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.routine.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {t.routine.subtitle}
          </p>
        </header>

        <RoutineTabs
          products={(products ?? []) as Product[]}
          productBrands={(productBrands ?? []) as ProductBrand[]}
          supplements={(supplements ?? []) as Supplement[]}
          supplementBrands={(supplementBrands ?? []) as SupplementBrand[]}
          habits={(habits ?? []) as Habit[]}
          routineItems={(routineItems ?? []) as RoutineItem[]}
        />
      </main>
    </>
  );
}
