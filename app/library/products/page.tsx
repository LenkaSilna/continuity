import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMessages } from "@/lib/i18n/server";
import type { Product, ProductType } from "@/lib/types";
import { TopNav } from "../../_components/top-nav";
import { ProductTypesSection } from "./_components/product-types-section";
import { AddProductForm } from "./_components/add-product-form";
import { ProductsList } from "./_components/products-list";

export default async function ProductsLibraryPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [{ data: types }, { data: products }] = await Promise.all([
    supabase
      .from("product_types")
      .select("*")
      .order("position", { ascending: true }),
    supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  const t = await getMessages();

  return (
    <>
      <TopNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10">
        <header className="space-y-1">
          <Link
            href="/dashboard"
            className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            ← {t.common.backToDashboard}
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.library.products.title}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {t.library.products.subtitle}
          </p>
        </header>

        <ProductTypesSection types={(types ?? []) as ProductType[]} />

        <AddProductForm types={(types ?? []) as ProductType[]} />

        <ProductsList
          products={(products ?? []) as Product[]}
          types={(types ?? []) as ProductType[]}
        />
      </main>
    </>
  );
}
