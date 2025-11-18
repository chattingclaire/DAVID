#!/usr/bin/env node

/**
 * Sitemap Generation Script
 * Generates sitemap for all content
 */

const path = require('path');
const SitemapGenerator = require('../src/lib/seo/sitemap-generator');
const { MockContentSource } = require('../src/lib/content/content-source');
const sitemapConfig = require('../config/sitemap-config.json');

async function generateSitemap() {
  console.log('🗺️  Starting sitemap generation...\n');

  try {
    // Initialize content source (use MockContentSource for now)
    const contentSource = new MockContentSource();

    // Initialize sitemap generator
    const generator = new SitemapGenerator({
      ...sitemapConfig,
      contentSource
    });

    // Generate all sitemaps
    const result = await generator.generateAll();

    if (result.success) {
      console.log('\n✅ Sitemap generation completed successfully!\n');
      console.log(`📄 Generated ${result.sitemaps.length} sitemap file(s):`);
      result.sitemaps.forEach(sitemap => {
        console.log(`   - ${sitemap.url}`);
      });
      console.log(`\n📑 Sitemap index: ${result.index}`);
    } else {
      console.error('\n❌ Sitemap generation failed');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateSitemap();
}

module.exports = generateSitemap;
