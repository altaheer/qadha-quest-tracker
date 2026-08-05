import type { CSSProperties, ReactNode } from 'react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { QadhaSetupFlow } from './QadhaSetupFlow';

// AnimatePresence's mode="wait" holds the outgoing step on screen until its
// exit animation finishes, which never happens under jsdom's fake frame
// timing — so real transitions would leave the test stuck on step one.
// Steps change instantly here; the animation itself isn't what's under test.
vi.mock('framer-motion', () => {
  const passthrough = ({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) => (
    <div className={className} style={style}>
      {children}
    </div>
  );
  return {
    motion: new Proxy({}, { get: () => passthrough }),
    AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  };
});

// Radix's Select needs a few DOM APIs jsdom does not implement.
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
  // @ts-expect-error -- not present in jsdom
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

function pickFirstOption(comboboxIndex: number) {
  const combobox = screen.getAllByRole('combobox')[comboboxIndex];
  fireEvent.click(combobox);
  const listbox = screen.getByRole('listbox');
  const option = within(listbox).getAllByRole('option')[0];
  fireEvent.click(option);
}

describe('QadhaSetupFlow', () => {
  beforeEach(() => localStorage.clear());

  it('keeps Next disabled until both month and year are chosen', () => {
    render(<QadhaSetupFlow onApply={vi.fn()} />);
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();

    // Regression test for the bug this flow shipped with: picking only the
    // month used to silently default the year and enable Next anyway.
    pickFirstOption(0); // month
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();

    pickFirstOption(1); // year
    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled();
  });

  it('measures through to today on the "not yet started" branch', () => {
    const onApply = vi.fn();
    render(<QadhaSetupFlow onApply={onApply} />);

    pickFirstOption(0);
    pickFirstOption(1);
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Two choices on the "started praying?" step; the second is "not yet".
    const choices = screen.getAllByRole('button').filter((b) => !b.textContent?.match(/back/i));
    fireEvent.click(choices[choices.length - 1]);

    // Lands straight on the result step, with a number computed against today.
    expect(screen.getByRole('button', { name: /use this estimate/i })).toBeInTheDocument();
  });
});
