/**
 * Meta Tag Template Engine
 * Generates consistent, SEO-optimized meta tags across all languages and content types
 */

const LanguageMapper = require('./language-mapper');

class MetaTagEngine {
  constructor(config) {
    this.templates = config.templates || require('../../../config/seo-templates.json');
    this.baseUrl = config.baseUrl || 'https://seasalt.ai';
    this.languageMapper = config.languageMapper || new LanguageMapper();
    this.defaultImage = config.defaultImage || `${this.baseUrl}/og-image.jpg`;
  }

  /**
   * Generate complete meta tags for content
   * @param {Object} content - Content entry
   * @param {Object} context - Additional context variables
   * @returns {Object} Generated meta data
   */
  generate(content, context = {}) {
    const language = content.language || 'en';
    const contentType = content.contentType || 'page';

    // Get template for content type and language
    const template = this.getTemplate(contentType, language);

    // Prepare variables
    const variables = {
      title: content.title,
      excerpt: content.excerpt || this.generateExcerpt(content.body),
      category: content.category,
      author: content.author?.name,
      siteName: 'Seasalt.AI',
      ...context
    };

    // Generate core meta tags
    const title = this.applyTemplate(template.title, variables);
    const description = this.applyTemplate(template.description, variables);
    const canonical = this.buildCanonicalUrl(content);

    // Generate hreflang
    const hreflang = this.generateHreflang(content);

    // Generate Open Graph
    const openGraph = {
      type: this.getOGType(contentType),
      title: this.applyTemplate(template.ogTitle || template.title, variables),
      description: this.applyTemplate(template.ogDescription || template.description, variables),
      image: content.featuredImage || this.defaultImage,
      url: canonical,
      locale: this.languageMapper.getOGLocale(language),
      alternateLocales: hreflang
        .filter(h => h.lang !== language)
        .map(h => this.languageMapper.getOGLocale(h.lang))
    };

    // Generate Twitter Card
    const twitter = {
      card: content.featuredImage ? 'summary_large_image' : 'summary',
      title: this.applyTemplate(template.twitterTitle || template.title, variables),
      description: this.applyTemplate(template.twitterDescription || template.description, variables),
      image: content.featuredImage || this.defaultImage
    };

    // Generate Schema.org
    const schema = this.generateSchema(content, variables);

    return {
      title: this.truncate(title, template.limits.titleMax, language),
      description: this.truncate(description, template.limits.descriptionMax, language),
      canonical,
      hreflang,
      openGraph,
      twitter,
      schema,
      robots: this.getRobotsDirective(content)
    };
  }

  /**
   * Get template for content type and language
   * @private
   */
  getTemplate(contentType, language) {
    // Load base template
    const baseTemplate = this.templates[contentType] || this.templates.default;

    // Check for language overrides
    const langOverrides = this.templates.languageOverrides?.[language]?.[contentType] ||
                          this.templates.languageOverrides?.[language]?.default || {};

    return {
      ...baseTemplate,
      ...langOverrides,
      limits: this.getCharacterLimits(language)
    };
  }

  /**
   * Apply template with variable substitution
   * @param {string} template - Template string with {{variables}}
   * @param {Object} variables - Variable values
   * @returns {string} Processed string
   */
  applyTemplate(template, variables) {
    if (!template) return '';

    let result = template;

    // Replace {{variable}} with actual values
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, value || '');
    }

    // Clean up any remaining unfilled variables
    result = result.replace(/{{[^}]+}}/g, '');

    // Clean up extra spaces
    result = result.replace(/\s+/g, ' ').trim();

    return result;
  }

  /**
   * Truncate text respecting language-specific limits
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @param {string} language - Language code
   * @returns {string} Truncated text
   */
  truncate(text, maxLength, language) {
    if (!text) return '';

    // Account for CJK characters (count as 2 chars)
    const isCJK = ['zh', 'zh-tw', 'ja', 'ko'].includes(language);

    if (isCJK) {
      // For CJK, each character is more "heavy"
      let actualLength = 0;
      let truncatedText = '';

      for (const char of text) {
        const charWeight = /[\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/.test(char) ? 2 : 1;
        if (actualLength + charWeight > maxLength) break;
        truncatedText += char;
        actualLength += charWeight;
      }

      return truncatedText + (text.length > truncatedText.length ? '...' : '');
    } else {
      if (text.length <= maxLength) return text;

      // Truncate at word boundary
      const truncated = text.substr(0, maxLength);
      const lastSpace = truncated.lastIndexOf(' ');

      return (lastSpace > 0 ? truncated.substr(0, lastSpace) : truncated) + '...';
    }
  }

  /**
   * Get character limits based on language
   * @private
   */
  getCharacterLimits(language) {
    const isCJK = ['zh', 'zh-tw', 'ja', 'ko'].includes(language);

    return {
      titleMax: isCJK ? 30 : 60,
      descriptionMax: isCJK ? 80 : 160
    };
  }

  /**
   * Build canonical URL for content
   * @param {Object} content - Content entry
   * @returns {string} Canonical URL
   */
  buildCanonicalUrl(content) {
    const language = content.language || 'en';
    const slug = content.slug;

    if (language === 'en') {
      return `${this.baseUrl}/${slug}`;
    }
    return `${this.baseUrl}/${language}/${slug}`;
  }

  /**
   * Generate hreflang tags for alternates
   * @param {Object} content - Content entry
   * @returns {Array<{lang: string, url: string}>}
   */
  generateHreflang(content) {
    const hreflang = [];
    const baseLanguage = content.language || 'en';

    // Add self-reference
    hreflang.push({
      lang: this.languageMapper.getHreflang(baseLanguage),
      url: this.buildCanonicalUrl(content)
    });

    // Add alternates
    if (content.alternateLanguages && Array.isArray(content.alternateLanguages)) {
      for (const alt of content.alternateLanguages) {
        const url = `${this.baseUrl}/${alt.language === 'en' ? '' : alt.language + '/'}${alt.slug}`;
        hreflang.push({
          lang: this.languageMapper.getHreflang(alt.language),
          url
        });
      }
    }

    // Add x-default (typically English or main language)
    const defaultLang = hreflang.find(h => h.lang === 'en' || h.lang === content.language);
    if (defaultLang) {
      hreflang.push({
        lang: 'x-default',
        url: defaultLang.url
      });
    }

    return hreflang;
  }

  /**
   * Generate JSON-LD structured data
   * @param {Object} content - Content entry
   * @param {Object} variables - Template variables
   * @returns {Object} Schema.org structured data
   */
  generateSchema(content, variables) {
    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': this.getSchemaType(content.contentType),
      headline: variables.title,
      description: variables.excerpt,
      url: this.buildCanonicalUrl(content),
      datePublished: content.publishedAt?.toISOString ? content.publishedAt.toISOString() : content.publishedAt,
      dateModified: content.updatedAt?.toISOString ? content.updatedAt.toISOString() : content.updatedAt
    };

    // Content-type specific additions
    switch (content.contentType) {
      case 'blog':
        return {
          ...baseSchema,
          '@type': 'BlogPosting',
          author: {
            '@type': 'Person',
            name: content.author?.name || 'Seasalt.AI Team'
          },
          publisher: {
            '@type': 'Organization',
            name: 'Seasalt.AI',
            logo: {
              '@type': 'ImageObject',
              url: `${this.baseUrl}/logo.png`
            }
          },
          image: content.featuredImage,
          articleSection: content.category
        };

      case 'product':
        return {
          ...baseSchema,
          '@type': 'Product',
          name: variables.title,
          image: content.featuredImage,
          brand: {
            '@type': 'Brand',
            name: 'Seasalt.AI'
          },
          offers: content.pricing ? {
            '@type': 'Offer',
            price: content.pricing.amount,
            priceCurrency: content.pricing.currency
          } : undefined
        };

      default:
        return {
          ...baseSchema,
          '@type': 'WebPage'
        };
    }
  }

  /**
   * Get Open Graph type for content type
   * @private
   */
  getOGType(contentType) {
    const typeMap = {
      'blog': 'article',
      'product': 'product',
      'docs': 'article'
    };
    return typeMap[contentType] || 'website';
  }

  /**
   * Get Schema.org type for content type
   * @private
   */
  getSchemaType(contentType) {
    const typeMap = {
      'blog': 'BlogPosting',
      'product': 'Product',
      'docs': 'TechArticle'
    };
    return typeMap[contentType] || 'WebPage';
  }

  /**
   * Get robots directive
   * @private
   */
  getRobotsDirective(content) {
    if (content.status === 'draft' || content.noindex) {
      return 'noindex, nofollow';
    }
    return 'index, follow';
  }

  /**
   * Generate excerpt from body text
   * @private
   */
  generateExcerpt(body, maxLength = 160) {
    if (!body) return '';

    // Strip HTML/Markdown (basic)
    let text = body.replace(/<[^>]*>/g, '');
    text = text.replace(/[#*_\[\]()]/g, '');

    // Take first paragraph or maxLength chars
    const firstPara = text.split('\n')[0];
    return firstPara.length <= maxLength
      ? firstPara
      : this.truncate(firstPara, maxLength, 'en');
  }
}

module.exports = MetaTagEngine;
