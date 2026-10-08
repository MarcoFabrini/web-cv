import { useEffect, useRef, useState } from 'react';
import { useLang } from '../i18n.jsx';

export default function Palette({ actions, onClose }) {
  const { ui } = useLang();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const input = useRef(null);
  const list = actions.filter((a) => (a.label + a.hint).toLowerCase().includes(q.trim().toLowerCase()));

  useEffect(() => { input.current?.focus(); }, []);
  useEffect(() => { document.querySelector('.pal li.sel')?.scrollIntoView({ block: 'nearest' }); }, [sel]);

  const run = (a) => { onClose(); a?.run(); };
  const onKey = (e) => {
    const n = list.length || 1;
    if (e.key === 'ArrowDown') { setSel((sel + 1) % n); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { setSel((sel - 1 + n) % n); e.preventDefault(); }
    else if (e.key === 'Enter') run(list[sel]);
    else if (e.key === 'Escape') onClose();
  };

  return (
    <div className="pal open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pal-box" role="dialog" aria-modal="true">
        <input ref={input} type="text" value={q} placeholder={ui('palette')} aria-label={ui('palette')}
          onChange={(e) => { setQ(e.target.value); setSel(0); }} onKeyDown={onKey} />
        <ul role="listbox">
          {list.map((a, i) => (
            <li key={a.label} role="option" aria-selected={i === sel} className={i === sel ? 'sel' : ''}
              onClick={() => run(a)} onMouseMove={() => sel !== i && setSel(i)}>
              <span>{a.label}</span><small>{a.hint}</small>
            </li>
          ))}
        </ul>
        <div className="hint">{ui('paletteHint')}</div>
      </div>
    </div>
  );
}
