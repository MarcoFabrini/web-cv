import { useLang } from '../i18n.jsx';
import Reveal from './Reveal.jsx';
import SectionHead from './SectionHead.jsx';

export default function Education({ data, n }) {
  const { t } = useLang();
  const e = data.education;
  return (
    <section className="s wrap" id="education">
      <SectionHead n={n} title={t(e.title)} />
      <Reveal as="ul" className="edu">
        {e.items.map((it, i) => (
          <li key={i}>
            <span className="y">{it.year}</span>
            <div><b>{t(it.title)}</b><span>{t(it.place)}</span></div>
          </li>
        ))}
      </Reveal>
    </section>
  );
}
