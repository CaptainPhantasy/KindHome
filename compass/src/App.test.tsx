/**
 * APP COMPONENT TESTS
 * Testing routing and navigation structure
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock the RootGatekeeper component since it handles Supabase auth
vi.mock('./components/RootGatekeeper', () => ({
  default: () => <div data-testid="root-gatekeeper">RootGatekeeper</div>,
}));

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('root-gatekeeper')).toBeInTheDocument();
  });

  it('provides router context to children', () => {
    render(<App />);
    const gatekeeper = screen.getByTestId('root-gatekeeper');
    expect(gatekeeper).toBeInTheDocument();
  });
});
