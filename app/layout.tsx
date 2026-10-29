import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const golos = localFont({
  src: [
    { path: "./fonts/golos-text-cyrillic-2.woff2", weight: "400 600" },
    { path: "./fonts/golos-text-latin-3.woff2", weight: "400 600" },
  ],
  variable: "--font-golos",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Автоматизация Бизнеса",
  description: "Ответьте на вопросы, чтобы узнать, как увеличить прибыль и уменьшить рутину.",
  icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/favicon.svg` },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={golos.variable}>
      <body className="min-h-screen bg-bg font-sans text-[17px] leading-relaxed text-ink">{children}</body>
    </html>
  );
}
