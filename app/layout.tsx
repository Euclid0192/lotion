import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lotion",
  description: "Notion with my own desired add-on features",
  icons: {
    // TODO: Test light/dark mode icons later
    // icon: [
    //   {
    //     media: "(prefers-color-scheme: light)",
    //     url: "/lotion-logo-light.ico",
    //     href: "/lotion-logo-light.ico",
    //   },
    //   {
    //     media: "(prefers-color-scheme: dark)",
    //     url: "/lotion-logo-dark.ico",
    //     href: "/lotion-logo-dark.ico",
    //   }
    // ],
    icon: "/lotion-logo-light.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConvexClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="lotion-theme"
          >
            <Toaster position="bottom-center" />
            {children}
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
