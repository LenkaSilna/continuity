import { Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { loadAppearance, applyAppearance } from "@/lib/appearance";

export function RootLayout() {
  useEffect(() => {
    // Sync CSS vars from storage on mount (catches any delta vs. inline script)
    const { theme, accent } = loadAppearance();
    applyAppearance({ theme, accent });
  }, []);

  return <Outlet />;
}
