# @hisaab/core

Pure GST math for hisaab: tax splitting, quoting, rounding,
state lookup, and HSN chapters. No I/O, no network —
integer paise in, integer paise out.

## Why Paise (not float)

IEEE 754 floats cannot represent most decimals exactly:

```typescript
console.log(0.1 + 0.2); // 0.30000000000000004 — not 0.3
```

A 1-paise error repeated across thousands of invoices is a GST
compliance issue. So every amount in `@hisaab/core` is an integer
in paise (`1 INR = 100 paise`).

## Usage

```typescript
import { paise, paiseToBigDecimalString } from '@hisaab/core';

const taxable = paise(10050); // ₹100.50 — OK
paise(100.5); // throws TypeError: Expected integer paise

paiseToBigDecimalString(taxable); // "100.50"
```

The `Paise` type is a branded integer
(`number & { readonly __brand: 'Paise' }`), so plain floats can't
slip in at compile time, and the `paise()` constructor rejects
non-integers at runtime.

## API map

- `split()` — splits tax into CGST/SGST (intra-state) or IGST (inter-state) plus cess.
- `quote()` — full line-item quote: validates states, splits tax, returns totals.
- `roundHalfUp()` — CBIC GST rounding; see odd-paise note in `split()`.
- `lookupState()` / `isIntraState()` — all 38 Indian state/UT codes.
- `lookupHsnChapter()` — HSN chapter lookup.

## Deeper reading

- [Money: paise, not floats](../../docs/money.md)
- [Rounding](../../docs/rounding.md)
