import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { cookies } from "next/headers";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/client";
import { getLocale, getMessages } from "@/lib/i18n/server";
import { accentVars } from "@/lib/theme";
import {
  ACCENT_COOKIE,
  THEME_COOKIE,
  parseAccentCookie,
  parseThemeCookie,
} from "@/lib/appearance";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Continuity",
  description: "Osobní tracker pleti a doplňků",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Continuity",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  const cookieStore = await cookies();
  const theme = parseThemeCookie(cookieStore.get(THEME_COOKIE)?.value);
  const accent = parseAccentCookie(cookieStore.get(ACCENT_COOKIE)?.value);

  const vars = accentVars(accent, theme);
  const bodyStyle = {
    ["--background" as string]: vars.background,
    ["--accent" as string]: vars.accent,
    ["--accent-soft" as string]: vars.accentSoft,
  } as React.CSSProperties;

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased ${theme === "dark" ? "dark" : ""}`}
    >
      <body
        className="flex min-h-full flex-col safe-bottom"
        style={bodyStyle}
        suppressHydrationWarning
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js')`,
          }}
        />
        <I18nProvider locale={locale} messages={messages}>
          {children}
          <Toaster
            position="top-center"
            closeButton
            richColors
            theme={theme}
            toastOptions={{ duration: 6000 }}
          />
        </I18nProvider>
      </body>
    </html>
  );
}
