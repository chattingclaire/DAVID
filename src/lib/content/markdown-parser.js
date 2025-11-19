/**
 * Markdown Content Parser
 * Automatically parses markdown files with frontmatter and generates all required metadata
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class MarkdownParser {
  constructor(config = {}) {
    this.baseDir = config.baseDir || './content';
    this.defaultLanguage = config.defaultLanguage || 'en';
    this.defaultAuthor = config.defaultAuthor || 'Seasalt.AI';
  }

  /**
   * Parse a single markdown file
   * @param {string} filePath - Path to markdown file
   * @returns {Promise<Object>} Parsed content object
   */
  async parseFile(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    const stats = await fs.stat(filePath);

    // Parse frontmatter and body
    const { frontmatter, body } = this.extractFrontmatter(content);

    // Auto-generate missing fields
    const parsedContent = {
      // Auto-generated ID (hash of file path)
      id: frontmatter.id || this.generateId(filePath),

      // Auto-generated slug from file path
      slug: frontmatter.slug || this.generateSlug(filePath),

      // Auto-detect language from file path or frontmatter
      language: frontmatter.language || frontmatter.lang || this.detectLanguage(filePath),

      // Auto-detect content type from directory
      contentType: frontmatter.contentType || frontmatter.type || this.detectContentType(filePath),

      // Required fields from frontmatter
      title: frontmatter.title || this.extractTitle(body),

      // Auto-generate excerpt if not provided
      excerpt: frontmatter.excerpt || frontmatter.description || this.generateExcerpt(body),

      // Full markdown body
      body: body,

      // Optional fields with defaults
      category: frontmatter.category || null,
      tags: frontmatter.tags || [],

      author: {
        name: frontmatter.author || this.defaultAuthor
      },

      // Featured image
      featuredImage: frontmatter.featuredImage || frontmatter.image || null,

      // Dates
      publishedAt: frontmatter.publishedAt || frontmatter.date || stats.birthtime,
      updatedAt: frontmatter.updatedAt || stats.mtime,

      // Status
      status: frontmatter.status || frontmatter.draft === true ? 'draft' : 'published',

      // SEO fields
      seoTitle: frontmatter.seoTitle || null,
      seoDescription: frontmatter.seoDescription || null,

      // Alternate languages (auto-detect from file structure)
      alternateLanguages: frontmatter.alternateLanguages || await this.findAlternateLanguages(filePath),

      // Images in content
      images: this.extractImages(body)
    };

    return parsedContent;
  }

  /**
   * Parse all markdown files in a directory
   * @param {string} directory - Directory to scan
   * @returns {Promise<Array>} Array of parsed content objects
   */
  async parseDirectory(directory = this.baseDir) {
    const allContent = [];
    await this.scanDirectory(directory, allContent);
    return allContent;
  }

  /**
   * Recursively scan directory for markdown files
   * @private
   */
  async scanDirectory(directory, results) {
    const entries = await fs.readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        await this.scanDirectory(fullPath, results);
      } else if (this.isMarkdownFile(entry.name)) {
        try {
          const parsed = await this.parseFile(fullPath);
          results.push(parsed);
        } catch (error) {
          console.error(`Error parsing ${fullPath}:`, error.message);
        }
      }
    }
  }

  /**
   * Extract YAML frontmatter from markdown
   * @private
   */
  extractFrontmatter(content) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (!match) {
      // No frontmatter, entire content is body
      return {
        frontmatter: {},
        body: content.trim()
      };
    }

    const frontmatterText = match[1];
    const body = match[2].trim();

    // Parse YAML frontmatter (simple key: value parser)
    const frontmatter = this.parseYAML(frontmatterText);

    return { frontmatter, body };
  }

  /**
   * Simple YAML parser for frontmatter
   * @private
   */
  parseYAML(yaml) {
    const result = {};
    const lines = yaml.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const colonIndex = trimmed.indexOf(':');
      if (colonIndex === -1) continue;

      const key = trimmed.substring(0, colonIndex).trim();
      let value = trimmed.substring(colonIndex + 1).trim();

      // Remove quotes
      value = value.replace(/^["']|["']$/g, '');

      // Parse arrays
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      }

      // Parse booleans
      if (value === 'true') value = true;
      if (value === 'false') value = false;

      // Parse dates
      if (key.includes('date') || key.includes('Date') || key.includes('At')) {
        const dateValue = new Date(value);
        if (!isNaN(dateValue.getTime())) {
          value = dateValue;
        }
      }

      result[key] = value;
    }

    return result;
  }

  /**
   * Generate unique ID from file path
   * @private
   */
  generateId(filePath) {
    return crypto.createHash('md5').update(filePath).digest('hex').substring(0, 12);
  }

  /**
   * Generate slug from file path
   * @private
   */
  generateSlug(filePath) {
    // Remove base directory and language prefix
    let slug = path.relative(this.baseDir, filePath);

    // Remove language directory (e.g., "en/", "zh/")
    slug = slug.replace(/^[a-z]{2}(-[a-z]{2})?\//i, '');

    // Remove file extension
    slug = slug.replace(/\.mdx?$/i, '');

    // Convert to URL-friendly format
    slug = slug
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9/-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return slug;
  }

  /**
   * Detect language from file path
   * @private
   */
  detectLanguage(filePath) {
    // Check if file is in a language directory
    // e.g., content/en/blog/post.md -> en
    // e.g., content/zh/blog/post.md -> zh
    const relativePath = path.relative(this.baseDir, filePath);
    const parts = relativePath.split(path.sep);

    // Check if first part is a language code
    const langPattern = /^[a-z]{2}(-[a-z]{2})?$/i;
    if (parts.length > 0 && langPattern.test(parts[0])) {
      return parts[0].toLowerCase();
    }

    // Check file name (e.g., post.zh.md, post.en.md)
    const fileName = path.basename(filePath);
    const langMatch = fileName.match(/\.([a-z]{2})\.mdx?$/i);
    if (langMatch) {
      return langMatch[1].toLowerCase();
    }

    return this.defaultLanguage;
  }

  /**
   * Detect content type from directory structure
   * @private
   */
  detectContentType(filePath) {
    const relativePath = path.relative(this.baseDir, filePath);

    // Check directory names
    if (relativePath.includes('blog')) return 'blog';
    if (relativePath.includes('product')) return 'product';
    if (relativePath.includes('docs')) return 'docs';
    if (relativePath.includes('landing')) return 'landing';

    return 'page';
  }

  /**
   * Extract title from markdown body
   * @private
   */
  extractTitle(body) {
    const titleMatch = body.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1].trim() : 'Untitled';
  }

  /**
   * Generate excerpt from markdown body
   * @private
   */
  generateExcerpt(body, maxLength = 160) {
    // Remove markdown syntax
    let text = body
      .replace(/^#+\s+/gm, '') // Remove headers
      .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.+?)\*/g, '$1') // Remove italic
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`(.+?)`/g, '$1') // Remove inline code
      .replace(/^>\s+/gm, '') // Remove blockquotes
      .replace(/^[-*+]\s+/gm, '') // Remove list markers
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();

    // Take first paragraph or maxLength characters
    const firstParagraph = text.split(/\n\n/)[0];
    if (firstParagraph.length <= maxLength) {
      return firstParagraph;
    }

    // Truncate at word boundary
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return truncated.substring(0, lastSpace) + '...';
  }

  /**
   * Extract images from markdown body
   * @private
   */
  extractImages(body) {
    const images = [];
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;

    while ((match = imageRegex.exec(body)) !== null) {
      images.push({
        url: match[2],
        title: match[1] || '',
        caption: match[1] || ''
      });
    }

    return images;
  }

  /**
   * Find alternate language versions of this file
   * @private
   */
  async findAlternateLanguages(filePath) {
    const alternates = [];
    const slug = this.generateSlug(filePath);
    const currentLang = this.detectLanguage(filePath);

    // Look for files with same slug in different language directories
    const baseDir = path.dirname(filePath);
    const parentDir = path.dirname(baseDir);

    try {
      const dirs = await fs.readdir(parentDir, { withFileTypes: true });

      for (const dir of dirs) {
        if (!dir.isDirectory()) continue;

        const langPattern = /^[a-z]{2}(-[a-z]{2})?$/i;
        if (!langPattern.test(dir.name)) continue;

        const lang = dir.name.toLowerCase();
        if (lang === currentLang) continue;

        // Check if equivalent file exists
        const altPath = path.join(parentDir, dir.name, path.basename(filePath));
        try {
          await fs.access(altPath);
          alternates.push({
            language: lang,
            slug: slug
          });
        } catch {
          // File doesn't exist, skip
        }
      }
    } catch {
      // Directory doesn't exist, no alternates
    }

    return alternates;
  }

  /**
   * Check if file is markdown
   * @private
   */
  isMarkdownFile(fileName) {
    return /\.mdx?$/i.test(fileName);
  }
}

module.exports = MarkdownParser;
