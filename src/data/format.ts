// Formatting helpers — the ONLY place numbers become strings.
// Components never format; they render pre-derived strings from the fixtures.

/** 38400 → "38,400" */
export const int = (n: number): string => Math.round(n).toLocaleString('en-US');

/** 58400 → "$58,400" (whole dollars) */
export const money = (n: number): string => `$${Math.round(n).toLocaleString('en-US')}`;

/** 0.42 → "$0.42" (rate, two decimals) */
export const rate = (n: number): string =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** (38400, 50000) → "77%" */
export const pct = (received: number, target: number): string =>
  `${target === 0 ? 0 : Math.round((received / target) * 100)}%`;

/** (38400, 50000) → 77 — the raw integer, for bar widths */
export const pctValue = (received: number, target: number): number =>
  target === 0 ? 0 : Math.round((received / target) * 100);

/** 2148300 → "2.1M" (compact, for the programmatic headline) */
export const compact = (n: number): string =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
