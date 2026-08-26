import { useEffect } from "react";
import { useLocation } from "wouter";

const SITE_ORIGIN = "https://anabolicsafrica.co.za";

const PUBLIC_ROUTES: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Anabolics Africa | Controlled-Access Performance Catalogue",
    description: "Explore Anabolics Africa's controlled-access HD Labs and BP Pharma catalogue for approved members in South Africa.",
  },
  "/products": {
    title: "Performance Product Catalogue | Anabolics Africa",
    description: "Browse the controlled-access Anabolics Africa product catalogue. Approved members can build a quote for review and secure payment.",
  },
};

function setMeta(name: string, content: string) {
  let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement("meta");
    element.name = name;
    document.head.appendChild(element);
  }
  element.content = content;
}

export function SeoMeta() {
  const [location] = useLocation();

  useEffect(() => {
    const isProduct = location.startsWith("/products/");
    const metadata = PUBLIC_ROUTES[location] ?? (isProduct
      ? {
          title: "Product Details | Anabolics Africa",
          description: "View product details in the controlled-access Anabolics Africa catalogue.",
        }
      : null);
    const isIndexable = Boolean(metadata);

    if (!isProduct) {
      document.title = metadata?.title ?? "Anabolics Africa";
      setMeta("description", metadata?.description ?? "Member account and administration area for Anabolics Africa.");
    }
    setMeta("robots", isIndexable ? "index,follow" : "noindex,nofollow");

    if (!isProduct) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = `${SITE_ORIGIN}${location === "/" ? "/" : location}`;
    }
  }, [location]);

  return null;
}
