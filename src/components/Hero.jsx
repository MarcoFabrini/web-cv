import { useState } from 'react';
import { useLang } from '../i18n.jsx';
import { useFileExists, useTypewriter } from '../hooks.js';
import Shell from './Shell.jsx';

export default function Hero({ data }) {
  const { t, ui } = useLang();
  const { meta, hero } = data;
  const [first, ...rest] = meta.name.split(' ');
  const typed = useTypewriter(hero.roles.map(t));
  const [badAvatar, setBadAvatar] = useState(null);
  const cv = t(meta.cv);
  const cvOk = useFileExists(cv);
  return (
    <div id="top">
      <section className="hero wrap">
        {meta.available && <div className="badge"><span className="dot" />{ui('available')}</div>}
        <div className="hero-top">
          <div>
            <p className="greet">{t(hero.greeting)}</p>
            <h1 className="name" aria-label={meta.name}>
              <span>{first}</span>
              <span className="l2">{rest.join(' ')}</span>
            </h1>
          </div>
          {meta.avatar && meta.avatar !== badAvatar && (
            <div className="avatar">
              <img src={meta.avatar} alt={meta.name} width="340" height="340" onError={() => setBadAvatar(meta.avatar)} />
            </div>
          )}
        </div>
        <p className="role"><span className="pre">&gt; </span><span>{typed}</span><span className="caret" /></p>
        <p className="tagline">{t(hero.tagline)}</p>
        <div className="cta">
          <a className="btn pri" href="#contact">{ui('email')} ↗</a>
          {cvOk && <a className="btn" href={cv} download>{ui('pdf')} ↓</a>}
        </div>
        <span className="scrollhint">{ui('scroll')}</span>
      </section>
      <Shell data={data} />
    </div>
  );
}
