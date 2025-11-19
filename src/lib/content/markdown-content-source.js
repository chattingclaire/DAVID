/**
 * Markdown-based Content Source
 * Automatically parses markdown files from a directory
 */

const { ContentSource } = require('./content-source');
const MarkdownParser = require('./markdown-parser');

class MarkdownContentSource extends ContentSource {
  constructor(config = {}) {
    super();
    this.parser = new MarkdownParser({
      baseDir: config.contentDir || './content',
      defaultLanguage: config.defaultLanguage || 'en',
      defaultAuthor: config.defaultAuthor || 'Seasalt.AI'
    });
    this.cache = new Map();
    this.cacheTimeout = config.cacheTimeout || 300000; // 5 minutes
  }

  /**
   * Get all published content
   * @returns {Promise<Array>} Array of content entries
   */
  async getAllPublished() {
    const cacheKey = 'all_published';

    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    // Parse all markdown files
    const allContent = await this.parser.parseDirectory();

    // Filter published only
    const published = allContent.filter(item => item.status === 'published');

    // Cache result
    this.cache.set(cacheKey, {
      data: published,
      timestamp: Date.now()
    });

    return published;
  }

  /**
   * Get content by slug and language
   * @param {string} slug - Content slug
   * @param {string} language - Language code
   * @returns {Promise<Object|null>} Content entry or null
   */
  async getBySlug(slug, language = 'en') {
    const allContent = await this.getAllPublished();
    return allContent.find(
      item => item.slug === slug && item.language === language
    ) || null;
  }

  /**
   * Get content by ID
   * @param {string} id - Content ID
   * @returns {Promise<Object|null>} Content entry or null
   */
  async getById(id) {
    const allContent = await this.getAllPublished();
    return allContent.find(item => item.id === id) || null;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get content by category
   * @param {string} category - Category name
   * @returns {Promise<Array>} Array of content entries
   */
  async getByCategory(category) {
    const allContent = await this.getAllPublished();
    return allContent.filter(item => item.category === category);
  }

  /**
   * Get content by tag
   * @param {string} tag - Tag name
   * @returns {Promise<Array>} Array of content entries
   */
  async getByTag(tag) {
    const allContent = await this.getAllPublished();
    return allContent.filter(item =>
      item.tags && item.tags.includes(tag)
    );
  }

  /**
   * Get content by language
   * @param {string} language - Language code
   * @returns {Promise<Array>} Array of content entries
   */
  async getByLanguage(language) {
    const allContent = await this.getAllPublished();
    return allContent.filter(item => item.language === language);
  }

  /**
   * Get content by content type
   * @param {string} contentType - Content type
   * @returns {Promise<Array>} Array of content entries
   */
  async getByContentType(contentType) {
    const allContent = await this.getAllPublished();
    return allContent.filter(item => item.contentType === contentType);
  }
}

module.exports = MarkdownContentSource;
