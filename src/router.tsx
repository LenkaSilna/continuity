import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { supabase } from "@/lib/supabase/browser";
import { RootLayout } from "./pages/RootLayout";
import { LoginPage } from "./pages/LoginPage";
import { AuthCallback } from "./pages/AuthCallback";
import { DashboardPage } from "./pages/DashboardPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";
import { RoutinePage } from "./pages/RoutinePage";
import { CalendarPage } from "./pages/CalendarPage";
import { CalendarDayPage } from "./pages/CalendarDayPage";
import { AiPage } from "./pages/AiPage";
import { AiTypePage } from "./pages/AiTypePage";
import { AiCustomNewPage } from "./pages/AiCustomNewPage";
import { AiCustomDetailPage } from "./pages/AiCustomDetailPage";
import { AiCustomEditPage } from "./pages/AiCustomEditPage";
import { HabitsPage as LibraryHabitsPage } from "./pages/library/HabitsPage";
import { HabitDetailPage as LibraryHabitDetailPage } from "./pages/library/HabitDetailPage";
import { ObservationsPage as LibraryObservationsPage } from "./pages/library/ObservationsPage";
import { ObservationDetailPage as LibraryObservationDetailPage } from "./pages/library/ObservationDetailPage";
import { ProductsPage as LibraryProductsPage } from "./pages/library/ProductsPage";
import { ProductDetailPage as LibraryProductDetailPage } from "./pages/library/ProductDetailPage";
import { SupplementsPage as LibrarySupplementsPage } from "./pages/library/SupplementsPage";
import { SupplementDetailPage as LibrarySupplementDetailPage } from "./pages/library/SupplementDetailPage";

// ─── Root ─────────────────────────────────────────────────────────

const rootRoute = createRootRoute({ component: RootLayout });

// ─── Public routes ────────────────────────────────────────────────

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: (search: Record<string, unknown>) => ({
    error: search.error as string | undefined,
  }),
  component: LoginPage,
});

const authCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/callback",
  component: AuthCallback,
});

// ─── Protected layout route (auth guard) ─────────────────────────

const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_protected",
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/" });
  },
  component: () => <Outlet />,
});

// ─── Protected pages ──────────────────────────────────────────────

const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const profileRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/profile",
  component: ProfilePage,
});

const settingsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/settings",
  component: SettingsPage,
});

const routineRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/routine",
  component: RoutinePage,
});

const calendarRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/calendar",
  validateSearch: (search: Record<string, unknown>) => ({
    view: search.view as string | undefined,
    date: search.date as string | undefined,
  }),
  component: CalendarPage,
});

const calendarDayRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/calendar/$date",
  component: CalendarDayPage,
});

const aiRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/ai",
  component: AiPage,
});

const aiCustomNewRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/ai/custom/new",
  component: AiCustomNewPage,
});

const aiCustomDetailRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/ai/custom/$id",
  component: AiCustomDetailPage,
});

const aiCustomEditRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/ai/custom/$id/edit",
  component: AiCustomEditPage,
});

const aiTypeRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/ai/$type",
  component: AiTypePage,
});

const libraryHabitsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/library/habits",
  component: LibraryHabitsPage,
});

const libraryHabitDetailRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/library/habits/$id",
  component: LibraryHabitDetailPage,
});

const libraryObservationsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/library/observations",
  component: LibraryObservationsPage,
});

const libraryObservationDetailRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/library/observations/$id",
  component: LibraryObservationDetailPage,
});

const libraryProductsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/library/products",
  component: LibraryProductsPage,
});

const libraryProductDetailRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/library/products/$id",
  component: LibraryProductDetailPage,
});

const librarySupplementsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/library/supplements",
  component: LibrarySupplementsPage,
});

const librarySupplementDetailRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/library/supplements/$id",
  component: LibrarySupplementDetailPage,
});

// ─── Route tree ───────────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  indexRoute,
  authCallbackRoute,
  protectedRoute.addChildren([
    dashboardRoute,
    profileRoute,
    settingsRoute,
    routineRoute,
    calendarRoute,
    calendarDayRoute,
    aiRoute,
    aiCustomNewRoute,
    aiCustomDetailRoute,
    aiCustomEditRoute,
    aiTypeRoute,
    libraryHabitsRoute,
    libraryHabitDetailRoute,
    libraryObservationsRoute,
    libraryObservationDetailRoute,
    libraryProductsRoute,
    libraryProductDetailRoute,
    librarySupplementsRoute,
    librarySupplementDetailRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
