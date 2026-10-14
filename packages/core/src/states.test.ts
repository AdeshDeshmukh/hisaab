import { describe, it, expect } from 'vitest';
import { STATES, lookupState } from './states.js';

describe('states — UT kinds', () => {
  const uts = [
    ['01', 'Jammu and Kashmir'],
    ['04', 'Chandigarh'],
    ['07', 'Delhi'],
    ['26', 'Dadra and Nagar Haveli and Daman and Diu'],
    ['31', 'Lakshadweep'],
    ['34', 'Puducherry'],
    ['35', 'Andaman and Nicobar Islands'],
    ['38', 'Ladakh'],
  ] as const;
  for (const [code, name] of uts) {
    it(`${code} ${name} is a UT`, () => {
      expect(STATES.get(code)?.kind).toBe('ut');
      expect(lookupState(code)?.kind).toBe('ut');
    });
  }
  it('lookupState returns null for unknown code', () => {
    expect(lookupState('ZZ')).toBeNull();
  });
});
