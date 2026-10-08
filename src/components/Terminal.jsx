import { useEffect, useMemo, useState } from 'react';
import { reduceMotion } from '../hooks.js';

const MAX = 34;
const COL_WIDTH = 360;
const countCols = () => Math.max(1, Math.min(5, Math.floor(innerWidth / COL_WIDTH)));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const num = (a, b) => a + Math.floor(Math.random() * (b - a));

function makeGenerator(data) {
  const techs = data.hero.marquee.length ? data.hero.marquee : ['docker', 'node', 'nginx'];
  const projects = data.projects.items.map((p) => p.title.toLowerCase().replace(/\s+/g, '-'));
  const repos = data.projects.items.map((p) => p.repo).filter(Boolean).map((u) => u.replace(/^https?:\/\//, ''));
  const proj = () => pick(projects.length ? projects : ['web-cv']);
  const time = () => new Date().toTimeString().slice(0, 8);
  const lines = [
    () => `$ docker compose up -d --build`,
    () => `✔ Container ${proj()}  Started`,
    () => `$ git pull --rebase`,
    () => repos.length ? `$ git clone ${pick(repos)}` : `$ git status`,
    () => `$ npm run build`,
    () => `✓ built in ${num(300, 1900)}ms`,
    () => `GET /${pick(['', 'api/health', 'content/data.json', 'assets/app.js'])} 200 ${num(1, 40)}ms`,
    () => `[${time()}] ${pick(techs).toLowerCase()}: ok`,
    () => `traefik: router ${proj()}@docker → websecure`,
    () => `$ ssh deploy@server`,
    () => `uptime ${num(12, 240)} days, load ${(Math.random() * 0.4).toFixed(2)}`,
    () => `$ docker ps --format '{{.Names}}'`,
    () => `tests: ${num(40, 180)} passed, 0 failed`,
    () => `# ${pick(techs)} ${pick(['✓', '⚡', '→'])}`,
  ];
  return () => pick(lines)();
}

function Column({ gen, side, delay }) {
  const [lines, setLines] = useState(() => Array.from({ length: MAX - 6 }, gen));
  const [typing, setTyping] = useState({ full: gen(), n: 0 });

  useEffect(() => {
    if (reduceMotion()) return;
    let id, full = gen(), n = 0;
    const step = () => {
      if (n < full.length) {
        n += 1;
        setTyping({ full, n });
        id = setTimeout(step, 28 + Math.random() * 40);
        return;
      }
      const done = full;
      setLines((l) => [...l.slice(-(MAX - 1)), done]);
      full = gen(); n = 0;
      setTyping({ full, n });
      id = setTimeout(step, 700 + Math.random() * 1600);
    };
    id = setTimeout(step, delay);
    return () => clearTimeout(id);
  }, [gen, delay]);

  const row = (text, key, extra = '') => (
    <div key={key} className={`term-line${extra}`}>
      {/^[$✔✓#]/.test(text) ? <><b>{text[0]}</b>{text.slice(1)}</> : text}
    </div>
  );
  return (
    <div className={`term ${side}`} aria-hidden="true">
      {lines.map((t, i) => row(t, i))}
      {row(typing.full.slice(0, typing.n), 'typing', ' live')}
    </div>
  );
}

export default function Terminal({ data }) {
  const gen = useMemo(() => makeGenerator(data), [data]);
  const [cols, setCols] = useState(countCols);
  useEffect(() => {
    const resize = () => setCols(countCols());
    addEventListener('resize', resize);
    return () => removeEventListener('resize', resize);
  }, []);
  return (
    <div className="terminal-bg" style={{ '--cols': cols }}>
      {Array.from({ length: cols }, (_, i) => (
        <Column key={i} gen={gen} side={i % 2 ? 'r' : 'l'} delay={300 + i * 900} />
      ))}
    </div>
  );
}
