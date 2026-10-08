import { useEffect, useState } from 'react';

export default function Toast({ msg }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!msg) return;
    setOn(true);
    const id = setTimeout(() => setOn(false), 1800);
    return () => clearTimeout(id);
  }, [msg]);
  return msg ? <div className={`toast${on ? ' on' : ''}`} role="status">{msg.text}</div> : null;
}
