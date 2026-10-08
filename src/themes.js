export const DEFAULT_PALETTE = 'graphite';
export const BACKGROUNDS = ['terminal', 'grid', 'dots', 'aurora', 'none'];

export const choose = (value, list) => (list.includes(value) ? value : list[0]);
export const withDefaultFirst = (names) =>
  names.includes(DEFAULT_PALETTE) ? [DEFAULT_PALETTE, ...names.filter((n) => n !== DEFAULT_PALETTE)] : names;
