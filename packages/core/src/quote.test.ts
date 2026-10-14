import { describe, it, expect } from 'vitest';
import { quote } from './quote.js';
import { paise } from './money.js';
import type { QuoteError } from './index.js';

describe('quote — unknown state codes', () => {
  it("unknown seller '00' returns UNKNOWN_SELLER_STATE", () => {
    const result = quote({
      sellerStateCode: '00',
      buyerStateCode: '27',
      hsn: '8471',
      ratePercent: 18,
      taxableAmountPaise: paise(10000),
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    const err = result.error as QuoteError;
    expect(err.code).toBe('UNKNOWN_SELLER_STATE');
  });

  it("unknown buyer '00' returns UNKNOWN_BUYER_STATE", () => {
    const result = quote({
      sellerStateCode: '27',
      buyerStateCode: '00',
      hsn: '8471',
      ratePercent: 18,
      taxableAmountPaise: paise(10000),
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    const err = result.error as QuoteError;
    expect(err.code).toBe('UNKNOWN_BUYER_STATE');
  });

  it('valid intra-state quote still succeeds', () => {
    const result = quote({
      sellerStateCode: '27',
      buyerStateCode: '27',
      hsn: '8471',
      ratePercent: 18,
      taxableAmountPaise: paise(10000),
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.result.cgstPaise).toBe(900);
    expect(result.result.totalPaise).toBe(11800);
  });
});
