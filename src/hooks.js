import { useEffect, useRef, useState } from 'react';

export const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useData(urls) {
  const [state, setState] = useState({ data: null, error: null, invalid: null });
  const key = urls.join('|');
  useEffect(() => {
    let raw = null, stop = false;
    const fetchFirst = async () => {
      for (const url of urls) {
        const res = await fetch(url, { cache: 'no-store' }).catch(() => null);
        if (res?.ok && (res.headers.get('content-type') || '').includes('json')) return res.text();
      }
      throw new Error(`${urls.join(', ')}: not found`);
    };
    const load = async (first) => {
      let text;
      try {
        text = await fetchFirst();
      } catch (error) {
        if (first) setState({ data: null, error, invalid: null });
        return;
      }
      if (text === raw || stop) return;
      raw = text;
      try {
        setState({ data: JSON.parse(text), error: null, invalid: null });
      } catch (err) {
        const error = new Error(`data.json: ${err.message}`);
        setState((s) => (s.data ? { ...s, invalid: error.message } : { data: null, error, invalid: null }));
      }
    };
    load(true);
    const id = import.meta.env.DEV ? setInterval(load, 1500) : null;
    return () => { stop = true; clearInterval(id); };
  }, [key]);
  return state;
}

export function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || seen) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); io.disconnect(); }
    }, { threshold });
    io.observe(node);
    return () => io.disconnect();
  }, [seen, threshold]);
  return [ref, seen];
}

export function useTypewriter(words) {
  const [text, setText] = useState(reduceMotion() ? words[0] ?? '' : '');
  const key = words.join('|');
  useEffect(() => {
    if (reduceMotion() || !words.length) { setText(words[0] ?? ''); return; }
    let r = 0, c = 0, del = false, id;
    const tick = () => {
      const word = words[r];
      c += del ? -1 : 1;
      setText(word.slice(0, c));
      let wait = del ? 28 : 65;
      if (!del && c === word.length) { del = true; wait = 1700; }
      else if (del && c === 0) { del = false; r = (r + 1) % words.length; wait = 350; }
      id = setTimeout(tick, wait);
    };
    tick();
    return () => clearTimeout(id);
  }, [key]);
  return text;
}

export function useCountUp(to, active) {
  const dec = String(to).includes('.') ? 1 : 0;
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (reduceMotion()) { setN(to); return; }
    let raf;
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min((now - t0) / 1400, 1);
      setN(to * (1 - Math.pow(1 - p, 4)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, active]);
  return n.toFixed(dec);
}

export function useScrollSpy(ids) {
  const [active, setActive] = useState('');
  const key = ids.join('|');
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
    }, { rootMargin: '-45% 0px -50% 0px' });
    ids.forEach((id) => { const n = document.getElementById(id); if (n) io.observe(n); });
    return () => io.disconnect();
  }, [key]);
  return active;
}

export function useFileExists(url) {
  const [ok, setOk] = useState(null);
  useEffect(() => {
    if (!url) { setOk(false); return; }
    let stop = false;
    fetch(url, { method: 'HEAD', cache: 'no-store' })
      .then((r) => !stop && setOk(r.ok && !(r.headers.get('content-type') || '').includes('text/html')))
      .catch(() => !stop && setOk(false));
    return () => { stop = true; };
  }, [url]);
  return ok;
}
