import { useCallback, useEffect, useMemo, useState } from 'react';
import { LangContext, pick, detectLang, safeUrl } from './i18n.jsx';
import { useData, reduceMotion } from './hooks.js';
import Nav, { SECTIONS } from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Experience from './components/Experience.jsx';
import Projects from './components/Projects.jsx';
import Ai from './components/Ai.jsx';
import Skills from './components/Skills.jsx';
import Education from './components/Education.jsx';
import Contact from './components/Contact.jsx';
import Palette from './components/Palette.jsx';
import Toast from './components/Toast.jsx';
import Cursor from './components/Cursor.jsx';
import Terminal from './components/Terminal.jsx';

const BACKGROUNDS = { terminal: Terminal };

const DATA_URLS = ['content/data.json', 'content/data.example.json'];
const save = (k, v) => { try { localStorage.setItem(k, v); } catch {} };

export default function App() {
  const { data, error, invalid } = useData(DATA_URLS);
  const [lang, setLang] = useState(detectLang);
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'dark');
  const [palette, setPalette] = useState(false);
  const [toast, setToast] = useState(null);

  const t = useCallback((v) => pick(v, lang), [lang]);
  const ctx = useMemo(() => ({ lang, t, ui: (k) => t(data?.ui[k]) }), [lang, t, data]);
  const notify = (text) => setToast({ text, id: Date.now() });

  const [paletteOverride, setPaletteOverride] = useState(() => new URLSearchParams(location.search).get('palette'));
  const colors = paletteOverride || data?.meta.palette || 'graphite';

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.palette = colors;
    const css = getComputedStyle(root), v = (k) => css.getPropertyValue(k).trim();
    document.querySelector('meta[name=theme-color]').content = v('--bg');
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='9' fill='${v('--acc')}'/><text x='16' y='22' font-size='17' font-family='Georgia' font-style='italic' text-anchor='middle' fill='${v('--acc-fg')}'>cv</text></svg>`;
    document.querySelector('link[rel=icon]').href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    save('theme', theme);
    save('palette', colors);
  }, [theme, colors]);

  useEffect(() => {
    document.documentElement.lang = lang;
    save('lang', lang);
    if (!data) return;
    const title = t(data.meta.siteTitle), desc = t(data.meta.siteDescription);
    document.title = title;
    document.querySelector('meta[name=description]').content = desc;
    document.querySelector('meta[property="og:title"]').content = title;
    document.querySelector('meta[property="og:description"]').content = desc;
  }, [lang, data, t]);

  useEffect(() => {
    const root = document.documentElement.style;
    const scroll = () => {
      const d = document.documentElement;
      root.setProperty('--p', (d.scrollTop / (d.scrollHeight - d.clientHeight || 1)).toFixed(4));
    };
    addEventListener('scroll', scroll, { passive: true });
    return () => removeEventListener('scroll', scroll);
  }, []);

  useEffect(() => {
    const key = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette(true); }
    };
    addEventListener('keydown', key);
    return () => removeEventListener('keydown', key);
  }, []);

  if (error) return <pre style={{ padding: '2rem', whiteSpace: 'pre-wrap' }}>Errore caricamento dati / Data load error:{'\n'}{error.message}</pre>;
  if (!data) return null;

  const sections = SECTIONS.filter((s) => s !== 'ai' || data.ai);
  const num = (s) => sections.indexOf(s) + 1;
  const toggleLang = () => setLang(lang === 'it' ? 'en' : 'it');
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(data.meta.email); notify(ctx.ui('copied')); }
    catch { location.href = `mailto:${data.meta.email}`; }
  };

  const actions = [
    ...sections.map((s) => ({
      label: t(data.ui.nav[s]), hint: `#${s}`,
      run: () => document.getElementById(s)?.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth' }),
    })),
    { label: ctx.ui('toggleTheme'), hint: 'theme', run: toggleTheme },
    { label: ctx.ui('toggleLang'), hint: 'IT/EN', run: toggleLang },
    ...(t(data.meta.cv) ? [{ label: ctx.ui('pdf'), hint: 'pdf', run: () => window.open(t(data.meta.cv), '_blank', 'noopener') }] : []),
    { label: ctx.ui('copyEmail'), hint: '@', run: copyEmail },
    ...(import.meta.env.DEV ? ['acid', 'graphite'].map((p) => ({ label: `Palette: ${p}`, hint: 'dev', run: () => setPaletteOverride(p) })) : []),
    ...data.contact.links.filter((l) => safeUrl(l.url)).map((l) => ({ label: l.label, hint: '↗', run: () => window.open(l.url, '_blank', 'noopener') })),
  ];

  return (
    <LangContext.Provider value={ctx}>
      {(() => { const Bg = BACKGROUNDS[data.meta.background]; return Bg && <Bg data={data} />; })()}
      <Cursor />
      <div className="grain" aria-hidden="true" />
      <div className="progress" aria-hidden="true" />
      <Nav data={data} sections={sections} theme={theme} onTheme={toggleTheme} onLang={toggleLang} onPalette={() => setPalette(true)} />
      <main>
        <Hero data={data} />
        <About data={data} n={num('about')} />
        <Experience data={data} n={num('experience')} />
        <Projects data={data} n={num('projects')} />
        {data.ai && <Ai data={data} n={num('ai')} />}
        <Skills data={data} n={num('skills')} />
        <Education data={data} n={num('education')} />
        <Contact data={data} onCopy={copyEmail} />
      </main>
      <footer>© {new Date().getFullYear()} {data.meta.name} · {ctx.ui('footer')}</footer>
      {palette && <Palette actions={actions} onClose={() => setPalette(false)} />}
      <Toast msg={toast} />
      {invalid && <div className="data-error" role="alert">{invalid}</div>}
    </LangContext.Provider>
  );
}
