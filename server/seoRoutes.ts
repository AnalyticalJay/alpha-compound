import type { Express } from "express";
import { getProducts } from "./db";

const SITE_ORIGIN = "https://anabolicsafrica.co.za";

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => {
    const entities: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "'": "&apos;",
      '"': "&quot;",
    };
    return entities[character];
  });
}

export function registerSeoRoutes(app: Express) {
  app.get("/robots.txt", (_req, res) => {
    res
      .type("text/plain")
      .setHeader("Cache-Control", "public, max-age=3600")
      .send(`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /account
Disallow: /cart
Disallow: /checkout
Disallow: /orders/
Disallow: /notifications
Disallow: /approval-pending
Disallow: /order-success/
Disallow: /order-cancelled

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`);
  });

  app.get("/sitemap.xml", async (_req, res, next) => {
    try {
      const catalogue = await getProducts({ activeOnly: true });
      const urls = [
        `${SITE_ORIGIN}/`,
        `${SITE_ORIGIN}/products`,
        ...catalogue.map((product) => `${SITE_ORIGIN}/products/${encodeURIComponent(product.slug)}`),
      ];
      const entries = urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`).join("\n");
      res
        .type("application/xml")
        .setHeader("Cache-Control", "public, max-age=3600")
        .send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`);
    } catch (error) {
      next(error);
    }
  });
}
