import { describe, it, expect } from 'vitest';
import { lookupHsnChapter, lookupHsnDescription } from './hsn.js';
import { lookupHsnDescription as lookupHsnDescriptionFromIndex } from './index.js';

describe('lookupHsnDescription', () => {
  it("'85' mentions electrical equipment", () => {
    expect(lookupHsnDescription('85')).toContain('Electrical');
  });

  it("'99' returns Services (SAC codes)", () => {
    expect(lookupHsnDescription('99')).toBe('Services (SAC codes)');
  });

  it("'00' returns null", () => {
    expect(lookupHsnDescription('00')).toBeNull();
  });

  it("slices the 2-digit prefix from full HSN '8471'", () => {
    expect(lookupHsnDescription('8471')).toBe(lookupHsnChapter('8471'));
    expect(lookupHsnDescription('8471')).toContain('Nuclear');
  });

  it("returns null for short input '8'", () => {
    expect(lookupHsnDescription('8')).toBeNull();
  });

  it("returns null for unknown prefix '55'", () => {
    expect(lookupHsnDescription('55')).toBeNull();
  });

  it('is exported from index.ts', () => {
    expect(lookupHsnDescriptionFromIndex('99')).toBe('Services (SAC codes)');
  });
});
