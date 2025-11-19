/**
 * SEOHead Component
 * Renders SEO meta tags for pages
 */

import React from 'react';
import Head from 'next/head';

/**
 * SEO Head Component
 * @param {Object} props
 * @param {Object} props.metaData - Meta data object from MetaTagEngine
 */
export default function SEOHead({ metaData }) {
  const {
    title,
    description,
    canonical,
    hreflang,
    openGraph,
    twitter,
    schema,
    robots
  } = metaData;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />

      {/* Viewport */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* Hreflang Tags */}
      {hreflang && hreflang.map((link) => (
        <link
          key={link.lang}
          rel="alternate"
          hrefLang={link.lang}
          href={link.url}
        />
      ))}

      {/* Open Graph */}
      {openGraph && (
        <>
          <meta property="og:type" content={openGraph.type} />
          <meta property="og:title" content={openGraph.title} />
          <meta property="og:description" content={openGraph.description} />
          <meta property="og:image" content={openGraph.image} />
          <meta property="og:url" content={openGraph.url} />
          <meta property="og:locale" content={openGraph.locale} />
          <meta property="og:site_name" content="Seasalt.AI" />
          {openGraph.alternateLocales && openGraph.alternateLocales.map((locale) => (
            <meta
              key={locale}
              property="og:locale:alternate"
              content={locale}
            />
          ))}
        </>
      )}

      {/* Twitter Card */}
      {twitter && (
        <>
          <meta name="twitter:card" content={twitter.card} />
          <meta name="twitter:title" content={twitter.title} />
          <meta name="twitter:description" content={twitter.description} />
          <meta name="twitter:image" content={twitter.image} />
        </>
      )}

      {/* Schema.org JSON-LD */}
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
}
