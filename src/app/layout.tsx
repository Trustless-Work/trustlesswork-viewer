import type { Metadata } from "next";
import { Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { NetworkProvider } from "@/contexts/NetworkContext";
import { IconProvider } from "@/components/providers/icon-provider";
import { AppShellSkeleton } from "@/components/shared/app-shell-skeleton";
import { Toaster } from "@/components/ui/sonner";

// Work around Node.js experimental localStorage mismatch in dev server
// (prevents Next dev overlay from crashing when localStorage is non-standard)
if (typeof window === "undefined") {
  const storage = (globalThis as { localStorage?: unknown }).localStorage;
  if (!storage || typeof (storage as Storage).getItem !== "function") {
    (globalThis as { localStorage?: Storage }).localStorage = {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
      clear: () => undefined,
      key: () => null,
      get length() {
        return 0;
      },
    } as Storage;
  }
}

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://localhost:3000"),
  title: "Escrow Viewer",
  description:
    "View detailed information about escrow contracts on the Stellar blockchain.",
};

const customBodyProps =
  process.env.NODE_ENV === "development"
    ? { suppressHydrationWarning: true }
    : {};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${geistMono.variable} font-sans antialiased`}
        {...customBodyProps}
      >
        <Suspense fallback={<AppShellSkeleton />}>
          <NetworkProvider>
            <IconProvider>
              <div className="flex min-h-screen flex-col bg-background">
                <div className="flex-1">{children}</div>
              </div>
              <Toaster closeButton={false} />
            </IconProvider>
          </NetworkProvider>
        </Suspense>
      </body>
    </html>
  );
}
