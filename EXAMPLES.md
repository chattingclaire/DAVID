# Usage Examples

This document provides detailed examples of how to use the Seasalt.AI SEO Automation System.

## Table of Contents

- [Language Mapping](#language-mapping)
- [Meta Tag Generation](#meta-tag-generation)
- [Sitemap Generation](#sitemap-generation)
- [Markdown Rendering](#markdown-rendering)
- [Full Integration Example](#full-integration-example)

---

## Language Mapping

### Basic Usage

```javascript
const LanguageMapper = require('./src/lib/seo/language-mapper');

const mapper = new LanguageMapper();

// Get hreflang for different languages
console.log(mapper.getHreflang('en'));    // "en"
console.log(mapper.getHreflang('zh'));    // "zh-CN"
console.log(mapper.getHreflang('zh-tw')); // "zh-TW"
console.log(mapper.getHreflang('ja'));    // "ja-JP"

// Get Open Graph locale
console.log(mapper.getOGLocale('zh'));    // "zh_CN"
console.log(mapper.getOGLocale('ja'));    // "ja_JP"

// Get display names
console.log(mapper.getDisplayName('zh'));        // "Chinese (Simplified)"
console.log(mapper.getDisplayName('zh', true));  // "简体中文"
console.log(mapper.getDisplayName('ja', true));  // "日本語"
```

### Working with Language Lists

```javascript
const mapper = new LanguageMapper();

// Get all enabled languages
const languages = mapper.getAllEnabled();

// Create language selector for UI
const languageOptions = languages.map(lang => ({
  code: lang.iso6391,
  name: lang.name,
  nativeName: lang.nativeName,
  flag: `flag-${lang.region?.toLowerCase() || lang.iso6391}`
}));

console.log(languageOptions);
// [
//   { code: 'en', name: 'English', nativeName: 'English', flag: 'flag-us' },
//   { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: 'flag-cn' },
//   ...
// ]
```

### RTL Language Detection

```javascript
const mapper = new LanguageMapper();

function getTextDirection(languageCode) {
  return mapper.isRTL(languageCode) ? 'rtl' : 'ltr';
}

console.log(getTextDirection('ar'));  // "rtl"
console.log(getTextDirection('en'));  // "ltr"
console.log(getTextDirection('zh'));  // "ltr"

// Use in HTML
const direction = getTextDirection(currentLanguage);
document.documentElement.setAttribute('dir', direction);
```

---

## Meta Tag Generation

### Blog Post Example

```javascript
const MetaTagEngine = require('./src/lib/seo/meta-tag-engine');

const engine = new MetaTagEngine({
  baseUrl: 'https://seasalt.ai'
});

const blogPost = {
  id: '123',
  slug: 'blog/ai-trends-2025',
  language: 'en',
  contentType: 'blog',
  title: 'Top AI Trends to Watch in 2025',
  excerpt: 'Discover the most important artificial intelligence trends that will shape the technology landscape in 2025.',
  body: '# Top AI Trends...',
  category: 'Technology',
  author: {
    name: 'Jane Smith'
  },
  featuredImage: 'https://seasalt.ai/images/ai-trends-2025.jpg',
  publishedAt: new Date('2025-01-15'),
  updatedAt: new Date('2025-01-16'),
  status: 'published',
  alternateLanguages: [
    { language: 'zh', slug: 'blog/ai-trends-2025' },
    { language: 'ja', slug: 'blog/ai-trends-2025' }
  ]
};

const metaData = engine.generate(blogPost);

console.log(metaData);
// {
//   title: "Top AI Trends to Watch in 2025 | Seasalt.AI Blog",
//   description: "Discover the most important artificial intelligence trends that will shape the technology landscape in 2025. - Technology",
//   canonical: "https://seasalt.ai/blog/ai-trends-2025",
//   hreflang: [
//     { lang: "en", url: "https://seasalt.ai/blog/ai-trends-2025" },
//     { lang: "zh-CN", url: "https://seasalt.ai/zh/blog/ai-trends-2025" },
//     { lang: "ja-JP", url: "https://seasalt.ai/ja/blog/ai-trends-2025" },
//     { lang: "x-default", url: "https://seasalt.ai/blog/ai-trends-2025" }
//   ],
//   openGraph: { ... },
//   twitter: { ... },
//   schema: { "@type": "BlogPosting", ... },
//   robots: "index, follow"
// }
```

### Product Page Example

```javascript
const productPage = {
  id: '456',
  slug: 'products/chatbot-platform',
  language: 'en',
  contentType: 'product',
  title: 'Seasalt Chatbot Platform',
  excerpt: 'Build intelligent conversational AI chatbots with our powerful platform.',
  body: '# Seasalt Chatbot Platform...',
  featuredImage: 'https://seasalt.ai/images/chatbot.jpg',
  publishedAt: new Date('2024-12-01'),
  updatedAt: new Date('2025-01-10'),
  status: 'published',
  pricing: {
    amount: '99',
    currency: 'USD'
  },
  alternateLanguages: [
    { language: 'zh', slug: 'products/chatbot-platform' }
  ]
};

const metaData = engine.generate(productPage);

console.log(metaData.schema);
// {
//   "@context": "https://schema.org",
//   "@type": "Product",
//   "name": "Seasalt Chatbot Platform",
//   "description": "Build intelligent conversational AI chatbots...",
//   "image": "https://seasalt.ai/images/chatbot.jpg",
//   "brand": {
//     "@type": "Brand",
//     "name": "Seasalt.AI"
//   },
//   "offers": {
//     "@type": "Offer",
//     "price": "99",
//     "priceCurrency": "USD"
//   }
// }
```

### Multilingual Content

```javascript
// Chinese version of blog post
const chinesePost = {
  id: '123-zh',
  slug: 'blog/ai-trends-2025',
  language: 'zh',
  contentType: 'blog',
  title: '2025年值得关注的AI趋势',
  excerpt: '探索2025年将塑造技术格局的最重要的人工智能趋势。',
  body: '# 2025年值得关注的AI趋势...',
  category: '技术',
  author: {
    name: 'Jane Smith'
  },
  featuredImage: 'https://seasalt.ai/images/ai-trends-2025.jpg',
  publishedAt: new Date('2025-01-15'),
  updatedAt: new Date('2025-01-16'),
  status: 'published',
  alternateLanguages: [
    { language: 'en', slug: 'blog/ai-trends-2025' },
    { language: 'ja', slug: 'blog/ai-trends-2025' }
  ]
};

const chineseMetaData = engine.generate(chinesePost);

console.log(chineseMetaData.title);
// "2025年值得关注的AI趋势 | Seasalt.AI 博客"

console.log(chineseMetaData.canonical);
// "https://seasalt.ai/zh/blog/ai-trends-2025"
```

---

## Sitemap Generation

### Basic Sitemap Generation

```javascript
const SitemapGenerator = require('./src/lib/seo/sitemap-generator');
const { MockContentSource } = require('./src/lib/content/content-source');

async function generateSitemap() {
  const contentSource = new MockContentSource();

  const generator = new SitemapGenerator({
    baseUrl: 'https://seasalt.ai',
    outputDir: './public',
    contentSource,
    maxUrlsPerSitemap: 50000
  });

  const result = await generator.generateAll();

  console.log(`Generated ${result.sitemaps.length} sitemaps`);
  console.log(`Index file: ${result.index}`);
}

generateSitemap();
```

### Custom Content Source

```javascript
const { ContentSource } = require('./src/lib/content/content-source');

class DatabaseContentSource extends ContentSource {
  constructor(dbConnection) {
    super();
    this.db = dbConnection;
  }

  async getAllPublished() {
    // Fetch from database
    const results = await this.db.query(`
      SELECT * FROM content
      WHERE status = 'published'
      ORDER BY published_at DESC
    `);

    return results.map(row => ({
      id: row.id,
      slug: row.slug,
      language: row.language,
      contentType: row.content_type,
      title: row.title,
      excerpt: row.excerpt,
      publishedAt: row.published_at,
      updatedAt: row.updated_at,
      status: row.status,
      alternateLanguages: JSON.parse(row.alternate_languages || '[]'),
      images: JSON.parse(row.images || '[]')
    }));
  }

  async getBySlug(slug, language) {
    const result = await this.db.query(
      'SELECT * FROM content WHERE slug = ? AND language = ?',
      [slug, language]
    );
    return result[0] || null;
  }

  async getById(id) {
    const result = await this.db.query(
      'SELECT * FROM content WHERE id = ?',
      [id]
    );
    return result[0] || null;
  }
}

// Usage
const dbSource = new DatabaseContentSource(myDbConnection);
const generator = new SitemapGenerator({
  baseUrl: 'https://seasalt.ai',
  outputDir: './public',
  contentSource: dbSource
});
```

### Monitoring Sitemap Generation

```javascript
const { MonitoredSitemapGenerator } = require('./src/lib/seo/sitemap-generator');

const generator = new MonitoredSitemapGenerator({
  baseUrl: 'https://seasalt.ai',
  outputDir: './public',
  contentSource
});

// Metrics will be logged automatically
const result = await generator.generateAll();
// [Metric] sitemap.generation.success: 1
// [Metric] sitemap.generation.duration: 3247
// [Metric] sitemap.files.count: 12
```

---

## Markdown Rendering

### Basic Markdown

```jsx
import MarkdownRenderer from './src/components/markdown/MarkdownRenderer';

const markdown = `
# Welcome to Our Blog

This is a paragraph with **bold text** and *italic text*.

## Features

- Easy to use
- Fast rendering
- Security built-in

\`\`\`javascript
console.log('Hello, World!');
\`\`\`

[Visit our website](https://seasalt.ai)
`;

function BlogPost() {
  return (
    <article>
      <MarkdownRenderer content={markdown} />
    </article>
  );
}
```

### With Custom Styling

```jsx
import MarkdownRenderer from './src/components/markdown/MarkdownRenderer';

function StyledBlogPost({ content }) {
  return (
    <div className="container mx-auto px-4">
      <MarkdownRenderer
        content={content}
        className="blog-content dark-theme"
      />
    </div>
  );
}
```

### Custom Components

```jsx
import MarkdownRenderer from './src/components/markdown/MarkdownRenderer';

// Custom Video component
function Video({ src, title }) {
  return (
    <div className="video-container">
      <iframe
        src={src}
        title={title}
        width="100%"
        height="400"
        frameBorder="0"
        allowFullScreen
      />
    </div>
  );
}

// Custom Chart component
function Chart({ data, type }) {
  return (
    <div className="chart">
      {/* Chart rendering logic */}
      <p>Chart: {type}</p>
    </div>
  );
}

// Use in Markdown
const content = `
# Data Visualization

<Video src="https://youtube.com/embed/xxx" title="Tutorial" />

<Chart data="..." type="bar" />
`;

function DocsPage() {
  return (
    <MarkdownRenderer
      content={content}
      components={{
        Video,
        Chart
      }}
    />
  );
}
```

---

## Full Integration Example

### Next.js Blog Application

```javascript
// pages/blog/[slug].js
import { GetStaticProps, GetStaticPaths } from 'next';
import SEOHead from '../../src/components/SEOHead';
import MarkdownRenderer from '../../src/components/markdown/MarkdownRenderer';
import MetaTagEngine from '../../src/lib/seo/meta-tag-engine';
import { getAllPosts, getPostBySlug } from '../../lib/api';

export default function BlogPost({ post, metaData }) {
  return (
    <>
      <SEOHead metaData={metaData} />

      <article className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
          <p className="text-gray-600">
            By {post.author.name} • {post.publishedAt}
          </p>
        </header>

        <MarkdownRenderer content={post.body} />

        <footer className="mt-8 pt-8 border-t">
          <p className="text-sm text-gray-600">
            Category: {post.category}
          </p>
        </footer>
      </article>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const post = await getPostBySlug(params.slug, 'en');

  const metaEngine = new MetaTagEngine({
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL
  });

  const metaData = metaEngine.generate(post);

  return {
    props: {
      post,
      metaData
    },
    revalidate: 3600 // Revalidate every hour
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getAllPosts();

  const paths = posts.map(post => ({
    params: { slug: post.slug }
  }));

  return {
    paths,
    fallback: 'blocking'
  };
};
```

### Automated Build Script

```javascript
// scripts/build.js
const SitemapGenerator = require('../src/lib/seo/sitemap-generator');
const { DatabaseContentSource } = require('../lib/content-source');

async function build() {
  console.log('🏗️  Starting build process...\n');

  // 1. Connect to database
  const db = await connectToDatabase();
  const contentSource = new DatabaseContentSource(db);

  // 2. Generate sitemap
  console.log('📄 Generating sitemap...');
  const sitemapGenerator = new SitemapGenerator({
    baseUrl: process.env.BASE_URL,
    outputDir: './public',
    contentSource
  });

  const sitemapResult = await sitemapGenerator.generateAll();
  console.log(`✅ Generated ${sitemapResult.sitemaps.length} sitemaps\n`);

  // 3. Validate SEO
  console.log('🔍 Validating SEO...');
  await require('./validate-seo')();

  // 4. Build static site
  console.log('\n🚀 Building static site...');
  await execPromise('next build');

  console.log('\n✅ Build complete!');
}

build().catch(error => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});
```

### Language Selector Component

```jsx
// components/LanguageSelector.jsx
import { useRouter } from 'next/router';
import LanguageMapper from '../src/lib/seo/language-mapper';

export default function LanguageSelector() {
  const router = useRouter();
  const mapper = new LanguageMapper();
  const languages = mapper.getAllEnabled();

  const handleLanguageChange = (newLang) => {
    const { pathname, query } = router;

    // Update URL with new language
    const newPath = pathname.replace(/^\/[a-z]{2}\//, `/${newLang}/`);
    router.push(newPath, undefined, { locale: newLang });
  };

  return (
    <div className="language-selector">
      <select
        value={router.locale}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="px-4 py-2 border rounded"
      >
        {languages.map(lang => (
          <option key={lang.iso6391} value={lang.iso6391}>
            {lang.nativeName}
          </option>
        ))}
      </select>
    </div>
  );
}
```

---

## Advanced Examples

### Dynamic Sitemap with Caching

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

class CachedSitemapGenerator extends SitemapGenerator {
  async getAllPublished() {
    const cacheKey = 'all_published_content';

    // Check cache first
    let content = cache.get(cacheKey);

    if (!content) {
      content = await super.getAllPublished();
      cache.set(cacheKey, content);
    }

    return content;
  }
}
```

### Incremental Sitemap Updates

```javascript
async function incrementalSitemapUpdate(changedContent) {
  const generator = new SitemapGenerator(config);

  // Only regenerate sitemaps for affected languages
  const affectedLanguages = [...new Set(
    changedContent.map(item => item.language)
  )];

  for (const lang of affectedLanguages) {
    const langContent = changedContent.filter(
      item => item.language === lang
    );

    await generator.generateForLanguage(lang, langContent);
  }

  // Regenerate index
  await generator.generateIndex(getAllSitemapFiles());
}
```

---

For more examples and use cases, please refer to the test files in the `tests/` directory.
