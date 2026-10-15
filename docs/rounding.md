# Rounding in hisaab

GST calculations sometimes produce fractional paise. hisaab uses **half-up rounding** throughout.

## Half-up rounding

Round 0.5 away from zero (toward positive infinity for positive numbers).

```
roundHalfUp(0.4) = 0
roundHalfUp(0.5) = 1   ← rounds up
roundHalfUp(1.5) = 2   ← rounds up
roundHalfUp(2.5) = 3   ← rounds up
```

## Why not banker's rounding?

JavaScript's `Math.round` uses half-up for positive numbers, but the CBIC rounding rules and most Indian accounting software use half-up consistently. Banker's rounding (round-half-to-even) would produce different results on odd-paise invoices.

## Where this is enforced

The `roundHalfUp` function lives in `packages/core/src/round.ts`. Every tax calculation goes through it.

## Odd-Paise Drift

When the total GST on an intra-state supply is an **odd** number of paise, it cannot be divided into two equal halves. hisaab resolves this with one fixed rule: **CGST always gets the extra paisa.**

### How it works

`split()` in `packages/core/src/split.ts` works in two steps:

1. It computes the total tax once and rounds it half-up: `totalTax = roundHalfUp(taxable × rate / 100)`.
2. It splits that whole-paise total between CGST and SGST:

```
sgst = floor(totalTax / 2)
cgst = totalTax − sgst      // = ceil(totalTax / 2)
```

So the two halves always add back to the total (`cgst + sgst === totalTax`). The difference between them is never more than 1 paisa, and CGST is never smaller than SGST. If the total is even, both halves are equal.

### Examples

| Total Tax | CGST | SGST |
| --------- | ---- | ---- |
| 1p        | 1p   | 0p   |
| 3p        | 2p   | 1p   |
| 5p        | 3p   | 2p   |

A realistic case: ₹101.00 (10100 paise) at 5% GST gives a total tax of 505p. That splits into CGST 253p and SGST 252p.

### Notes

- This applies only to **intra-state** supplies. For inter-state supplies the whole amount goes to IGST, so there is nothing to split.
- Cess is calculated separately and is not affected by this rule.
- The total is rounded **before** it is split. The rule does not round each half separately, which could make the halves add up to a different total.

## Scenarios that use this

- `round-half-up-odd` — 1-paise remainder goes to CGST
- `cgst-sgst-18-intra` — 10000 paise × 9% = exactly 900 paise (no remainder)
