import type { ReactNode } from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { it, expect, vi, afterEach } from 'vitest';
import { QadhaSetupFlow } from './QadhaSetupFlow';
import { setLanguage } from '@/lib/i18n';

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
  motion: { div: ({ children }: { children: ReactNode }) => <div>{children}</div> },
}));
afterEach(cleanup);

it('offers the current year in both date questions and rejects reversed dates', () => {
  setLanguage('en');
  render(<QadhaSetupFlow onApply={vi.fn()} />);
  const year = String(new Date().getFullYear());
  expect(screen.getByRole('option', { name: year })).toBeInTheDocument();
  const selects = screen.getAllByRole('combobox');
  fireEvent.change(selects[0], { target: { value: '0' } });
  fireEvent.change(selects[1], { target: { value: year } });
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  // First choice is the option to select the date regular prayer began.
  const choices = screen.getAllByRole('button');
  fireEvent.click(choices[1]);
  const nextSelects = screen.getAllByRole('combobox');
  expect(screen.getByRole('option', { name: year })).toBeInTheDocument();
  fireEvent.change(nextSelects[0], { target: { value: '0' } });
  fireEvent.change(nextSelects[1], { target: { value: String(Number(year) - 1) } });
  expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
});
