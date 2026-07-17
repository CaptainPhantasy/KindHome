/**
 * THEME PROVIDER TESTS
 * Testing theme context, theme switching, and localStorage persistence
 */

import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ThemeProvider, useTheme } from './ThemeProvider';

// Test component to access theme context
const TestComponent = () => {
  const { theme, setTheme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button data-testid="set-warm" onClick={() => setTheme('warm')}>
        Set Warm
      </button>
      <button data-testid="set-dark" onClick={() => setTheme('dark')}>
        Set Dark
      </button>
      <button data-testid="toggle-theme" onClick={toggleTheme}>
        Toggle Theme
      </button>
    </div>
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset document theme attribute
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('renders children without crashing', () => {
    render(
      <ThemeProvider>
        <div>Test Child</div>
      </ThemeProvider>
    );
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('defaults to warm theme when no localStorage value exists', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId('current-theme')).toHaveTextContent('warm');
  });

  it('restores theme from localStorage on mount', () => {
    localStorage.setItem('kind-home-theme', 'dark');
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
  });

  it('sets theme to dark when setTheme is called', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const darkButton = screen.getByTestId('set-dark');
    act(() => {
      darkButton.click();
    });

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('sets theme to warm when setTheme is called', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const warmButton = screen.getByTestId('set-warm');
    act(() => {
      warmButton.click();
    });

    expect(screen.getByTestId('current-theme')).toHaveTextContent('warm');
    expect(document.documentElement.getAttribute('data-theme')).toBe('warm');
  });

  it('toggles theme between warm and dark', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByTestId('toggle-theme');

    // Start with warm (default)
    expect(screen.getByTestId('current-theme')).toHaveTextContent('warm');

    // Toggle to dark
    act(() => {
      toggleButton.click();
    });
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');

    // Toggle back to warm
    act(() => {
      toggleButton.click();
    });
    expect(screen.getByTestId('current-theme')).toHaveTextContent('warm');
  });

  it('persists theme to localStorage when changed', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const darkButton = screen.getByTestId('set-dark');
    act(() => {
      darkButton.click();
    });

    expect(localStorage.getItem('kind-home-theme')).toBe('dark');
  });

  it('throws error when useTheme is used outside ThemeProvider', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTheme must be used within ThemeProvider');

    consoleError.mockRestore();
  });

  it('applies data-theme attribute to document element', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(document.documentElement.getAttribute('data-theme')).toBe('warm');

    const darkButton = screen.getByTestId('set-dark');
    act(() => {
      darkButton.click();
    });

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
