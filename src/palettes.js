import { withDefaultFirst } from './themes.js';

const files = import.meta.glob('./palettes/*.css', { eager: true });
const names = Object.keys(files).map((f) => f.match(/([^/]+)\.css$/)[1]).filter((n) => /^[a-z0-9-]+$/.test(n));

export const PALETTES = withDefaultFirst(names.sort());
