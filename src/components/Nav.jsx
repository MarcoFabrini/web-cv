import { useEffect, useState } from 'react';
import { useLang } from '../i18n.jsx';
import { useScrollSpy } from '../hooks.js';

export const SECTIONS = ['about', 'experience', 'projects', 'ai', 'skills', 'education', 'contact'];

const ICONS = {
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
};
const Icon = ({ name }) => <svg viewBox="0 0 24 24">{ICONS[name]}</svg>;

export default function Nav({ data, sections, theme, onTheme, onLang, onPalette }) {
  const { lang, t, ui } = useLang();
  const active = useScrollSpy(sections);
  const [menu, setMenu] = useState(false);
  const { initials } = data.meta;

  useEffect(() => {
    if (!menu) return;
    document.body.style.overflow = 'hidden';
    const key = (e) => e.key === 'Escape' && setMenu(false);
    addEventListener('keydown', key);
    return () => { document.body.style.overflow = ''; removeEventListener('keydown', key); };
  }, [menu]);

  return (
    <>
      <header className="nav">
        <div className="wrap">
          <a className="brand" href="#top" aria-label="Home">{initials[0]}<i>{initials.slice(1) || '.'}</i></a>
          <nav className="links" aria-label="Sections">
            {sections.map((s) => (
              <a key={s} href={`#${s}`} className={active === s ? 'on' : ''}>{t(data.ui.nav[s])}</a>
            ))}
          </nav>
          <div className="tools">
            <button className="btn-i hide-sm" aria-label={ui('palette')} title="Ctrl/⌘ + K" onClick={onPalette}><Icon name="search" /></button>
            <button className="btn-i" aria-label={ui('toggleLang')} title={ui('toggleLang')} onClick={onLang}>{lang === 'it' ? 'EN' : 'IT'}</button>
            <button className="btn-i" aria-label={ui('toggleTheme')} title={ui('toggleTheme')} onClick={onTheme}>
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
            </button>
            <button className={`btn-i burger${menu ? ' x' : ''}`} aria-label="Menu" aria-expanded={menu} onClick={() => setMenu(!menu)}>
              <span /><span />
            </button>
          </div>
        </div>
      </header>

      <div className={`menu${menu ? ' open' : ''}`} aria-hidden={!menu}>
        <nav aria-label="Menu">
          {sections.map((s, i) => (
            <a key={s} href={`#${s}`} tabIndex={menu ? 0 : -1} className={active === s ? 'on' : ''}
              style={{ '--i': i }} onClick={() => setMenu(false)}>
              <small>0{i + 1}</small>{t(data.ui.nav[s])}
            </a>
          ))}
        </nav>
        <p className="menu-foot">{data.meta.email}</p>
      </div>
    </>
  );
}
