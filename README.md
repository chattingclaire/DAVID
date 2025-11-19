# Seasalt.AI SEO Automation System

A comprehensive, production-ready SEO automation system supporting 100+ languages with automated sitemap generation, meta tag management, and multilingual content rendering.

## 🌟 Features

- **Automated Sitemap Generation**: Generates and maintains XML sitemaps for all languages
- **Meta Tag Template Engine**: Consistent, SEO-optimized meta tags across all content
- **Language Mapping System**: Support for 100+ languages with proper hreflang implementation
- **Unified Markdown Renderer**: Component-based markdown rendering with React
- **Multilingual SEO**: Full support for international SEO best practices
- **Schema.org Integration**: Automatic structured data generation
- **Performance Optimized**: Built for scale with caching and incremental builds

## 📦 Installation

```bash
npm install
```

## 🚀 Quick Start

### 1. Generate Sitemap

```bash
npm run generate:sitemap
```

### 2. Validate SEO

```bash
npm run validate:seo
```

### 3. Use in Your Application

```javascript
// Generate meta tags
const MetaTagEngine = require('./src/lib/seo/meta-tag-engine');
const engine = new MetaTagEngine({
  baseUrl: 'https://seasalt.ai'
});

const metaData = engine.generate({
  title: 'AI Solutions',
  slug: 'products/ai-platform',
  language: 'en',
  contentType: 'product',
  excerpt: 'Powerful AI solutions for your business.'
});
```

```jsx
// Render in React
import SEOHead from './src/components/SEOHead';

function MyPage({ metaData }) {
  return (
    <>
      <SEOHead metaData={metaData} />
      {/* Your page content */}
    </>
  );
}
```

## 📁 Project Structure

```
/
├── config/
│   ├── languages.json          # Language definitions
│   ├── seo-templates.json      # Meta tag templates
│   └── sitemap-config.json     # Sitemap configuration
├── src/
│   ├── lib/
│   │   ├── seo/
│   │   │   ├── language-mapper.js
│   │   │   ├── meta-tag-engine.js
│   │   │   └── sitemap-generator.js
│   │   └── content/
│   │       └── content-source.js
│   └── components/
│       ├── SEOHead.jsx
│       └── markdown/
│           ├── MarkdownRenderer.jsx
│           └── components/
├── scripts/
│   ├── generate-sitemap.js
│   └── validate-seo.js
└── tests/
```

## 🔧 Configuration

### SEO Templates

Edit `config/seo-templates.json` to customize meta tag templates:

```json
{
  "blog": {
    "title": "{{title}} | Seasalt.AI Blog",
    "description": "{{excerpt}} - {{category}}"
  }
}
```

### Languages

Add languages in `config/languages.json`:

```json
{
  "iso6391": "fr",
  "hreflang": "fr-FR",
  "ogLocale": "fr_FR",
  "name": "French",
  "nativeName": "Français",
  "enabled": true,
  "priority": 7
}
```

## 📚 API Documentation

### Language Mapper

```javascript
const LanguageMapper = require('./src/lib/seo/language-mapper');
const mapper = new LanguageMapper();

// Get hreflang tag
mapper.getHreflang('zh'); // returns "zh-CN"

// Get Open Graph locale
mapper.getOGLocale('ja'); // returns "ja_JP"

// Get display name
mapper.getDisplayName('zh', true); // returns "简体中文"

// Check if RTL
mapper.isRTL('ar'); // returns true

// Normalize language code
mapper.normalize('zh-CN'); // returns "zh"
```

### Meta Tag Engine

```javascript
const MetaTagEngine = require('./src/lib/seo/meta-tag-engine');
const engine = new MetaTagEngine({
  baseUrl: 'https://seasalt.ai',
  defaultImage: 'https://seasalt.ai/og-image.jpg'
});

const metaData = engine.generate(content, {
  // Additional context
  customVariable: 'value'
});

// Returns:
// {
//   title: "...",
//   description: "...",
//   canonical: "...",
//   hreflang: [...],
//   openGraph: {...},
//   twitter: {...},
//   schema: {...},
//   robots: "index, follow"
// }
```

### Sitemap Generator

```javascript
const SitemapGenerator = require('./src/lib/seo/sitemap-generator');
const { MockContentSource } = require('./src/lib/content/content-source');

const generator = new SitemapGenerator({
  baseUrl: 'https://seasalt.ai',
  outputDir: './public',
  contentSource: new MockContentSource(),
  maxUrlsPerSitemap: 50000
});

const result = await generator.generateAll();
// Returns:
// {
//   success: true,
//   sitemaps: [...],
//   index: "path/to/sitemap.xml"
// }
```

### Markdown Renderer

```jsx
import MarkdownRenderer from './src/components/markdown/MarkdownRenderer';

function BlogPost({ content }) {
  return (
    <article>
      <MarkdownRenderer
        content={content}
        className="my-custom-class"
      />
    </article>
  );
}

// With custom components
import CustomChart from './CustomChart';

function DocsPage({ content }) {
  return (
    <MarkdownRenderer
      content={content}
      components={{
        Chart: CustomChart
      }}
    />
  );
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🌐 Multi-language SEO

### Hreflang Implementation

The system automatically generates proper hreflang tags:

```html
<link rel="alternate" hreflang="en" href="https://seasalt.ai/blog/post" />
<link rel="alternate" hreflang="zh-CN" href="https://seasalt.ai/zh/blog/post" />
<link rel="alternate" hreflang="ja-JP" href="https://seasalt.ai/ja/blog/post" />
<link rel="alternate" hreflang="x-default" href="https://seasalt.ai/blog/post" />
```

### URL Structure

The system uses subdirectory structure for languages:

- English: `https://seasalt.ai/blog/post`
- Chinese: `https://seasalt.ai/zh/blog/post`
- Japanese: `https://seasalt.ai/ja/blog/post`

### Character Limits

Different languages have different optimal character limits:

| Language | Title | Description |
|----------|-------|-------------|
| English, Spanish, French | 60 chars | 160 chars |
| Chinese, Japanese | 30 chars | 80 chars |
| Korean | 35 chars | 90 chars |

## 📊 Content Schema

Content items should follow this structure:

```javascript
{
  id: string,
  slug: string,
  language: string,           // ISO 639-1 code
  contentType: string,        // 'blog', 'product', 'landing', 'docs'
  title: string,
  excerpt: string,
  body: string,
  category: string,
  author: {
    name: string
  },
  featuredImage: string,
  publishedAt: Date,
  updatedAt: Date,
  status: 'published' | 'draft',
  alternateLanguages: [
    {
      language: string,
      slug: string
    }
  ],
  images: [
    {
      url: string,
      title: string,
      caption: string
    }
  ]
}
```

## 🔌 Integration

### Next.js Integration

```javascript
// pages/_app.js
import SEOHead from '../src/components/SEOHead';
import MetaTagEngine from '../src/lib/seo/meta-tag-engine';

const metaEngine = new MetaTagEngine({
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL
});

function MyApp({ Component, pageProps }) {
  const metaData = metaEngine.generate(pageProps.content);

  return (
    <>
      <SEOHead metaData={metaData} />
      <Component {...pageProps} />
    </>
  );
}
```

### Build Pipeline Integration

```javascript
// next.config.js
module.exports = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Generate sitemap during build
      require('./scripts/generate-sitemap')();
    }
    return config;
  }
};
```

### GitHub Actions

```yaml
# .github/workflows/seo.yml
name: Generate Sitemap

on:
  push:
    branches: [ main ]

jobs:
  sitemap:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run generate:sitemap
      - run: npm run validate:seo
```

## 🎯 Best Practices

1. **Always validate SEO** before deploying:
   ```bash
   npm run validate:seo
   ```

2. **Keep language configs updated** as you add new languages

3. **Use proper content types** for accurate Schema.org markup

4. **Test hreflang bidirectionality** - all alternate pages must link back

5. **Monitor Google Search Console** for indexing issues

6. **Regenerate sitemaps** when content changes

## 📈 Performance

- Sitemap generation: < 5 minutes for 50,000 URLs
- Build time increase: < 20%
- Supports incremental builds
- Automatic caching of content queries

## 🐛 Troubleshooting

### Sitemap not generating?

Check that your content source is properly configured and returning published content.

```bash
node scripts/generate-sitemap.js
```

### Meta tags not showing?

Verify your content has all required fields (title, slug, language, contentType).

### Character encoding issues?

Ensure your content is UTF-8 encoded and test with the validation script.

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please read the contributing guidelines first.

## 📧 Support

For issues and questions, please open an issue on GitHub.


