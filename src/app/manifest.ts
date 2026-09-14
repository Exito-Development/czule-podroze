import type { MetadataRoute } from "next";
import { site } from "@/lib/data/site";
import { defaultDescription } from "@/lib/seo";

/** Manifest — pozwala dodać stronę do ekranu głównego telefonu. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ${site.tagline}`,
    short_name: site.name,
    description: defaultDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#faf6ef",
    theme_color: "#3a342c",
    lang: "pl",
  };
}
