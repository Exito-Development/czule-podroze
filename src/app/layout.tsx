import type { Metadata } from "next";
import { fraunces, dancing, inter, caprasimo } from "./fonts";
import { site } from "@/lib/data/site";
import AppProviders from "@/components/providers/AppProviders";
import Header from "@/components/layout/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description:
    "Kameralne wyjazdy psychologiczno-seksuologiczne z warsztatami, ruchem i czasem dla siebie — w najpiękniejszych miejscach świata.",
  openGraph: {
    title: site.name,
    description: site.tagline,
    type: "website",
    locale: "pl_PL",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pl"
      className={`${fraunces.variable} ${dancing.variable} ${inter.variable} ${caprasimo.variable}`}
    >
      <body>
        <AppProviders>
          <Header />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
