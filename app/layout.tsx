import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-loaded",
  display: "swap",
  weight: ["400", "500"],
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans-loaded",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Raagul R. — Lead Designer, Salesforce",
  description:
    "Lead designer working on AI agent interactions, behavioral primitives, and design systems.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Raagul R.",
    description:
      "Lead designer working on AI agent interactions, behavioral primitives, and design systems.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#F2F0EA",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${mono.variable} ${sans.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-[var(--bg)] focus:text-[var(--fg)] focus:p-2"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
