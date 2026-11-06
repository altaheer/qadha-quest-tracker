import { renderHook, act, waitFor, cleanup } from '@testing-library/react';
import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { useLocalNotifications } from './useLocalNotifications';

const mocks = vi.hoisted(() => ({
  cancel: vi.fn().mockResolvedValue(undefined), schedule: vi.fn().mockResolvedValue(undefined),
  checkPermissions: vi.fn().mockResolvedValue({ display: 'granted' }),
  requestPermissions: vi.fn().mockResolvedValue({ display: 'granted' }),
  createChannel: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => true } }));
vi.mock('@capacitor/local-notifications', () => ({ LocalNotifications: mocks }));
beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });
afterEach(cleanup);

it('does not request permission or schedule until reminders are enabled', async () => {
  const { result } = renderHook(() => useLocalNotifications(true));
  await waitFor(() => expect(result.current.permission).toBe('granted'));
  expect(mocks.requestPermissions).not.toHaveBeenCalled();
  expect(mocks.schedule).not.toHaveBeenCalled();
  await act(async () => { await result.current.requestPermission(); });
  await waitFor(() => expect(mocks.schedule).toHaveBeenCalled());
  expect(mocks.schedule.mock.calls.at(-1)![0].notifications.length).toBeGreaterThan(20);
});

it('lets Settings observe permission without starting a second scheduler', async () => {
  localStorage.setItem('notifications-enabled', 'true');
  const { result } = renderHook(() => ({ shell: useLocalNotifications(true), settings: useLocalNotifications() }));
  await waitFor(() => expect(mocks.schedule).toHaveBeenCalledTimes(1));
  act(() => result.current.settings.setEnabled(false));
  await waitFor(() => expect(result.current.shell.enabled).toBe(false));
  await waitFor(() => expect(mocks.cancel.mock.calls.length).toBeGreaterThan(1));
  expect(mocks.schedule).toHaveBeenCalledTimes(1);
});
