/**
 * Language Mapping System
 * Provides consistent mapping between ISO language codes, hreflang tags,
 * Open Graph locales, and display names.
 */

class LanguageMapper {
  constructor(config = null) {
    // Load from config file or use defaults
    if (config) {
      this.languages = config;
    } else {
      try {
        this.languages = require('../../../config/languages.json');
      } catch (error) {
        console.warn('[LanguageMapper] Could not load languages.json, using minimal defaults');
        this.languages = [
          {
            iso6391: 'en',
            iso6393: 'eng',
            hreflang: 'en',
            ogLocale: 'en_US',
            name: 'English',
            nativeName: 'English',
            region: 'US',
            rtl: false,
            enabled: true,
            priority: 1
          }
        ];
      }
    }

    this.indexByISO = this.buildIndex('iso6391');
    this.indexByHreflang = this.buildIndex('hreflang');
  }

  /**
   * Build index for fast lookups
   * @private
   */
  buildIndex(key) {
    const index = new Map();
    for (const lang of this.languages) {
      if (lang[key]) {
        index.set(lang[key].toLowerCase(), lang);
      }
    }
    return index;
  }

  /**
   * Get language by ISO 639-1 code
   * @param {string} code - ISO 639-1 language code
   * @returns {Object|undefined} Language object
   */
  getByISO(code) {
    if (!code) return undefined;
    return this.indexByISO.get(code.toLowerCase());
  }

  /**
   * Get hreflang tag for ISO code
   * @param {string} isoCode - ISO 639-1 language code
   * @returns {string} Hreflang tag (e.g., "en", "zh-CN")
   */
  getHreflang(isoCode) {
    const lang = this.getByISO(isoCode);
    return lang ? lang.hreflang : isoCode;
  }

  /**
   * Get Open Graph locale for ISO code
   * @param {string} isoCode - ISO 639-1 language code
   * @returns {string} OG locale (e.g., "en_US", "zh_CN")
   */
  getOGLocale(isoCode) {
    const lang = this.getByISO(isoCode);
    return lang ? lang.ogLocale : isoCode.replace('-', '_');
  }

  /**
   * Get display name
   * @param {string} isoCode - ISO 639-1 language code
   * @param {boolean} native - Return native name if true
   * @returns {string} Display name
   */
  getDisplayName(isoCode, native = false) {
    const lang = this.getByISO(isoCode);
    if (!lang) return isoCode;
    return native ? lang.nativeName : lang.name;
  }

  /**
   * Check if language is RTL (right-to-left)
   * @param {string} isoCode - ISO 639-1 language code
   * @returns {boolean}
   */
  isRTL(isoCode) {
    const lang = this.getByISO(isoCode);
    return lang ? lang.rtl : false;
  }

  /**
   * Get all enabled languages
   * @returns {Array<Object>} Array of language objects sorted by priority
   */
  getAllEnabled() {
    return this.languages
      .filter(l => l.enabled)
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Validate and normalize language code
   * @param {string} code - Language code to normalize
   * @returns {string} Normalized ISO 639-1 code
   */
  normalize(code) {
    if (!code) return 'en';

    // Try exact match
    let lang = this.getByISO(code);
    if (lang) return lang.iso6391;

    // Try hreflang match
    lang = this.indexByHreflang.get(code.toLowerCase());
    if (lang) return lang.iso6391;

    // Try base language (e.g., zh-CN -> zh)
    const base = code.split('-')[0];
    lang = this.getByISO(base);
    if (lang) return lang.iso6391;

    // Default to English
    return 'en';
  }

  /**
   * Get language by URL segment
   * @param {string} segment - URL path segment
   * @returns {string} Normalized ISO 639-1 code
   */
  getByUrlSegment(segment) {
    // Handle /zh/, /zh-cn/, etc.
    return this.normalize(segment);
  }

  /**
   * Get ISO 639-3 code
   * @param {string} isoCode - ISO 639-1 language code
   * @returns {string} ISO 639-3 code
   */
  getISO6393(isoCode) {
    const lang = this.getByISO(isoCode);
    return lang ? lang.iso6393 : null;
  }

  /**
   * Get region code
   * @param {string} isoCode - ISO 639-1 language code
   * @returns {string|null} Region code (e.g., "US", "CN")
   */
  getRegion(isoCode) {
    const lang = this.getByISO(isoCode);
    return lang ? lang.region : null;
  }

  /**
   * Check if language is enabled
   * @param {string} isoCode - ISO 639-1 language code
   * @returns {boolean}
   */
  isEnabled(isoCode) {
    const lang = this.getByISO(isoCode);
    return lang ? lang.enabled : false;
  }

  /**
   * Get language priority
   * @param {string} isoCode - ISO 639-1 language code
   * @returns {number} Priority value (lower is higher priority)
   */
  getPriority(isoCode) {
    const lang = this.getByISO(isoCode);
    return lang ? lang.priority : 999;
  }
}

module.exports = LanguageMapper;
