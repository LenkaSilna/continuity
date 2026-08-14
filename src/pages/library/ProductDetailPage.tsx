import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase/browser";
import { useI18n } from "@/lib/i18n/client";
import { TopNav } from "@/app/_components/top-nav";
import { ErrorState } from "@/app/_components/error-state";
import { EditProductForm } from "@/app/library/products/_components/edit-product-form";
import type { Product, ProductBrand, ProductType } from "@/lib/types";

export function ProductDetailPage() {
  const { id } = useParams({ from: "/_protected/library/products/$id" });
  const { t } = useI18n();

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle<Product>();
      if (error) throw error;
      return data as Product | null;
    },
  });

  const { data: types = [], isError: isTypesError } = useQuery({
    queryKey: ["product-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_types")
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ProductType[];
    },
  });

  const { data: brands = [], isError: isBrandsError } = useQuery({
    queryKey: ["product-brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_brands")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ProductBrand[];
    },
  });

  if (isError || isTypesError || isBrandsError) {
    return <ErrorState message={t.common.errorGeneric} />;
  }

  if (!isLoading && !product) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-(--text-muted)">Not found</p>
      </main>
    );
  }

  return (
    <>
      <TopNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10">
        <header>
          <Link
            to="/library/products"
            className="-ml-3 mb-2 inline-flex h-10 items-center gap-1 rounded-md px-3 text-sm text-(--text-muted) transition-colors hover:bg-(--surface-2) hover:text-(--text)"
          >
            ← {t.library.products.back}
          </Link>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-(--text)">
            {t.library.products.edit}
          </h1>
        </header>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-(--border) border-t-accent" />
          </div>
        )}

        {product && (
          <EditProductForm product={product} types={types} brands={brands} />
        )}
      </main>
    </>
  );
}
