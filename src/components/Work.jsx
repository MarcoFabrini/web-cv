import { useLang } from '../i18n.jsx';
import Reveal from './Reveal.jsx';
import SectionHead from './SectionHead.jsx';
import { Card } from './Projects.jsx';

export default function Work({ data, n }) {
  const { t } = useLang();
  const w = data.work;
  const intro = t(w.intro);
  return (
    <section className="s wrap" id="work">
      <SectionHead n={n} title={t(w.title)} />
      {intro && <Reveal as="p" className="work-intro">{intro}</Reveal>}
      <div className="grid">
        {w.items.map((it, i) => <Card key={i} item={it} index={i} />)}
      </div>
    </section>
  );
}
