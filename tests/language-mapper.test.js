/**
 * Language Mapper Tests
 */

const LanguageMapper = require('../src/lib/seo/language-mapper');

describe('LanguageMapper', () => {
  let mapper;

  beforeEach(() => {
    mapper = new LanguageMapper();
  });

  describe('getByISO', () => {
    test('should return language object for valid ISO code', () => {
      const lang = mapper.getByISO('en');
      expect(lang).toBeDefined();
      expect(lang.iso6391).toBe('en');
      expect(lang.name).toBe('English');
    });

    test('should return undefined for invalid ISO code', () => {
      const lang = mapper.getByISO('invalid');
      expect(lang).toBeUndefined();
    });

    test('should be case-insensitive', () => {
      const lang = mapper.getByISO('EN');
      expect(lang).toBeDefined();
      expect(lang.iso6391).toBe('en');
    });
  });

  describe('getHreflang', () => {
    test('should return correct hreflang tag', () => {
      expect(mapper.getHreflang('en')).toBe('en');
      expect(mapper.getHreflang('zh')).toBe('zh-CN');
      expect(mapper.getHreflang('ja')).toBe('ja-JP');
    });

    test('should return original code if not found', () => {
      expect(mapper.getHreflang('invalid')).toBe('invalid');
    });
  });

  describe('getOGLocale', () => {
    test('should return correct Open Graph locale', () => {
      expect(mapper.getOGLocale('en')).toBe('en_US');
      expect(mapper.getOGLocale('zh')).toBe('zh_CN');
      expect(mapper.getOGLocale('ja')).toBe('ja_JP');
    });
  });

  describe('getDisplayName', () => {
    test('should return English name by default', () => {
      expect(mapper.getDisplayName('zh')).toBe('Chinese (Simplified)');
    });

    test('should return native name when requested', () => {
      expect(mapper.getDisplayName('zh', true)).toBe('简体中文');
      expect(mapper.getDisplayName('ja', true)).toBe('日本語');
    });
  });

  describe('isRTL', () => {
    test('should identify RTL languages', () => {
      expect(mapper.isRTL('ar')).toBe(true);
      expect(mapper.isRTL('en')).toBe(false);
      expect(mapper.isRTL('zh')).toBe(false);
    });
  });

  describe('normalize', () => {
    test('should normalize ISO codes', () => {
      expect(mapper.normalize('en')).toBe('en');
      expect(mapper.normalize('EN')).toBe('en');
    });

    test('should extract base language from variants', () => {
      expect(mapper.normalize('zh-CN')).toBe('zh');
      expect(mapper.normalize('en-US')).toBe('en');
    });

    test('should default to English for invalid codes', () => {
      expect(mapper.normalize('invalid')).toBe('en');
      expect(mapper.normalize('')).toBe('en');
    });
  });

  describe('getAllEnabled', () => {
    test('should return only enabled languages', () => {
      const enabled = mapper.getAllEnabled();
      expect(enabled.length).toBeGreaterThan(0);
      expect(enabled.every(lang => lang.enabled)).toBe(true);
    });

    test('should return languages sorted by priority', () => {
      const enabled = mapper.getAllEnabled();
      for (let i = 1; i < enabled.length; i++) {
        expect(enabled[i].priority).toBeGreaterThanOrEqual(enabled[i - 1].priority);
      }
    });
  });
});
