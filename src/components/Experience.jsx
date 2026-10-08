import { useState } from 'react';
import { useLang } from '../i18n.jsx';
import Reveal from './Reveal.jsx';
import SectionHead from './SectionHead.jsx';

function Item({ item, index }) {
  const { t, ui } = useLang();
  const [open, setOpen] = useState(index === 0);
  return (
    <Reveal className={`xp-item${open ? ' open' : ''}`} delay={index * 0.08}>
      <button className="xp-head" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="xp-per">{item.start} — {item.end ?? ui('present')}</span>
        <span className="xp-role">{t(item.role)}<small>{item.company}</small></span>
        <span className="xp-plus" aria-hidden="true">+</span>
      </button>
      <div className="xp-body">
        <div>
          <p>{t(item.summary)}</p>
          <ul>{(item.bullets ?? []).map((b, i) => <li key={i}>{t(b)}</li>)}</ul>
        </div>
      </div>
    </Reveal>
  );
}

export default function Experience({ data, n }) {
  const { t } = useLang();
  const x = data.experience;
  return (
    <section className="s wrap" id="experience">
      <SectionHead n={n} title={t(x.title)} />
      <div className="xp">{x.items.map((it, i) => <Item key={i} item={it} index={i} />)}</div>
    </section>
  );
}
