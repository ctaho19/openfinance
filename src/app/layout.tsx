import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-primary" });

export const metadata: Metadata = {
  title: "OpenFinance - Personal Finance Tracker",
  description:
    "Track your bi-weekly budget, crush your debt, and follow the Financial Order of Operations",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/icon.svg",
  },
  openGraph: {
    title: "OpenFinance",
    description: "Track your bi-weekly budget, crush your debt, and follow the Financial Order of Operations",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} dark accent-chase`} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
