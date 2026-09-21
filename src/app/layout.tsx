import type { Metadata } from "next";
import { fraunces, dancing, figtree, caprasimo } from "./fonts";
import { site } from "@/lib/data/site";
import { siteUrl, defaultDescription, defaultKeywords } from "@/lib/seo";
import { organizationSchema, websiteSchema } from "@/lib/schema";
import JsonLd from "@/components/seo/JsonLd";
import AppProviders from "@/components/providers/AppProviders";
import Header from "@/components/layout/Header";
import "./globals.css";

export const metadata: Metadata = {
  // Bez `metadataBase` Next nie umie zbudować żadnego adresu absolutnego —
  // canonical i og:image wychodzą wtedy jako ścieżki względne, których roboty
  // indeksujące i serwisy społecznościowe nie potrafią rozwinąć.
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} — wyjazdy psychologiczno-seksuologiczne dla kobiet`,
    template: `%s · ${site.name}`,
  },
  description: defaultDescription,
  keywords: defaultKeywords,
  // Adres kanoniczny ucina duplikaty: ten sam ekran pod /, /?utm_source=...
  // i /index to dla Google trzy strony, dopóki nie wskażemy jednej właściwej.
  alternates: { canonical: "/" },
  openGraph: {
    title: `${site.name} — wyjazdy psychologiczno-seksuologiczne dla kobiet`,
    description: defaultDescription,
    url: "/",
    siteName: site.name,
    type: "website",
    locale: "pl_PL",
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Bez tego Google sam przycina opis i miniaturę w wyniku wyszukiwania.
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
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
      className={`${fraunces.variable} ${dancing.variable} ${figtree.variable} ${caprasimo.variable}`}
    >
      <body>
        {/* Dane o marce dołączamy raz, w korzeniu — dotyczą całej witryny. */}
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        <AppProviders>
          <Header />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
