import { beforeEach, describe, expect, it } from 'vitest';
import { safeReadJSON, safeWriteJSON } from './storage';

describe('safeReadJSON', () => {
  beforeEach(() => localStorage.clear());

  it('returns the fallback when the key is missing', () => {
    expect(safeReadJSON('missing', { a: 1 })).toEqual({ a: 1 });
  });

  it('returns the fallback for corrupt JSON instead of throwing', () => {
    localStorage.setItem('bad', '{not json');
    expect(() => safeReadJSON('bad', [])).not.toThrow();
    expect(safeReadJSON('bad', [])).toEqual([]);
  });

  it('returns the fallback for a stored null', () => {
    localStorage.setItem('nullish', 'null');
    expect(safeReadJSON('nullish', 'fallback')).toBe('fallback');
  });

  it('parses well-formed values', () => {
    localStorage.setItem('good', JSON.stringify({ fajr: 3 }));
    expect(safeReadJSON('good', {})).toEqual({ fajr: 3 });
  });
});

describe('safeWriteJSON', () => {
  beforeEach(() => localStorage.clear());

  it('round-trips through safeReadJSON', () => {
    safeWriteJSON('key', { x: 1 });
    expect(safeReadJSON('key', {})).toEqual({ x: 1 });
  });
});
