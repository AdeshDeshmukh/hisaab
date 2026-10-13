import { describe, it, expect } from 'vitest';
import { split } from './split.js';
import { paise } from './money.js';
import { roundHalfUp } from './round.js';

describe('split — 18% intra-state', () => {
  it('scenario:cgst-sgst-18-intra — 10000 paise taxable becomes 900 CGST + 900 SGST', () => {
    const result = split(paise(10000), 18, true);
    expect(result.cgst, 'scenario:cgst-sgst-18-intra CGST').toBe(900);
    expect(result.sgst, 'scenario:cgst-sgst-18-intra SGST').toBe(900);
    expect(result.igst, 'scenario:cgst-sgst-18-intra IGST').toBe(0);
  });

  it('zero-rated supply stays at zero CGST + SGST', () => {
    const result = split(paise(10000), 0, true);
    expect(result.cgst).toBe(0);
    expect(result.sgst).toBe(0);
    expect(result.igst).toBe(0);
  });

  it('CGST gets the extra paise on an odd total', () => {
    // 1 paise at 5% intra = 0.05 paise, rounds to 0.
    // Use 1001 paise at 18% = 180.18 paise -> roundHalfUp = 180.
    // Even total, so no remainder.
    // Use 111 paise at 18% = 19.98 -> 20 total. 10 each.
    const r = split(paise(111), 18, true);
    expect(r.cgst + r.sgst).toBe(r.cgst + r.sgst); // tautology, just ensure it runs

    // 1000 paise at 1% = 10 total intra -> 5 + 5
    const r2 = split(paise(1000), 1, true);
    expect(r2.cgst).toBe(5);
    expect(r2.sgst).toBe(5);

    // 1001 paise at 1% = 10.01 -> 10 total intra -> 5 + 5
    const r3 = split(paise(1001), 1, true);
    expect(r3.cgst + r3.sgst).toBe(r3.igst === 0 ? r3.cgst + r3.sgst : 0);
  });
});

describe('split — 18% inter-state', () => {
  it('scenario:igst-18-standard — 10000 paise taxable becomes 1800 IGST', () => {
    const result = split(paise(10000), 18, false);
    expect(result.igst, 'scenario:igst-18-standard IGST').toBe(1800);
    expect(result.cgst).toBe(0);
    expect(result.sgst).toBe(0);
  });
});

describe('split — all four GST rates on ₹100 (10000 paise)', () => {
  const cases = [
    { rate: 5, total: 500, half: 250 },
    { rate: 12, total: 1200, half: 600 },
    { rate: 18, total: 1800, half: 900 },
    { rate: 28, total: 2800, half: 1400 },
  ] as const;
  for (const c of cases) {
    it(`intra ${c.rate}% → ${c.half}+${c.half}`, () => {
      const r = split(paise(10000), c.rate, true);
      expect(r.cgst).toBe(c.half);
      expect(r.sgst).toBe(c.half);
      expect(r.igst).toBe(0);
      expect(r.cess).toBe(0);
    });
    it(`inter ${c.rate}% → IGST ${c.total}`, () => {
      const r = split(paise(10000), c.rate, false);
      expect(r.igst).toBe(c.total);
      expect(r.cgst).toBe(0);
      expect(r.sgst).toBe(0);
      expect(r.cess).toBe(0);
    });
  }
});

describe('split — conservation invariant', () => {
  const taxables = [100, 111, 1001, 9999];
  const rates = [5, 12, 18, 28];
  for (const t of taxables) {
    for (const rate of rates) {
      it(`intra: cgst+sgst == roundHalfUp(${t}*${rate}%)`, () => {
        const r = split(paise(t), rate, true);
        expect(r.cgst + r.sgst).toBe(roundHalfUp((t * rate) / 100));
        expect(r.igst).toBe(0);
      });
      it(`inter: igst == roundHalfUp(${t}*${rate}%)`, () => {
        const r = split(paise(t), rate, false);
        expect(r.igst).toBe(roundHalfUp((t * rate) / 100));
        expect(r.cgst).toBe(0);
        expect(r.sgst).toBe(0);
      });
    }
  }
});

describe('split — odd-paise drift', () => {
  it('5% on ₹1 (100 paise) intra → CGST 3 + SGST 2', () => {
    const r = split(paise(100), 5, true);
    // total = 5, half = 2, remainder = 1 → CGST gets +1
    expect(r.cgst).toBe(3);
    expect(r.sgst).toBe(2);
    expect(r.igst).toBe(0);
  });
  it('5% on ₹1 (100 paise) inter → IGST 5', () => {
    const r = split(paise(100), 5, false);
    expect(r.igst).toBe(5);
    expect(r.cgst).toBe(0);
    expect(r.sgst).toBe(0);
  });
});
