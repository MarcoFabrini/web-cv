import { useLang } from '../i18n.jsx';
import { useCountUp, useInView } from '../hooks.js';
import Reveal from './Reveal.jsx';
import SectionHead from './SectionHead.jsx';

function Stat({ stat }) {
  const { t } = useLang();
  const [ref, seen] = useInView();
  const value = useCountUp(stat.value, seen);
  return (
    <div className="stat" ref={ref}>
      <b>{value}<i>{stat.suffix || ''}</i></b>
      <small>{t(stat.label)}</small>
    </div>
  );
}

export default function About({ data, n }) {
  const { t } = useLang();
  const a = data.about;
  return (
    <section className="s wrap" id="about">
      <SectionHead n={n} title={t(a.title)} />
      <div className="about">
        <Reveal>{[].concat(t(a.text)).map((p, i) => <p key={i}>{p}</p>)}</Reveal>
        <Reveal as="ul" className="facts" delay={0.15}>
          {a.facts.map((f, i) => (
            <li key={i}><span className="k">{t(f.label)}</span><span className="v">{t(f.value)}</span></li>
          ))}
        </Reveal>
      </div>
      <Reveal className="stats" style={{ '--n': Math.min(data.stats.length, 4) || 1 }}>
        {data.stats.map((s, i) => <Stat key={i} stat={s} />)}
      </Reveal>
    </section>
  );
}
