import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: "website" | "article";
  twitterCard?: "summary" | "summary_large_image";
  canonical?: string;
  structuredData?: Record<string, unknown>;
  noIndex?: boolean;
}

const SITE_NAME = "NeuroDyne Corp";
const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://neurodyne.dev").replace(/\/$/, "");
const DEFAULT_DESCRIPTION =
  "NeuroDyne Corp — Productized Software Engineering by Stanley Asoku Hayford. 36+ shipped projects across fintech, govtech, healthcare, edtech, and AI for Africa and beyond.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export { SITE_URL };

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = "software development, custom software, mobile apps, AI, machine learning, fintech, govtech, healthcare, edtech, Africa, Stanley Hayford",
  ogTitle,
  ogDescription,
  ogImage = DEFAULT_OG_IMAGE,
  ogUrl,
  ogType = "website",
  twitterCard = "summary_large_image",
  canonical,
  structuredData,
  noIndex = false,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const finalOgTitle = ogTitle ?? fullTitle;
  const finalOgDescription = ogDescription ?? description;
  const currentPath = typeof window === "undefined" ? "/" : window.location.pathname;
  const finalCanonical = canonical ?? `${SITE_URL}${currentPath === "/" ? "" : currentPath.replace(/\/$/, "")}`;
  const finalOgUrl = ogUrl ?? finalCanonical;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:url" content={finalOgUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content="@NeuroDyneCorp" />
      <meta name="twitter:title" content={finalOgTitle} />
      <meta name="twitter:description" content={finalOgDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* Canonical */}
      <link rel="canonical" href={finalCanonical} />
      <link rel="alternate" hrefLang="en" href={finalCanonical} />
      <meta name="robots" content={noIndex ? "noindex,nofollow,noarchive" : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"} />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
          logo: `${SITE_URL}/favicon.svg`,
          email: "hello@neurodynecorp.com",
          founder: { "@type": "Person", name: "Stanley Asoku Hayford" },
          areaServed: ["Ghana", "Africa", "Worldwide"],
          sameAs: [],
        }).replace(/</g, "\\u003c")}
      </script>

      {/* Structured Data.
          react-helmet-async injects a <script> child as raw innerHTML on the client (CSR) path with
          NO escaping, and JSON.stringify does not escape < > &. So any CMS/user-authored text in
          structuredData containing "</script>" could break out of the JSON-LD tag and inject live DOM
          (stored XSS). Escape those chars (and the JS line separators) to their \uXXXX forms — still
          valid, machine-readable JSON-LD, but impossible to break out of the script element. */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)
            .replace(/</g, "\\u003c")
            .replace(/>/g, "\\u003e")
            .replace(/&/g, "\\u0026")
            .replace(/\u2028/g, "\\u2028")
            .replace(/\u2029/g, "\\u2029")}
        </script>
      )}
    </Helmet>
  );
}
