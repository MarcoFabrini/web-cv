import { useEffect, useRef, useState } from 'react';
import createGlobe from 'cobe';
import { useLang } from '../i18n.jsx';
import { reduceMotion } from '../hooks.js';
import Reveal from './Reveal.jsx';
import SectionHead from './SectionHead.jsx';

const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const DEG = 180 / Math.PI;
const anchors = typeof CSS !== 'undefined' && CSS.supports('anchor-name', '--a');

const skillList = (skills) => skills.items ?? (skills.groups ?? []).flatMap((g) => g.items ?? []);

const spread = (n) => Array.from({ length: n }, (_, i) => {
  const y = 0.8 * (1 - (2 * i + 1) / n);
  return [Math.asin(y) * DEG, ((i * GOLDEN * DEG) % 360) - 180];
});

function rgb(name) {
  const probe = document.createElement('i');
  probe.style.color = `var(${name})`;
  document.body.append(probe);
  const [r, g, b] = getComputedStyle(probe).color.match(/[\d.]+/g).map(Number);
  probe.remove();
  return [r / 255, g / 255, b / 255];
}

function colors() {
  const dark = document.documentElement.dataset.theme !== 'light';
  return {
    dark: dark ? 1 : 0,
    baseColor: rgb('--card'),
    markerColor: rgb('--acc'),
    glowColor: rgb(dark ? '--card' : '--bg'),
    mapBrightness: dark ? 5 : 0.7,
  };
}

const Dots = ({ level }) => (
  <span className="dots" role="img" aria-label={`${level}/5`}>
    {[1, 2, 3, 4, 5].map((n) => <i key={n} className={n <= level ? 'f' : ''} />)}
  </span>
);

const label = (item) => (item.level ? `${item.name} ${item.level}/5` : item.name);

function Logo({ item, i, on }) {
  const src = item.logo ? new URL(item.logo, document.baseURI).href : null;
  const [ratio, setRatio] = useState(src ? 1 : 0);
  useEffect(() => {
    if (!src) return setRatio(0);
    const img = new Image();
    img.onload = () => setRatio(img.naturalWidth / img.naturalHeight || 1);
    img.onerror = () => setRatio(0);
    img.src = src;
  }, [src]);
  const ok = ratio > 0;
  return (
    <span className={`globe-logo${ok ? (ratio > 1.6 ? ' wide' : '') : ' txt'}${on ? ' on' : ''}`} data-name={item.name} data-i={i} aria-hidden="true"
      style={{ '--a': `--cobe-sk${i}`, '--v': `var(--cobe-visible-sk${i}, 0)`, '--logo': ok ? `url("${src}")` : undefined, '--r': ratio }}>
      {!ok && item.name}
      <span className="globe-tip"><b>{item.name}</b>{item.level > 0 && <Dots level={item.level} />}</span>
    </span>
  );
}

function Globe({ items }) {
  const wrap = useRef(null);
  const box = useRef(null);
  const count = items.length;
  const [active, setActive] = useState(-1);
  const pinned = useRef(false);
  const kick = useRef(null);

  useEffect(() => {
    pinned.current = active >= 0;
    kick.current?.();
  }, [active]);

  useEffect(() => {
    const el = box.current, area = wrap.current;
    const canvas = document.createElement('canvas');
    el.append(canvas);
    const spin = reduceMotion() ? 0 : 0.18;
    let phi = 0, theta = 0.2, drag = null, held = false, raf = 0, last = 0, visible = false;
    const globe = createGlobe(canvas, {
      devicePixelRatio: Math.min(devicePixelRatio || 1, 2),
      width: el.clientWidth || 1, height: el.clientWidth || 1,
      phi, theta, diffuse: 1.2, scale: 1, mapSamples: 16000, markerElevation: 0.02,
      markers: spread(count).map((location, i) => ({ location, size: 0, id: `sk${i}` })),
      ...colors(),
    });

    const frame = (now) => {
      raf = 0;
      if (!drag && !held && !pinned.current) phi += spin * Math.min(now - (last || now), 50) / 1000;
      last = now;
      globe.update({ phi, theta });
      if (visible && ((spin && !held && !pinned.current) || drag)) raf = requestAnimationFrame(frame);
    };
    const start = () => { if (!raf && visible) { last = 0; raf = requestAnimationFrame(frame); } };
    kick.current = start;
    const hold = (e) => {
      if (e.pointerType !== 'mouse') return;
      held = e.type === 'pointerover' && Boolean(e.target.closest('.globe-logo'));
      start();
    };

    const down = (e) => {
      drag = { x: e.clientX, y: e.clientY, phi, theta };
      area.setPointerCapture(e.pointerId);
      area.classList.add('drag');
      start();
    };
    const move = (e) => {
      if (!drag) return;
      phi = drag.phi + (e.clientX - drag.x) / 160;
      theta = Math.max(-0.6, Math.min(0.9, drag.theta + (e.clientY - drag.y) / 320));
    };
    const up = (e) => {
      if (drag && e.pointerType !== 'mouse' && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 8) {
        const hit = document.elementFromPoint(e.clientX, e.clientY)?.closest('.globe-logo');
        const i = hit ? Number(hit.dataset.i) : -1;
        setActive((a) => (a === i ? -1 : i));
      }
      drag = null;
      area.classList.remove('drag');
    };
    area.addEventListener('pointerdown', down);
    area.addEventListener('pointermove', move);
    area.addEventListener('pointerup', up);
    area.addEventListener('pointercancel', up);
    area.addEventListener('pointerover', hold);
    area.addEventListener('pointerout', hold);

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); });
    io.observe(el);
    const ro = new ResizeObserver(() => { const s = el.clientWidth || 1; globe.update({ width: s, height: s }); });
    ro.observe(el);
    const mo = new MutationObserver(() => globe.update(colors()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-palette'] });

    return () => {
      kick.current = null;
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect(); mo.disconnect();
      area.removeEventListener('pointerdown', down);
      area.removeEventListener('pointermove', move);
      area.removeEventListener('pointerup', up);
      area.removeEventListener('pointercancel', up);
      area.removeEventListener('pointerover', hold);
      area.removeEventListener('pointerout', hold);
      globe.destroy();
      el.replaceChildren();
    };
  }, [count]);

  return (
    <div className="globe" ref={wrap}>
      <div className="globe-gl" ref={box} />
      {items.map((it, i) => <Logo key={`${i}-${it.name}`} item={it} i={i} on={i === active} />)}
    </div>
  );
}

export default function Skills({ data, n }) {
  const { t } = useLang();
  const s = data.skills;
  const items = skillList(s);
  return (
    <section className="s wrap" id="skills">
      <SectionHead n={n} title={t(s.title)} />
      <Reveal className="skills">
        {anchors && items.length > 0 && <Globe items={items} />}
        <ul className={anchors ? 'sr' : 'skill-chips'}>{items.map((it, i) => <li key={i}>{label(it)}</li>)}</ul>
      </Reveal>
    </section>
  );
}
