import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const root = join(dirname(new URL(import.meta.url).pathname), '..', 'public');
const candidates = process.argv[2] ? [process.argv[2]] : [join(root, 'content/data.json'), join(root, 'content/data.example.json')];
const file = candidates.find((f) => existsSync(f));
if (!file) {
  console.error(`check-data: nessun file trovato (${candidates.join(', ')})`);
  process.exit(1);
}

const text = readFileSync(file, 'utf8');
const errors = [];
const warnings = [];

let data;
try {
  data = JSON.parse(text);
} catch (err) {
  const pos = Number((err.message.match(/position (\d+)/) || [])[1]);
  let where = '';
  if (Number.isFinite(pos)) {
    const before = text.slice(0, pos).split('\n');
    where = ` (riga ${before.length}, colonna ${before.at(-1).length + 1})`;
  }
  console.error(`✗ ${file}: JSON non valido${where}\n  ${err.message}`);
  process.exit(1);
}

const get = (path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), data);
const isLoc = (v) => v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length > 0 && Object.keys(v).every((k) => k === 'it' || k === 'en');
const text$ = (v) => typeof v === 'string' || isLoc(v);

const required = {
  'meta.name': 'string', 'meta.initials': 'string', 'meta.email': 'string',
  'meta.siteTitle': 'text', 'meta.siteDescription': 'text',
  'hero.greeting': 'text', 'hero.tagline': 'text', 'hero.roles': 'array', 'hero.marquee': 'array',
  'about.title': 'text', 'about.text': 'text', 'about.facts': 'array', stats: 'array',
  'experience.items': 'array', 'projects.items': 'array', 'skills.groups': 'array',
  'education.items': 'array', 'contact.links': 'array', 'ui.nav': 'object',
};
for (const [path, type] of Object.entries(required)) {
  const v = get(path);
  const ok = type === 'array' ? Array.isArray(v)
    : type === 'object' ? v && typeof v === 'object'
      : type === 'text' ? text$(v)
        : typeof v === type;
  if (!ok) errors.push(`${path}: manca o non è ${type === 'text' ? 'testo o {it, en}' : type}`);
}

if (data.ai) {
  for (const path of ['ai.title', 'ai.intro']) if (!text$(get(path))) errors.push(`${path}: manca o non è testo o {it, en}`);
  for (const path of ['ai.tools', 'ai.practices']) if (!Array.isArray(get(path))) errors.push(`${path}: manca o non è array`);
}

const choices = { 'meta.palette': ['graphite', 'acid'], 'meta.background': ['terminal', 'none'] };
for (const [path, list] of Object.entries(choices)) {
  const v = get(path);
  if (v !== undefined && !list.includes(v)) errors.push(`${path}: "${v}" non valido, usa ${list.join(' | ')}`);
}

const walk = (v, path) => {
  if (Array.isArray(v)) return v.forEach((x, i) => walk(x, `${path}[${i}]`));
  if (!v || typeof v !== 'object') return;
  if (isLoc(v)) {
    if (!('it' in v) || !('en' in v)) warnings.push(`${path}: manca la traduzione ${'it' in v ? 'en' : 'it'}`);
    return;
  }
  for (const [k, x] of Object.entries(v)) {
    const p = path ? `${path}.${k}` : k;
    if (['url', 'link', 'repo'].includes(k) && x != null && !/^(https?:|mailto:)/i.test(x)) errors.push(`${p}: URL non valido "${x}"`);
    if (k === 'level' && !(Number.isInteger(x) && x >= 1 && x <= 5)) errors.push(`${p}: deve essere un intero da 1 a 5`);
    walk(x, p);
  }
};
walk(data, '');

if (data.meta?.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.meta.email)) errors.push(`meta.email: "${data.meta.email}" non sembra un'email`);

for (const key of ['avatar', 'cv', 'ogImage']) {
  for (const f of [data.meta?.[key]].flatMap((v) => (isLoc(v) ? Object.values(v) : v ? [v] : []))) {
    if (!/^https?:/.test(f) && !existsSync(join(root, f))) warnings.push(`meta.${key}: file "${f}" non trovato in public/`);
  }
}

warnings.forEach((w) => console.warn(`! ${w}`));
errors.forEach((e) => console.error(`✗ ${e}`));
if (errors.length) {
  console.error(`\n${file}: ${errors.length} errori`);
  process.exit(1);
}
console.log(`✓ ${file} valido${warnings.length ? ` (${warnings.length} avvisi)` : ''}`);
