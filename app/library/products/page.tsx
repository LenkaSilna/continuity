import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireModule } from "@/lib/modules";
import { getMessages } from "@/lib/i18n/server";
import type { Product, ProductBrand, ProductType } from "@/lib/types";
import { TopNav } from "../../_components/top-nav";
import { BackToDashboard } from "../../_components/back-to-dashboard";
import { ProductTypesSection } from "./_components/product-types-section";
import { ProductBrandsSection } from "./_components/product-brands-section";
import { AddProductForm } from "./_components/add-product-form";
import { ProductsList } from "./_components/products-list";

export default async function ProductsLibraryPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");
  await requireModule(supabase, "module_products");

  const [{ data: types }, { data: brands }, { data: products }] =
    await Promise.all([
      supabase
        .from("product_types")
        .select("*")
        .order("position", { ascending: true }),
      supabase
        .from("product_brands")
        .select("*")
        .order("name", { ascending: true }),
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
        <header>
          <BackToDashboard />
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.library.products.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {t.library.products.subtitle}
          </p>
        </header>

        <ProductTypesSection types={(types ?? []) as ProductType[]} />

        <ProductBrandsSection brands={(brands ?? []) as ProductBrand[]} />

        <AddProductForm
          types={(types ?? []) as ProductType[]}
          brands={(brands ?? []) as ProductBrand[]}
        />

        <ProductsList
          products={(products ?? []) as Product[]}
          types={(types ?? []) as ProductType[]}
          brands={(brands ?? []) as ProductBrand[]}
        />
      </main>
    </>
  );
}
