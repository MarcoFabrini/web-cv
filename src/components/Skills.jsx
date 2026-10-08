import { useLang } from '../i18n.jsx';
import Reveal from './Reveal.jsx';
import SectionHead from './SectionHead.jsx';

const Dots = ({ level }) => (
  <span className="dots" role="img" aria-label={`${level}/5`}>
    {[1, 2, 3, 4, 5].map((n) => <i key={n} className={n <= level ? 'f' : ''} style={{ '--i': n }} />)}
  </span>
);

export default function Skills({ data, n }) {
  const { t } = useLang();
  const s = data.skills;
  return (
    <section className="s wrap" id="skills">
      <SectionHead n={n} title={t(s.title)} />
      <div className="skills">
        {s.groups.map((g, gi) => (
          <Reveal key={gi} className="sk" delay={gi * 0.12}>
            <h3>{t(g.name)}</h3>
            <ul>{g.items.map((it) => <li key={it.name}><span>{it.name}</span><Dots level={it.level} /></li>)}</ul>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
