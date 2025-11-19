/**
 * Automated Sitemap Generator
 * Automatically generates and updates XML sitemaps for all content across 100+ languages
 */

const { create } = require('xmlbuilder2');
const fs = require('fs').promises;
const path = require('path');
const LanguageMapper = require('./language-mapper');

class SitemapGenerator {
  constructor(config) {
    this.baseUrl = config.baseUrl || 'https://seasalt.ai';
    this.outputDir = config.outputDir || './public';
    this.contentSource = config.contentSource;
    this.languageMapper = config.languageMapper || new LanguageMapper();
    this.maxUrlsPerSitemap = config.maxUrlsPerSitemap || 50000;
    this.config = config;
  }

  /**
   * Generate all sitemaps
   * @returns {Promise<Object>} Generation result
   */
  async generateAll() {
    console.log('[Sitemap] Starting generation...');

    try {
      // 1. Fetch all published content
      const allContent = await this.contentSource.getAllPublished();

      if (!allContent || allContent.length === 0) {
        console.warn('[Sitemap] No content found, skipping sitemap generation');
        return {
          success: true,
          sitemaps: [],
          index: null
        };
      }

      // 2. Group by language
      const contentByLanguage = this.groupByLanguage(allContent);

      // 3. Generate language-specific sitemaps
      const sitemapFiles = [];

      for (const [language, content] of Object.entries(contentByLanguage)) {
        const filePath = await this.generateForLanguage(language, content);

        // Handle both single file and array of files
        const files = Array.isArray(filePath) ? filePath : [filePath];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const identifier = files.length > 1 ? `${language}-${i + 1}` : language;
          sitemapFiles.push({
            language,
            path: file,
            url: `${this.baseUrl}/sitemaps/sitemap-${identifier}.xml`,
            lastmod: new Date().toISOString()
          });
        }
      }

      // 4. Generate sitemap index
      const indexPath = await this.generateIndex(sitemapFiles);

      // 5. Ping search engines
      await this.pingSearchEngines(indexPath);

      console.log(`[Sitemap] Generated ${sitemapFiles.length} sitemaps`);

      return {
        success: true,
        sitemaps: sitemapFiles,
        index: indexPath
      };

    } catch (error) {
      console.error('[Sitemap] Generation failed:', error);
      throw error;
    }
  }

  /**
   * Group content by language
   * @private
   */
  groupByLanguage(content) {
    return content.reduce((acc, item) => {
      const lang = item.language || 'en';
      if (!acc[lang]) acc[lang] = [];
      acc[lang].push(item);
      return acc;
    }, {});
  }

  /**
   * Generate sitemap for specific language
   * @param {string} language - ISO 639-1 code
   * @param {Array} content - Content entries
   * @returns {Promise<string|Array<string>>} Path(s) to generated file(s)
   */
  async generateForLanguage(language, content) {
    const chunks = this.chunkArray(content, this.maxUrlsPerSitemap);

    if (chunks.length === 1) {
      return await this.writeSitemap(language, chunks[0]);
    } else {
      // Handle multiple chunks with numbered files
      const files = [];
      for (let i = 0; i < chunks.length; i++) {
        const file = await this.writeSitemap(`${language}-${i + 1}`, chunks[i]);
        files.push(file);
      }
      return files;
    }
  }

  /**
   * Write sitemap XML file
   * @private
   */
  async writeSitemap(identifier, content) {
    const urlset = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('urlset', {
        xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
        'xmlns:xhtml': 'http://www.w3.org/1999/xhtml',
        'xmlns:image': 'http://www.google.com/schemas/sitemap-image/1.1'
      });

    for (const item of content) {
      const url = urlset.ele('url');

      // Primary URL
      url.ele('loc').txt(this.buildUrl(item.slug, item.language));
      url.ele('lastmod').txt(this.formatDate(item.updatedAt));
      url.ele('changefreq').txt(this.calculateChangeFreq(item));
      url.ele('priority').txt(this.calculatePriority(item).toString());

      // Alternate language links (hreflang)
      if (item.alternateLanguages && item.alternateLanguages.length > 0) {
        // Add self-reference
        url.ele('xhtml:link', {
          rel: 'alternate',
          hreflang: this.languageMapper.getHreflang(item.language),
          href: this.buildUrl(item.slug, item.language)
        });

        // Add alternates
        for (const alt of item.alternateLanguages) {
          url.ele('xhtml:link', {
            rel: 'alternate',
            hreflang: this.languageMapper.getHreflang(alt.language),
            href: this.buildUrl(alt.slug, alt.language)
          });
        }

        // Add x-default
        url.ele('xhtml:link', {
          rel: 'alternate',
          hreflang: 'x-default',
          href: this.buildUrl(item.slug, item.language)
        });
      }

      // Images
      if (item.images && item.images.length > 0) {
        for (const img of item.images) {
          const image = url.ele('image:image');
          image.ele('image:loc').txt(img.url);
          if (img.title) image.ele('image:title').txt(img.title);
          if (img.caption) image.ele('image:caption').txt(img.caption);
        }
      }
    }

    const xml = urlset.end({ prettyPrint: true });
    const outputPath = path.join(this.outputDir, 'sitemaps', `sitemap-${identifier}.xml`);

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, xml, 'utf8');

    return outputPath;
  }

  /**
   * Generate sitemap index
   * @param {Array} sitemapFiles - Array of sitemap file info
   * @returns {Promise<string>} Path to index file
   */
  async generateIndex(sitemapFiles) {
    const sitemapindex = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('sitemapindex', {
        xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9'
      });

    for (const sitemap of sitemapFiles) {
      const sitemapEle = sitemapindex.ele('sitemap');
      sitemapEle.ele('loc').txt(sitemap.url);
      sitemapEle.ele('lastmod').txt(sitemap.lastmod);
    }

    const xml = sitemapindex.end({ prettyPrint: true });
    const outputPath = path.join(this.outputDir, 'sitemap.xml');

    await fs.writeFile(outputPath, xml, 'utf8');

    return outputPath;
  }

  /**
   * Build URL for content
   * @private
   */
  buildUrl(slug, language) {
    // Subdirectory structure: /en/blog/slug or /blog/slug (for English)
    if (language === 'en') {
      return `${this.baseUrl}/${slug}`;
    }
    return `${this.baseUrl}/${language}/${slug}`;
  }

  /**
   * Calculate priority based on content type and recency
   * @param {Object} content - Content entry
   * @returns {number} Priority value (0.0 to 1.0)
   */
  calculatePriority(content) {
    const now = Date.now();
    const publishedDate = new Date(content.publishedAt);
    const age = now - publishedDate.getTime();
    const daysOld = age / (1000 * 60 * 60 * 24);

    let priority = 0.5; // Base priority

    // Content type weighting
    const typeWeights = {
      'landing': 1.0,
      'product': 0.9,
      'blog': 0.7,
      'docs': 0.6
    };
    priority = typeWeights[content.contentType] || 0.5;

    // Recency boost
    if (daysOld < 7) {
      priority = Math.min(1.0, priority + 0.2);
    } else if (daysOld < 30) {
      priority = Math.min(1.0, priority + 0.1);
    } else if (daysOld > 365) {
      priority = Math.max(0.3, priority - 0.1);
    }

    return Math.round(priority * 10) / 10;
  }

  /**
   * Calculate change frequency
   * @param {Object} content - Content entry
   * @returns {string} Change frequency
   */
  calculateChangeFreq(content) {
    const typeFrequencies = {
      'landing': 'weekly',
      'product': 'weekly',
      'blog': 'monthly',
      'docs': 'weekly'
    };
    return typeFrequencies[content.contentType] || 'monthly';
  }

  /**
   * Chunk array into smaller arrays
   * @private
   */
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Format date to ISO 8601
   * @private
   */
  formatDate(date) {
    if (!date) return new Date().toISOString();
    if (typeof date === 'string') return date;
    if (date.toISOString) return date.toISOString();
    return new Date(date).toISOString();
  }

  /**
   * Ping search engines about sitemap update
   * @param {string} sitemapUrl - Path to sitemap
   * @returns {Promise<void>}
   */
  async pingSearchEngines(sitemapUrl) {
    const engines = [
      `https://www.google.com/ping?sitemap=${encodeURIComponent(this.baseUrl + '/sitemap.xml')}`,
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(this.baseUrl + '/sitemap.xml')}`
    ];

    for (const url of engines) {
      try {
        // Note: In Node.js environment, you might need to use node-fetch or axios
        // For now, we'll just log the attempt
        console.log(`[Sitemap] Would ping: ${url}`);

        // Uncomment when fetch is available:
        // await fetch(url);
        // console.log(`[Sitemap] Pinged: ${url}`);
      } catch (error) {
        console.error(`[Sitemap] Ping failed: ${url}`, error);
      }
    }
  }
}

/**
 * Monitored Sitemap Generator with metrics
 */
class MonitoredSitemapGenerator extends SitemapGenerator {
  async generateAll() {
    const startTime = Date.now();

    try {
      const result = await super.generateAll();

      // Success metrics
      this.logMetric('sitemap.generation.success', 1);
      this.logMetric('sitemap.generation.duration', Date.now() - startTime);
      this.logMetric('sitemap.files.count', result.sitemaps.length);

      return result;

    } catch (error) {
      // Error metrics
      this.logMetric('sitemap.generation.error', 1);
      this.logError('sitemap.generation.failed', error);

      throw error;
    }
  }

  logMetric(name, value) {
    // Send to monitoring service (DataDog, New Relic, etc.)
    console.log(`[Metric] ${name}: ${value}`);
  }

  logError(name, error) {
    // Send to error tracking service (Sentry, Rollbar, etc.)
    console.error(`[Error] ${name}:`, error);
  }
}

module.exports = SitemapGenerator;
module.exports.MonitoredSitemapGenerator = MonitoredSitemapGenerator;
