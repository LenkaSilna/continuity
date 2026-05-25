import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/browser";
import { useI18n } from "@/lib/i18n/client";
import { TopNav } from "@/app/_components/top-nav";
import { BackToDashboard } from "@/app/_components/back-to-dashboard";
import { AddProductForm } from "@/app/library/products/_components/add-product-form";
import { ProductTypesSection } from "@/app/library/products/_components/product-types-section";
import { ProductBrandsSection } from "@/app/library/products/_components/product-brands-section";
import { ProductsList } from "@/app/library/products/_components/products-list";
import type { Product, ProductBrand, ProductType } from "@/lib/types";

export function ProductsPage() {
  const { t } = useI18n();

  const { data: types = [] } = useQuery({
    queryKey: ["product-types"],
    queryFn: async () => {
      const { data } = await supabase
        .from("product_types")
        .select("*")
        .order("position", { ascending: true });
      return (data ?? []) as ProductType[];
    },
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["product-brands"],
    queryFn: async () => {
      const { data } = await supabase
        .from("product_brands")
        .select("*")
        .order("name", { ascending: true });
      return (data ?? []) as ProductBrand[];
    },
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      return (data ?? []) as Product[];
    },
  });

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

        <AddProductForm types={types} brands={brands} />

        <ProductTypesSection types={types} />

        <ProductBrandsSection brands={brands} />

        {!isLoading && <ProductsList products={products} types={types} brands={brands} />}
      </main>
    </>
  );
}
