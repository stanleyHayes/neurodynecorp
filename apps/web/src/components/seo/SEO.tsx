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
}

const SITE_NAME = "NeuroDyne Corp";
const SITE_URL = "https://neurodynecorp.com";
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
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const finalOgTitle = ogTitle ?? fullTitle;
  const finalOgDescription = ogDescription ?? description;

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
      {ogUrl && <meta property="og:url" content={ogUrl} />}

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content="@NeuroDyneCorp" />
      <meta name="twitter:title" content={finalOgTitle} />
      <meta name="twitter:description" content={finalOgDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* Canonical */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
