/**
 * THEME TOGGLE COMPONENT
 * Last Updated: 06:02:26 Dec 11, 2025
 * 
 * Token-only: Uses bg-primary, text-primary-foreground, etc.
 * NO conditional text-black/text-white classes.
 */

import { useTheme } from '../contexts/ThemeProvider';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
      aria-label={`Switch to ${theme === 'warm' ? 'dark' : 'warm'} mode`}
    >
      {theme === 'warm' ? '🌙 Dark Mode' : '☀️ Warm Mode'}
    </button>
  );
};
