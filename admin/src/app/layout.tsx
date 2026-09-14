import type { Metadata } from "next";
import { fraunces, inter } from "./fonts";
import AuthProvider from "@/components/providers/AuthProvider";
import Shell from "@/components/layout/Shell";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Panel — Czuła Podróż",
    template: "%s · Panel Czułej Podróży",
  },
  // Panel nie ma czego szukać w wyszukiwarkach.
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <AuthProvider>
          <Shell>{children}</Shell>
        </AuthProvider>
      </body>
    </html>
  );
}
