// Shared language metadata for multilingual MDX components
// (StorySummary, Definition). Single source of truth.

export const LANG_LABELS: Record<string, string> = {
  en: 'English',
  bn: 'বাংলা',
  hi: 'हिन्दी',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  ru: 'Русский',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  ar: 'العربية',
  ur: 'اردو',
  id: 'Bahasa Indonesia',
  tr: 'Türkçe',
  vi: 'Tiếng Việt',
};

export const RTL_LANGS = new Set(['ar', 'ur', 'fa', 'he']);

// Shared localStorage key — picking a language anywhere syncs everywhere.
export const LANG_STORAGE_KEY = 'vizly-story-lang';

export function isRtl(lang: string): boolean {
  return RTL_LANGS.has(lang);
}

export function langLabel(lang: string): string {
  return LANG_LABELS[lang] ?? lang.toUpperCase();
}
