import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useTheme } from 'next-themes';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server.node';
import ThemeSwitcher from './theme-switcher';

jest.mock('next-themes', () => ({ useTheme: jest.fn() }));

const setTheme = jest.fn();

const useResolvedTheme = (resolvedTheme?: string) =>
  (useTheme as jest.Mock).mockReturnValue({ setTheme, resolvedTheme });

afterEach(() => {
  jest.clearAllMocks();
});

describe('ThemeSwitcher', () => {
  it('hydrates without a mismatch when the theme is only known on the client', () => {
    useResolvedTheme(undefined);
    const container = document.createElement('div');
    container.innerHTML = renderToString(<ThemeSwitcher />);

    useResolvedTheme('dark');
    const onRecoverableError = jest.fn();
    let root: Root;
    act(() => {
      root = hydrateRoot(container, <ThemeSwitcher />, { onRecoverableError });
    });

    expect(onRecoverableError).not.toHaveBeenCalled();

    act(() => root.unmount());
  });

  it('leaves the theme class to choose between the sun and moon icons', () => {
    useResolvedTheme('dark');
    const { container } = render(<ThemeSwitcher />);

    expect(container.querySelector('.lucide-sun')).toHaveClass('hidden', 'dark:block');
    expect(container.querySelector('.lucide-moon')).toHaveClass('dark:hidden');
  });

  it.each([
    ['dark', 'light'],
    ['light', 'dark']
  ])('switches from %s to %s when clicked', (current, next) => {
    useResolvedTheme(current);
    render(<ThemeSwitcher />);

    fireEvent.click(screen.getByRole('button'));

    expect(setTheme).toHaveBeenCalledWith(next);
  });
});
