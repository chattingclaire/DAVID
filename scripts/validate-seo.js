#!/usr/bin/env node

/**
 * SEO Validation Script
 * Validates SEO implementation across content
 */

const MetaTagEngine = require('../src/lib/seo/meta-tag-engine');
const LanguageMapper = require('../src/lib/seo/language-mapper');
const { MockContentSource } = require('../src/lib/content/content-source');

async function validateSEO() {
  console.log('🔍 Starting SEO validation...\n');

  const errors = [];
  const warnings = [];

  try {
    // Initialize components
    const contentSource = new MockContentSource();
    const languageMapper = new LanguageMapper();
    const metaEngine = new MetaTagEngine({
      baseUrl: 'https://seasalt.ai',
      languageMapper
    });

    // Get all content
    const allContent = await contentSource.getAllPublished();
    console.log(`📄 Validating ${allContent.length} content items...\n`);

    for (const content of allContent) {
      console.log(`Checking: ${content.slug} (${content.language})`);

      // Generate meta data
      const metaData = metaEngine.generate(content);

      // Validate title
      if (!metaData.title) {
        errors.push(`${content.slug}: Missing title`);
      } else if (metaData.title.length > 60) {
        warnings.push(`${content.slug}: Title too long (${metaData.title.length} chars)`);
      }

      // Validate description
      if (!metaData.description) {
        errors.push(`${content.slug}: Missing description`);
      } else if (metaData.description.length > 160) {
        warnings.push(`${content.slug}: Description too long (${metaData.description.length} chars)`);
      }

      // Validate canonical URL
      if (!metaData.canonical) {
        errors.push(`${content.slug}: Missing canonical URL`);
      }

      // Validate hreflang
      if (!metaData.hreflang || metaData.hreflang.length === 0) {
        warnings.push(`${content.slug}: No hreflang tags`);
      }

      // Validate Open Graph
      if (!metaData.openGraph.title) {
        warnings.push(`${content.slug}: Missing OG title`);
      }
      if (!metaData.openGraph.image) {
        warnings.push(`${content.slug}: Missing OG image`);
      }

      // Validate Schema
      if (!metaData.schema) {
        warnings.push(`${content.slug}: Missing structured data`);
      }
    }

    // Print results
    console.log('\n📊 Validation Results:\n');

    if (errors.length === 0 && warnings.length === 0) {
      console.log('✅ All SEO checks passed!');
    } else {
      if (errors.length > 0) {
        console.log(`❌ Errors (${errors.length}):`);
        errors.forEach(error => console.log(`   - ${error}`));
        console.log('');
      }

      if (warnings.length > 0) {
        console.log(`⚠️  Warnings (${warnings.length}):`);
        warnings.forEach(warning => console.log(`   - ${warning}`));
      }
    }

    // Exit with error if there are errors
    if (errors.length > 0) {
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Validation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  validateSEO();
}

module.exports = validateSEO;
