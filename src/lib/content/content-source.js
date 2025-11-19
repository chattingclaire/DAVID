/**
 * Content Source Interface
 * Abstract interface for fetching content from various sources (CMS, Git, etc.)
 */

class ContentSource {
  /**
   * Get all published content
   * @returns {Promise<Array<Object>>} Array of content entries
   */
  async getAllPublished() {
    throw new Error('getAllPublished() must be implemented by subclass');
  }

  /**
   * Get content by slug and language
   * @param {string} slug - Content slug
   * @param {string} language - Language code
   * @returns {Promise<Object|null>} Content entry or null
   */
  async getBySlug(slug, language) {
    throw new Error('getBySlug() must be implemented by subclass');
  }

  /**
   * Get content by ID
   * @param {string} id - Content ID
   * @returns {Promise<Object|null>} Content entry or null
   */
  async getById(id) {
    throw new Error('getById() must be implemented by subclass');
  }
}

/**
 * Mock Content Source for testing and development
 */
class MockContentSource extends ContentSource {
  constructor() {
    super();
    this.content = this.generateMockContent();
  }

  generateMockContent() {
    return [
      {
        id: '1',
        slug: 'blog/ai-trends-2025',
        language: 'en',
        contentType: 'blog',
        title: 'AI Trends in 2025',
        excerpt: 'Discover the latest trends in artificial intelligence and how they will shape the future.',
        body: '# AI Trends in 2025\n\nArtificial intelligence continues to evolve...',
        category: 'Technology',
        author: {
          name: 'John Doe'
        },
        featuredImage: 'https://seasalt.ai/images/ai-trends.jpg',
        publishedAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-15'),
        status: 'published',
        alternateLanguages: [
          {
            language: 'zh',
            slug: 'blog/ai-trends-2025'
          },
          {
            language: 'ja',
            slug: 'blog/ai-trends-2025'
          }
        ],
        images: [
          {
            url: 'https://seasalt.ai/images/ai-trends.jpg',
            title: 'AI Trends',
            caption: 'The future of AI'
          }
        ]
      },
      {
        id: '2',
        slug: 'blog/ai-trends-2025',
        language: 'zh',
        contentType: 'blog',
        title: '2025年AI趋势',
        excerpt: '探索人工智能的最新趋势以及它们如何塑造未来。',
        body: '# 2025年AI趋势\n\n人工智能继续发展...',
        category: '技术',
        author: {
          name: 'John Doe'
        },
        featuredImage: 'https://seasalt.ai/images/ai-trends.jpg',
        publishedAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-15'),
        status: 'published',
        alternateLanguages: [
          {
            language: 'en',
            slug: 'blog/ai-trends-2025'
          },
          {
            language: 'ja',
            slug: 'blog/ai-trends-2025'
          }
        ],
        images: []
      },
      {
        id: '3',
        slug: 'products/chatbot-platform',
        language: 'en',
        contentType: 'product',
        title: 'Seasalt Chatbot Platform',
        excerpt: 'Build intelligent chatbots with our powerful AI platform.',
        body: '# Seasalt Chatbot Platform\n\nOur chatbot platform allows you to...',
        category: 'Products',
        featuredImage: 'https://seasalt.ai/images/chatbot.jpg',
        publishedAt: new Date('2024-12-01'),
        updatedAt: new Date('2025-01-10'),
        status: 'published',
        pricing: {
          amount: '99',
          currency: 'USD'
        },
        alternateLanguages: [
          {
            language: 'zh',
            slug: 'products/chatbot-platform'
          }
        ],
        images: []
      }
    ];
  }

  async getAllPublished() {
    // Simulate async operation
    return Promise.resolve(
      this.content.filter(item => item.status === 'published')
    );
  }

  async getBySlug(slug, language = 'en') {
    const item = this.content.find(
      item => item.slug === slug && item.language === language
    );
    return Promise.resolve(item || null);
  }

  async getById(id) {
    const item = this.content.find(item => item.id === id);
    return Promise.resolve(item || null);
  }
}

/**
 * Git-based Content Source
 * Fetches content from markdown files in a Git repository
 */
class GitContentSource extends ContentSource {
  constructor(config) {
    super();
    this.contentDir = config.contentDir || './content';
  }

  async getAllPublished() {
    // Implementation would parse markdown files from contentDir
    // This is a placeholder
    console.log('[GitContentSource] Fetching content from:', this.contentDir);
    return [];
  }

  async getBySlug(slug, language) {
    // Implementation would read specific markdown file
    return null;
  }

  async getById(id) {
    return null;
  }
}

module.exports = {
  ContentSource,
  MockContentSource,
  GitContentSource
};
