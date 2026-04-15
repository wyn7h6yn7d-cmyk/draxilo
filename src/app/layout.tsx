import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/toast/toast-provider";
import { getLocale } from "@/lib/i18n/locale";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteDescription =
  "AI-powered B2B lead generation, enrichment, and outreach—find accounts, draft messages, run campaigns.";

export const metadata: Metadata = {
  metadataBase: new URL("https://draxion.eu"),
  title: {
    default: "Draxion",
    template: "%s · Draxion",
  },
  description: siteDescription,
  applicationName: "Draxion",
  openGraph: {
    type: "website",
    siteName: "Draxion",
    title: "Draxion",
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "Draxion",
    description: siteDescription,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
