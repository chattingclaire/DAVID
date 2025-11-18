/**
 * Sitemap Generator Tests
 */

const SitemapGenerator = require('../src/lib/seo/sitemap-generator');
const { MockContentSource } = require('../src/lib/content/content-source');

describe('SitemapGenerator', () => {
  let generator;
  let contentSource;

  beforeEach(() => {
    contentSource = new MockContentSource();
    generator = new SitemapGenerator({
      baseUrl: 'https://seasalt.ai',
      outputDir: './test-output',
      contentSource
    });
  });

  describe('groupByLanguage', () => {
    test('should group content by language', () => {
      const content = [
        { language: 'en', title: 'English' },
        { language: 'zh', title: 'Chinese' },
        { language: 'en', title: 'English 2' }
      ];

      const grouped = generator.groupByLanguage(content);

      expect(grouped.en.length).toBe(2);
      expect(grouped.zh.length).toBe(1);
    });
  });

  describe('buildUrl', () => {
    test('should build correct URL for English', () => {
      const url = generator.buildUrl('blog/test', 'en');
      expect(url).toBe('https://seasalt.ai/blog/test');
    });

    test('should build correct URL for other languages', () => {
      const url = generator.buildUrl('blog/test', 'zh');
      expect(url).toBe('https://seasalt.ai/zh/blog/test');
    });
  });

  describe('calculatePriority', () => {
    test('should assign higher priority to landing pages', () => {
      const landing = { contentType: 'landing', publishedAt: new Date() };
      const blog = { contentType: 'blog', publishedAt: new Date() };

      expect(generator.calculatePriority(landing)).toBeGreaterThan(
        generator.calculatePriority(blog)
      );
    });

    test('should boost priority for recent content', () => {
      const recent = {
        contentType: 'blog',
        publishedAt: new Date()
      };

      const old = {
        contentType: 'blog',
        publishedAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000)
      };

      expect(generator.calculatePriority(recent)).toBeGreaterThan(
        generator.calculatePriority(old)
      );
    });

    test('should return value between 0 and 1', () => {
      const content = { contentType: 'blog', publishedAt: new Date() };
      const priority = generator.calculatePriority(content);

      expect(priority).toBeGreaterThanOrEqual(0);
      expect(priority).toBeLessThanOrEqual(1);
    });
  });

  describe('calculateChangeFreq', () => {
    test('should return correct frequency for content types', () => {
      expect(generator.calculateChangeFreq({ contentType: 'landing' })).toBe('weekly');
      expect(generator.calculateChangeFreq({ contentType: 'blog' })).toBe('monthly');
      expect(generator.calculateChangeFreq({ contentType: 'product' })).toBe('weekly');
    });
  });

  describe('chunkArray', () => {
    test('should chunk array correctly', () => {
      const array = Array.from({ length: 100 }, (_, i) => i);
      const chunks = generator.chunkArray(array, 30);

      expect(chunks.length).toBe(4);
      expect(chunks[0].length).toBe(30);
      expect(chunks[3].length).toBe(10);
    });

    test('should handle array smaller than chunk size', () => {
      const array = [1, 2, 3];
      const chunks = generator.chunkArray(array, 10);

      expect(chunks.length).toBe(1);
      expect(chunks[0].length).toBe(3);
    });
  });
});
