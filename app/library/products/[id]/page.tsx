import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMessages } from "@/lib/i18n/server";
import type { Product, ProductType } from "@/lib/types";
import { TopNav } from "../../../_components/top-nav";
import { EditProductForm } from "../_components/edit-product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [{ data: product }, { data: types }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle<Product>(),
    supabase
      .from("product_types")
      .select("*")
      .order("position", { ascending: true }),
  ]);

  if (!product) notFound();

  const t = await getMessages();

  return (
    <>
      <TopNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10">
        <header className="space-y-1">
          <Link
            href="/library/products"
            className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            ← {t.library.products.back}
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.library.products.edit}
          </h1>
        </header>

        <EditProductForm
          product={product}
          types={(types ?? []) as ProductType[]}
        />
      </main>
    </>
  );
}
