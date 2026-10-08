import { useLang } from '../i18n.jsx';
import Reveal from './Reveal.jsx';
import SectionHead from './SectionHead.jsx';

export default function Ai({ data, n }) {
  const { t } = useLang();
  const a = data.ai;
  return (
    <section className="s wrap" id="ai">
      <SectionHead n={n} title={t(a.title)} />
      <div className="ai">
        <div>
          <Reveal as="p" className="ai-intro">{t(a.intro)}</Reveal>
          <Reveal className="ai-tools" delay={0.1}>
            {(a.tools ?? []).map((tool, i) => <span key={i} className="tag">{t(tool)}</span>)}
          </Reveal>
          {a.session?.length > 0 && (
            <Reveal className="ai-term" delay={0.2} aria-hidden="true">
              <div className="ai-term-bar"><i /><i /><i /></div>
              <pre>
                {a.session.map((line, i) => {
                  const text = t(line);
                  const mark = /^[$>✓]/.test(text) ? text[0] : '';
                  return <span key={i}>{mark && <b>{mark}</b>}{mark ? text.slice(1) : text}{'\n'}</span>;
                })}
              </pre>
            </Reveal>
          )}
        </div>
        <ol className="flow">
          {(a.practices ?? []).map((p, i) => (
            <Reveal as="li" key={i} delay={i * 0.08}>
              <span className="flow-no">{String(i + 1).padStart(2, '0')}</span>
              <div><h3>{t(p.title)}</h3><p>{t(p.text)}</p></div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
