import { SITE } from '@constants/site'

export interface SEOProps {
  title: string
  description: string
  path?: string
  ogImage?: string
  noindex?: boolean
  schema?: Record<string, unknown> | Array<Record<string, unknown>>
}

/**
 * Reusable SEO component utilizing React 19 native document metadata hoisting.
 * Automatically injects title, description, canonical link, Open Graph,
 * Twitter Card, and optional Schema.org JSON-LD into the document <head>.
 */
export default function SEO({
  title,
  description,
  path = '',
  ogImage,
  noindex = false,
  schema,
}: SEOProps) {
  const baseUrl = SITE.url.replace(/\/$/, '')
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : ''
  const canonicalUrl = `${baseUrl}${cleanPath}`
  const image = ogImage
    ? (ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage.startsWith('/') ? ogImage : `/${ogImage}`}`)
    : `${baseUrl}/images/about-setting-overview.jpeg`

  return (
    <>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Crawl Control */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="en_GB" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Optional Structured Data (JSON-LD) */}
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
    </>
  )
}
