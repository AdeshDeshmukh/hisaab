import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { quote } from './quote.js';
import { paise } from './money.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

type CessScenario = {
  id: string;
  sellerState: string;
  buyerState: string;
  hsn: string;
  ratePercent: number;
  cessPercent: number;
  taxableAmountPaise: number;
  expectedCgstPaise: number;
  expectedSgstPaise: number;
  expectedIgstPaise: number;
  expectedCessPaise: number;
  expectedTotalPaise: number;
};

function loadScenario(): CessScenario {
  const raw = readFileSync(
    join(__dirname, '../../../spec/scenarios/igst-28-cess-12.json'),
    'utf-8',
  );
  return JSON.parse(raw) as CessScenario;
}

describe('cess scenario — igst-28-cess-12', () => {
  it('reads the fixture and quotes 28% GST + 12% cess', () => {
    const s = loadScenario();
    const result = quote({
      sellerStateCode: s.sellerState,
      buyerStateCode: s.buyerState,
      hsn: s.hsn,
      ratePercent: s.ratePercent,
      cessPercent: s.cessPercent,
      taxableAmountPaise: paise(s.taxableAmountPaise),
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.result.cgstPaise).toBe(s.expectedCgstPaise);
    expect(result.result.sgstPaise).toBe(s.expectedSgstPaise);
    expect(result.result.igstPaise).toBe(s.expectedIgstPaise);
    expect(result.result.cessPaise).toBe(s.expectedCessPaise);
    expect(result.result.totalPaise).toBe(s.expectedTotalPaise);
  });

  it('totalWithCess = taxable + igst + cess', () => {
    const s = loadScenario();
    const result = quote({
      sellerStateCode: s.sellerState,
      buyerStateCode: s.buyerState,
      hsn: s.hsn,
      ratePercent: s.ratePercent,
      cessPercent: s.cessPercent,
      taxableAmountPaise: paise(s.taxableAmountPaise),
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.result.totalPaise).toBe(
      s.taxableAmountPaise + result.result.igstPaise + result.result.cessPaise,
    );
  });
});
