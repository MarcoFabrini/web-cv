import { useEffect, useRef } from 'react';
import { reduceMotion } from '../hooks.js';

const HOVER = 'a, button, input, .card, .chip, .xp-head';

export default function Cursor() {
  const ring = useRef(null);
  useEffect(() => {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const node = ring.current;
    const calm = reduceMotion();
    let tx = innerWidth / 2, ty = innerHeight / 3, rx = tx, ry = ty, raf, seen = false;

    const move = (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!seen) { seen = true; rx = tx; ry = ty; node.classList.add('show'); }
      node.classList.toggle('hot', !!e.target.closest?.(HOVER));
    };
    const down = () => node.classList.add('down');
    const up = () => node.classList.remove('down');
    const leave = () => node.classList.remove('show');
    const enter = () => seen && node.classList.add('show');

    const frame = () => {
      const k = calm ? 1 : 0.2;
      rx += (tx - rx) * k; ry += (ty - ry) * k;
      node.style.transform = `translate(${rx.toFixed(1)}px, ${ry.toFixed(1)}px)`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    addEventListener('pointermove', move, { passive: true });
    addEventListener('pointerdown', down);
    addEventListener('pointerup', up);
    document.addEventListener('mouseleave', leave);
    document.addEventListener('mouseenter', enter);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('pointermove', move);
      removeEventListener('pointerdown', down);
      removeEventListener('pointerup', up);
      document.removeEventListener('mouseleave', leave);
      document.removeEventListener('mouseenter', enter);
    };
  }, []);
  return <div className="cursor" ref={ring} aria-hidden="true"><i /></div>;
}
