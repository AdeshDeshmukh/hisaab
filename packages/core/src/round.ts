/**
 * Round half-up as required by CBIC GST rounding rules.
 *
 * 0.5 always rounds up: `0.5 → 1, 1.5 → 2, 2.5 → 3`.
 * Do NOT replace with banker's rounding — it diverges
 * on odd-paise totals.
 *
 * Odd-paise drift risk: when intra-state tax splits into
 * CGST/SGST, an odd total gives CGST the extra 1 paise
 * (see `split()` and `docs/rounding.md`).
 *
 * @param n - value in paise (may be fractional before rounding)
 * @returns integer paise
 */
export function roundHalfUp(n: number): number {
  return Math.floor(n + 0.5);
}

/**
 * Round half-to-even (banker's rounding) — reference only, NOT used in hisaab.
 *
 * `2.5 → 2, 3.5 → 4`. Kept so contributors see why GST
 * mandates half-up instead: using this here would misallocate
 * the odd-paise CGST/SGST split by 1 paise.
 *
 * @param n - value in paise
 * @returns integer paise
 */
export function roundHalfToEven(n: number): number {
  const floor = Math.floor(n);
  const diff = n - floor;
  if (Math.abs(diff - 0.5) < Number.EPSILON) {
    return floor % 2 === 0 ? floor : floor + 1;
  }
  return Math.round(n);
}
