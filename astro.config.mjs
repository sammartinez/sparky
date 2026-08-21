import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages project sites live at https://<user>.github.io/<repo>/.
// Set these two to match your repo before the first deploy — RSS links,
// canonical URLs, and the sitemap all depend on them.
const SITE = process.env.SITE ?? "https://sammartinez.github.io";
const BASE = process.env.BASE ?? "/sparky";

export default defineConfig({
  output: "static",
  site: SITE,
  base: BASE,
  trailingSlash: "ignore",
  // Astro 7 defaults compressHTML to 'jsx', which strips whitespace between
  // inline elements. Every gap in this design comes from a Tailwind gap-*
  // utility rather than markup whitespace, so the default is safe here. Set
  // this to `true` if you ever add prose that relies on inter-element spaces.
  // compressHTML: true,
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  // Static by default. Nothing here needs per-request data — the whole site is
  // rebuilt each morning after the digest lands, so there is no adapter.
});
