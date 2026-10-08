import { useEffect, useRef, useState } from 'react';
import { useLang } from '../i18n.jsx';
import { reduceMotion } from '../hooks.js';

const slug = (s) => s.toLowerCase().replace(/\s+/g, '-');
const bare = (u) => u.replace(/^(https?:\/\/(www\.)?|mailto:)/, '').replace(/\/$/, '');

function screens(data, t) {
  const { meta, hero, projects, experience, stats, contact } = data;
  return [
    { tab: 'whoami', cmd: 'whoami', lines: [[meta.name, t(meta.location) || '']].concat(hero.roles.length ? [['', hero.roles.slice(0, 3).map(t).join(' · ')]] : []) },
    { tab: 'stack', cmd: 'cat stack.txt', grid: hero.marquee },
    { tab: 'projects', cmd: 'ls ~/projects', grid: projects.items.map((p) => `${slug(p.title)}/`) },
    { tab: 'git log', cmd: 'git log --oneline', lines: experience.items.slice(0, 4).map((x) => [String(x.start), `${t(x.role)} · ${x.company}`]) },
    { tab: 'uptime', cmd: 'uptime', lines: stats.map((s) => [`${s.value}${s.suffix || ''}`, t(s.label)]) },
    { tab: 'contact', cmd: 'cat contact.txt', lines: [['email', meta.email]].concat(contact.links.map((l) => [l.label.toLowerCase(), bare(l.url)])) },
  ].filter((s) => (s.grid || s.lines).length);
}

export default function Shell({ data }) {
  const { t } = useLang();
  const list = screens(data, t);
  const calm = reduceMotion();
  const ref = useRef(null);
  const tabs = useRef(null);
  const [visible, setVisible] = useState(false);
  const [idx, setIdx] = useState(0);
  const [n, setN] = useState(calm ? Infinity : 0);
  const active = Math.min(idx, list.length - 1);
  const typed = n >= (list[active]?.cmd.length ?? 0);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.4 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const bar = tabs.current, tab = bar?.children[active];
    if (tab && bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: tab.offsetLeft - bar.clientWidth / 2 + tab.offsetWidth / 2, behavior: calm ? 'auto' : 'smooth' });
  }, [active, calm]);

  useEffect(() => {
    if (!visible || typed) return;
    const id = setTimeout(() => setN(n + 1), n ? 55 + Math.random() * 60 : 450);
    return () => clearTimeout(id);
  }, [visible, typed, n]);

  if (!list.length) return null;
  const go = (i) => { setIdx(i); setN(calm ? Infinity : 0); };

  return (
    <div className={`shell${visible ? '' : ' idle'}`} ref={ref}>
      <div className="wrap">
        <div className="shell-tabs" role="tablist" ref={tabs}>
          {list.map((s, i) => (
            <button key={s.tab} role="tab" aria-selected={i === active} className={i === active ? `on${typed ? ' run' : ''}` : ''}
              onClick={() => go(i)} onAnimationEnd={() => go((active + 1) % list.length)}>{s.tab}</button>
          ))}
        </div>
        <div className="shell-screens">
          {list.map((s, i) => {
            const on = i === active, out = on && typed ? ' in' : '';
            const items = s.grid || s.lines;
            return (
              <div key={s.tab} className={`shell-screen${on ? ' on' : ''}`} role="tabpanel" aria-hidden={!on} style={{ '--n': items.length }}>
                <p className="shell-cmd"><b>$</b> {on ? s.cmd.slice(0, n) : s.cmd}{on && !typed && <span className="caret" />}</p>
                {s.grid
                  ? <ul className={`shell-grid${out}`}>{s.grid.map((m, j) => <li key={m} style={{ '--i': j }}>{m}</li>)}</ul>
                  : <ul className={`shell-lines${out}`}>{s.lines.map(([m, x], j) => <li key={j} style={{ '--i': j }}>{m && <b>{m}</b>}{x && <span>{x}</span>}</li>)}</ul>}
                <p className={`shell-cmd shell-end${out}`} aria-hidden="true"><b>$</b> <span className="caret" /></p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
