import { useLang, safeUrl } from '../i18n.jsx';
import Reveal from './Reveal.jsx';

export default function Contact({ data, onCopy }) {
  const { t, ui } = useLang();
  const c = data.contact;
  const words = t(c.title).split(' ');
  const last = words.pop();
  return (
    <section className="s wrap" id="contact">
      <Reveal className="contact">
        <h2>{words.length > 0 && `${words.join(' ')} `}<em>{last}</em></h2>
        <p>{t(c.text)}</p>
        <div className="cta">
          <a className="btn pri" href={safeUrl(`mailto:${data.meta.email}`)}>{data.meta.email}</a>
          <button className="btn" onClick={onCopy}>{ui('copyEmail')}</button>
          {c.links.filter((l) => safeUrl(l.url)).map((l) => (
            <a key={l.label} className="btn" href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
