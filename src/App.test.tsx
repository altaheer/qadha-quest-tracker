import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import App from './App';
import { setLanguage } from './lib/i18n';
import { getDateString } from './lib/date';

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('onboarding-complete', '1');
  setLanguage('en');
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it('updates the home summary after marking Fajr with the quick action', async () => {
  window.history.replaceState({}, '', '/');
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Quick actions' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Mark Fajr' }));
  await waitFor(() => expect(screen.getByText('1/5')).toBeInTheDocument());
  expect(JSON.parse(localStorage.getItem('prayer-history')!)[getDateString(new Date())].prayers.fajr.status).toBe('ontime');
});

it.each(['/prayers', '/qadha', '/calendar', '/insights', '/settings'])('opens %s without a runtime error', async path => {
  window.history.replaceState({}, '', path);
  const { container } = render(<App />);
  await waitFor(() => expect(container.textContent).toContain('Ibadah'));
  expect(container.querySelector('main')).not.toBeNull();
});
