import { renderHook, cleanup } from '@testing-library/react';
import { it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useDataBackup } from './useDataBackup';

const mocks = vi.hoisted(() => ({ writeFile: vi.fn(), share: vi.fn() }));
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => true } }));
vi.mock('@capacitor/filesystem', () => ({ Filesystem: mocks, Directory: { Cache: 'CACHE' }, Encoding: { UTF8: 'utf8' } }));
vi.mock('@capacitor/share', () => ({ Share: mocks }));
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  mocks.writeFile.mockResolvedValue({ uri: 'file:///cache/backup.json' });
  mocks.share.mockResolvedValue({});
});
afterEach(cleanup);

it('exports native data as a UTF-8 JSON file through the share sheet', async () => {
  localStorage.setItem('qadha-prayer-counts', '{"fajr":4}');
  const { result } = renderHook(useDataBackup);
  await result.current.exportData();
  expect(JSON.parse(mocks.writeFile.mock.calls[0][0].data).entries['qadha-prayer-counts']).toBe('{"fajr":4}');
  expect(mocks.share).toHaveBeenCalledWith({ title: 'Ibadah', files: ['file:///cache/backup.json'] });
});

it('reports a write failure instead of claiming the backup was exported', async () => {
  mocks.writeFile.mockRejectedValueOnce(new Error('no space'));
  const { result } = renderHook(useDataBackup);
  await expect(result.current.exportData()).rejects.toThrow('no space');
  expect(mocks.share).not.toHaveBeenCalled();
});
