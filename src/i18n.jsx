import { createContext, useContext } from 'react';

export const LangContext = createContext(null);
export const useLang = () => useContext(LangContext);

export const pick = (v, lang) =>
  v && typeof v === 'object' && !Array.isArray(v) && ('it' in v || 'en' in v) ? (v[lang] ?? v.it ?? v.en) : v;

export const safeUrl = (u) => (typeof u === 'string' && /^(https?:|mailto:)/i.test(u) ? u : null);

export function detectLang() {
  let saved = null;
  try { saved = localStorage.getItem('lang'); } catch {}
  const q = new URLSearchParams(location.search).get('lang');
  return (q || saved || (navigator.language || 'it').slice(0, 2)) === 'it' ? 'it' : 'en';
}
