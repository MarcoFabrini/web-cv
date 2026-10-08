import { useState } from 'react';
import { useLang, safeUrl } from '../i18n.jsx';
import { reduceMotion } from '../hooks.js';
import Reveal from './Reveal.jsx';
import SectionHead from './SectionHead.jsx';

function Card({ item, index }) {
  const { t, ui } = useLang();
  const link = safeUrl(item.link), repo = safeUrl(item.repo);

  const move = (e) => {
    if (reduceMotion() || e.pointerType !== 'mouse') return;
    const c = e.currentTarget, r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    c.style.setProperty('--cx', `${x}px`);
    c.style.setProperty('--cy', `${y}px`);
    c.style.transform = `perspective(800px) rotateX(${(y / r.height - 0.5) * -6}deg) rotateY(${(x / r.width - 0.5) * 6}deg) translateY(-4px)`;
  };
  const leave = (e) => { e.currentTarget.style.transform = ''; };

  return (
    <Reveal as="article" className="card" delay={(index % 3) * 0.1} onPointerMove={move} onPointerLeave={leave}>
      <div className="c-top"><span className="c-no">{String(index + 1).padStart(2, '0')}</span><span>{item.year}</span></div>
      <h3>{item.title}</h3>
      <p>{t(item.description)}</p>
      <div className="tags">{(item.tags ?? []).map((g) => <span key={g} className="tag">{g}</span>)}</div>
      {(link || repo) && (
        <div className="c-links">
          {link && <a href={link} target="_blank" rel="noopener noreferrer">{ui('visit')} ↗</a>}
          {repo && <a href={repo} target="_blank" rel="noopener noreferrer">{ui('code')} ↗</a>}
        </div>
      )}
    </Reveal>
  );
}

export default function Projects({ data, n }) {
  const { t } = useLang();
  const p = data.projects;
  const [chosen, setFilter] = useState('*');
  const tags = [...new Set(p.items.flatMap((i) => i.tags ?? []))].sort();
  const filter = tags.includes(chosen) ? chosen : '*';
  return (
    <section className="s wrap" id="projects">
      <SectionHead n={n} title={t(p.title)} />
      <Reveal className="filters">
        {['*', ...tags].map((g) => (
          <button key={g} className={`chip${filter === g ? ' on' : ''}`} onClick={() => setFilter(g)}>
            {g === '*' ? t(p.all) : g}
          </button>
        ))}
      </Reveal>
      <div className="grid">
        {p.items.map((it, i) => (filter === '*' || it.tags?.includes(filter)) && <Card key={it.title} item={it} index={i} />)}
      </div>
    </section>
  );
}
