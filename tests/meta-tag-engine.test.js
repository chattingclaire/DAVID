/**
 * Meta Tag Engine Tests
 */

const MetaTagEngine = require('../src/lib/seo/meta-tag-engine');

describe('MetaTagEngine', () => {
  let engine;
  let mockContent;

  beforeEach(() => {
    engine = new MetaTagEngine({
      baseUrl: 'https://seasalt.ai'
    });

    mockContent = {
      id: '1',
      slug: 'blog/test-post',
      language: 'en',
      contentType: 'blog',
      title: 'Test Blog Post',
      excerpt: 'This is a test excerpt for the blog post.',
      body: 'Full blog post content here...',
      category: 'Technology',
      author: { name: 'John Doe' },
      publishedAt: new Date('2025-01-15'),
      updatedAt: new Date('2025-01-15'),
      status: 'published'
    };
  });

  describe('generate', () => {
    test('should generate complete meta data', () => {
      const metaData = engine.generate(mockContent);

      expect(metaData.title).toBeDefined();
      expect(metaData.description).toBeDefined();
      expect(metaData.canonical).toBeDefined();
      expect(metaData.hreflang).toBeDefined();
      expect(metaData.openGraph).toBeDefined();
      expect(metaData.twitter).toBeDefined();
      expect(metaData.schema).toBeDefined();
    });

    test('should generate correct title', () => {
      const metaData = engine.generate(mockContent);
      expect(metaData.title).toContain('Test Blog Post');
      expect(metaData.title).toContain('Seasalt.AI');
    });

    test('should use excerpt as description', () => {
      const metaData = engine.generate(mockContent);
      expect(metaData.description).toContain('test excerpt');
    });
  });

  describe('applyTemplate', () => {
    test('should replace variables in template', () => {
      const template = '{{title}} | {{siteName}}';
      const variables = { title: 'Test', siteName: 'Seasalt.AI' };
      const result = engine.applyTemplate(template, variables);

      expect(result).toBe('Test | Seasalt.AI');
    });

    test('should handle missing variables', () => {
      const template = '{{title}} | {{missing}}';
      const variables = { title: 'Test' };
      const result = engine.applyTemplate(template, variables);

      expect(result).toBe('Test |');
    });
  });

  describe('truncate', () => {
    test('should truncate long text', () => {
      const longText = 'a'.repeat(200);
      const result = engine.truncate(longText, 60, 'en');

      expect(result.length).toBeLessThanOrEqual(64); // 60 + '...'
      expect(result).toContain('...');
    });

    test('should not truncate short text', () => {
      const shortText = 'Short text';
      const result = engine.truncate(shortText, 60, 'en');

      expect(result).toBe(shortText);
    });

    test('should handle CJK languages differently', () => {
      const text = '这是一个很长的中文文本'.repeat(10);
      const result = engine.truncate(text, 30, 'zh');

      expect(result.length).toBeLessThanOrEqual(33); // 30 + '...'
    });
  });

  describe('buildCanonicalUrl', () => {
    test('should build correct URL for English', () => {
      const url = engine.buildCanonicalUrl(mockContent);
      expect(url).toBe('https://seasalt.ai/blog/test-post');
    });

    test('should build correct URL for other languages', () => {
      mockContent.language = 'zh';
      const url = engine.buildCanonicalUrl(mockContent);
      expect(url).toBe('https://seasalt.ai/zh/blog/test-post');
    });
  });

  describe('generateHreflang', () => {
    test('should include self-reference', () => {
      const hreflang = engine.generateHreflang(mockContent);
      const selfRef = hreflang.find(h => h.lang === 'en');

      expect(selfRef).toBeDefined();
    });

    test('should include x-default', () => {
      const hreflang = engine.generateHreflang(mockContent);
      const defaultRef = hreflang.find(h => h.lang === 'x-default');

      expect(defaultRef).toBeDefined();
    });

    test('should include alternates', () => {
      mockContent.alternateLanguages = [
        { language: 'zh', slug: 'blog/test-post' },
        { language: 'ja', slug: 'blog/test-post' }
      ];

      const hreflang = engine.generateHreflang(mockContent);

      expect(hreflang.length).toBeGreaterThanOrEqual(4); // self + zh + ja + x-default
    });
  });

  describe('generateSchema', () => {
    test('should generate BlogPosting schema for blog posts', () => {
      const metaData = engine.generate(mockContent);

      expect(metaData.schema['@type']).toBe('BlogPosting');
      expect(metaData.schema['@context']).toBe('https://schema.org');
      expect(metaData.schema.headline).toBeDefined();
    });

    test('should generate Product schema for products', () => {
      mockContent.contentType = 'product';
      mockContent.pricing = { amount: '99', currency: 'USD' };

      const metaData = engine.generate(mockContent);

      expect(metaData.schema['@type']).toBe('Product');
      expect(metaData.schema.offers).toBeDefined();
    });
  });
});
