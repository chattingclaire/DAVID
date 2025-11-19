#!/usr/bin/env node

/**
 * Test Markdown Parser
 * Shows how the automatic markdown parser works
 */

const MarkdownContentSource = require('../src/lib/content/markdown-content-source');
const MetaTagEngine = require('../src/lib/seo/meta-tag-engine');

async function testParser() {
  console.log('🔍 Testing Markdown Parser\n');
  console.log('='.repeat(60));

  try {
    // Initialize markdown content source
    const contentSource = new MarkdownContentSource({
      contentDir: './content',
      defaultLanguage: 'en',
      defaultAuthor: 'Seasalt.AI Team'
    });

    // Get all published content
    console.log('\n📚 Parsing all markdown files...\n');
    const allContent = await contentSource.getAllPublished();

    console.log(`Found ${allContent.length} published content items:\n`);

    // Display each parsed content
    for (const content of allContent) {
      console.log('─'.repeat(60));
      console.log(`📄 File: ${content.slug}`);
      console.log(`   Language: ${content.language}`);
      console.log(`   Content Type: ${content.contentType}`);
      console.log(`   Title: ${content.title}`);
      console.log(`   Excerpt: ${content.excerpt.substring(0, 80)}...`);
      console.log(`   Author: ${content.author.name}`);
      console.log(`   Category: ${content.category || 'None'}`);
      console.log(`   Tags: ${content.tags.length > 0 ? content.tags.join(', ') : 'None'}`);
      console.log(`   Alternates: ${content.alternateLanguages.length} language(s)`);
      console.log(`   Images: ${content.images.length} image(s)`);
      console.log(`   Status: ${content.status}`);

      // Show auto-generated fields
      console.log('\n   🤖 Auto-generated fields:');
      console.log(`      ID: ${content.id}`);
      console.log(`      Slug: ${content.slug}`);
      console.log(`      Published: ${content.publishedAt.toISOString().split('T')[0]}`);
      console.log(`      Updated: ${content.updatedAt.toISOString().split('T')[0]}`);
    }

    console.log('\n' + '='.repeat(60));

    // Test SEO generation with parsed content
    if (allContent.length > 0) {
      console.log('\n🏷️  Testing SEO Meta Tag Generation\n');
      console.log('─'.repeat(60));

      const metaEngine = new MetaTagEngine({
        baseUrl: 'https://seasalt.ai'
      });

      const firstContent = allContent[0];
      const metaData = metaEngine.generate(firstContent);

      console.log(`\nGenerated SEO for: ${firstContent.title}\n`);
      console.log(`Title: ${metaData.title}`);
      console.log(`Description: ${metaData.description}`);
      console.log(`Canonical: ${metaData.canonical}`);
      console.log(`\nHreflang tags (${metaData.hreflang.length}):`);
      metaData.hreflang.forEach(link => {
        console.log(`  - ${link.lang}: ${link.url}`);
      });
      console.log(`\nOpen Graph:`);
      console.log(`  Type: ${metaData.openGraph.type}`);
      console.log(`  Title: ${metaData.openGraph.title}`);
      console.log(`  Image: ${metaData.openGraph.image}`);
      console.log(`\nStructured Data:`);
      console.log(`  @type: ${metaData.schema['@type']}`);
      console.log(`  headline: ${metaData.schema.headline}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Test completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run test
if (require.main === module) {
  testParser();
}

module.exports = testParser;
