import "./fonts.css";
import "@/app/globals.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { I18nProvider } from "@/lib/i18n/client";
import { router } from "./router";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <RouterProvider router={router} />
        <Toaster position="top-center" richColors toastOptions={{ duration: 3000 }} />
      </I18nProvider>
    </QueryClientProvider>
  </StrictMode>,
);
