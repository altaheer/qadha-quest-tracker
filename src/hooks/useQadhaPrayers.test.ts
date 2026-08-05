import { beforeEach, describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQadhaPrayers } from './useQadhaPrayers';

describe('useQadhaPrayers', () => {
  beforeEach(() => localStorage.clear());

  it('never lets a counter go below zero', () => {
    const { result } = renderHook(() => useQadhaPrayers());
    act(() => result.current.decrement('fajr'));
    expect(result.current.counts.fajr).toBe(0);
  });

  it('increments and decrements normally within range', () => {
    const { result } = renderHook(() => useQadhaPrayers());
    act(() => result.current.increment('dhuhr'));
    act(() => result.current.increment('dhuhr'));
    expect(result.current.counts.dhuhr).toBe(2);
    act(() => result.current.decrement('dhuhr'));
    expect(result.current.counts.dhuhr).toBe(1);
  });

  it('falls back to defaults when localStorage holds corrupt JSON', () => {
    localStorage.setItem('qadha-prayer-counts', '{not json');
    const { result } = renderHook(() => useQadhaPrayers());
    expect(result.current.counts).toEqual({ fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 });
  });

  it('setCount clamps negative values to zero', () => {
    const { result } = renderHook(() => useQadhaPrayers());
    act(() => result.current.setCount('asr', -5));
    expect(result.current.counts.asr).toBe(0);
  });
});
