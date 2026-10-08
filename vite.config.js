import { readdirSync, readFileSync } from 'node:fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { BACKGROUNDS, choose, withDefaultFirst } from './src/themes.js';

const PALETTE_DIR = 'src/palettes';
const VALID_NAME = /^[a-z0-9-]+$/;

function themeFromEnv(env) {
  const warned = new Set();
  const warn = (text) => { if (!warned.has(text)) { warned.add(text); console.warn(text); } };

  const palettes = () => {
    const names = readdirSync(PALETTE_DIR).filter((f) => f.endsWith('.css')).map((f) => f.slice(0, -4)).sort();
    for (const name of names) {
      if (!VALID_NAME.test(name)) warn(`${PALETTE_DIR}/${name}.css: usa solo minuscole, numeri e trattini nel nome`);
      else if (!readFileSync(`${PALETTE_DIR}/${name}.css`, 'utf8').includes(`data-palette="${name}"`))
        warn(`${PALETTE_DIR}/${name}.css: il selettore deve essere [data-palette="${name}"]`);
    }
    return withDefaultFirst(names.filter((n) => VALID_NAME.test(n)));
  };

  const read = (key, list) => {
    const value = (env[key] || '').trim();
    if (value && !list.includes(value)) warn(`${key}="${value}" non valido, uso "${list[0]}" (valori: ${list.join(', ')})`);
    return choose(value, list);
  };

  return {
    name: 'web-cv-theme',
    transformIndexHtml(html) {
      const lists = { palette: palettes(), background: BACKGROUNDS };
      const theme = { palette: read('PALETTE', lists.palette), background: read('BACKGROUND', lists.background) };
      return html.replace(/<meta name="cv-(palette|background)"[^>]*>/g, (_, key) =>
        `<meta name="cv-${key}" content="${theme[key]}" data-options="${lists[key].join(' ')}">`);
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), themeFromEnv(loadEnv(mode, process.cwd(), ''))],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    watch: { usePolling: true },
  },
}));
