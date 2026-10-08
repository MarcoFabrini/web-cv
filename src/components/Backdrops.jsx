import { useEffect, useRef } from 'react';
import { reduceMotion } from '../hooks.js';

export function Grid() {
  const ref = useRef(null);
  useEffect(() => {
    if (reduceMotion() || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const node = ref.current;
    let raf = 0, x = 0, y = 0;
    const paint = () => {
      raf = 0;
      node.style.setProperty('--mx', `${x}px`);
      node.style.setProperty('--my', `${y}px`);
    };
    const move = (e) => {
      x = e.clientX; y = e.clientY;
      node.classList.add('lit');
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const leave = () => node.classList.remove('lit');
    addEventListener('pointermove', move, { passive: true });
    document.addEventListener('mouseleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('pointermove', move);
      document.removeEventListener('mouseleave', leave);
    };
  }, []);
  return <div className="bg-grid" ref={ref} aria-hidden="true"><i /></div>;
}

export const Dots = () => <div className="bg-dots" aria-hidden="true" />;

export const Aurora = () => (
  <div className="bg-aurora" aria-hidden="true"><i /><i /><i /></div>
);
