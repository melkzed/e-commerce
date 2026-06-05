import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    lang: siteConfig.language,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#05010f",
    theme_color: "#7c3aed"
  };
}
