import { useLang } from '../i18n.jsx';
import Reveal from './Reveal.jsx';
import SectionHead from './SectionHead.jsx';
import { Card } from './Projects.jsx';

export default function Work({ data, n }) {
  const { t } = useLang();
  const w = data.work;
  return (
    <section className="s wrap" id="work">
      <SectionHead n={n} title={t(w.title)} />
      {w.intro && <Reveal as="p" className="work-intro">{t(w.intro)}</Reveal>}
      <div className="grid">
        {w.items.map((it, i) => <Card key={i} item={it} index={i} />)}
      </div>
    </section>
  );
}
