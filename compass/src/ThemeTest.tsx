/**
 * THEME VERIFICATION TEST PAGE
 * Purpose: Ensure NO text is invisible (Visual Constitution enforcement)
 * Created: 05:56:18 Dec 11, 2025
 * Updated: 06:02:26 Dec 11, 2025 - Added dark mode toggle
 * Updated: 06:08:39 Dec 11, 2025 - Using TintedCard to demonstrate correct pattern
 */

import { ThemeToggle } from './components/ThemeToggle';
import { TintedCard } from './components/theme/TintedCard';

const ThemeTest = () => {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-foreground">
          Kind Home - Theme Verification
        </h1>
        <ThemeToggle />
      </div>
      
      {/* Background Test */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">
          1. Background Hierarchy
        </h2>
        <div className="space-y-4">
          <div className="bg-background text-foreground p-6 rounded-lg border border-border">
            <p className="text-xl">Primary Background: Creamy Sand (#FCE8B8)</p>
            <p className="text-base text-muted-foreground">Muted foreground text</p>
          </div>
          
          <div className="bg-card text-card-foreground p-6 rounded-lg border border-border">
            <p className="text-xl">Card Background: Lighter Cream</p>
            <p className="text-base text-muted-foreground">Card subtext</p>
          </div>
        </div>
      </section>

      {/* Button Test */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">
          2. Button Contrast (The "Button Rule")
        </h2>
        <div className="flex flex-wrap gap-4">
          <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
            Primary Button (Terracotta)
          </button>
          
          <button className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
            Secondary Button (Sage Green)
          </button>
          
          <button className="bg-accent text-accent-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
            Accent Button (Coral)
          </button>
          
          <button className="bg-destructive text-destructive-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
            Destructive Button
          </button>
          
          <button className="bg-muted text-muted-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity cursor-not-allowed">
            Disabled Button
          </button>
        </div>
      </section>

      {/* Input Test */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">
          3. Input Contrast (The "Input Rule")
        </h2>
        <div className="space-y-4 max-w-md">
          <input
            type="text"
            placeholder="Enter your name..."
            className="w-full bg-input text-foreground border border-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-ring focus:outline-none"
          />
          
          <textarea
            placeholder="Enter a message..."
            rows={3}
            className="w-full bg-input text-foreground border border-input px-4 py-3 rounded-lg focus:ring-2 focus:ring-ring focus:outline-none"
          />
        </div>
      </section>

      {/* Card Test */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">
          4. Card System (The "Card Rule")
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card text-card-foreground p-6 rounded-lg border border-border">
            <h3 className="text-xl font-semibold mb-2">Morning Pill Reminder</h3>
            <p className="text-base mb-4">Take your medication at 9:00 AM</p>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">
              Mark as Taken
            </button>
          </div>
          
          <div className="bg-card text-card-foreground p-6 rounded-lg border border-border">
            <h3 className="text-xl font-semibold mb-2">Video Call Available</h3>
            <p className="text-base mb-4">Sarah is calling you</p>
            <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium">
              Answer Call
            </button>
          </div>
        </div>
      </section>

      {/* Elder Mode Test */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">
          5. Elder Mode (80px Touch Targets)
        </h2>
        <div data-mode="elder" className="bg-card text-card-foreground p-6 rounded-lg border border-border">
          <h3 className="mb-4">Large Text & Touch Targets (Elder Mode Active)</h3>
          <p className="mb-6">This text should be at least 20px (text-xl minimum)</p>
          <button className="bg-primary text-primary-foreground rounded-lg font-medium w-full">
            I'm OK Today
          </button>
        </div>
      </section>

      {/* Color Reference */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">
          6. Token Reference (FORBIDDEN: Raw Hex)
        </h2>
        <div className="bg-card text-card-foreground p-6 rounded-lg border border-border">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-mono text-sm mb-2">bg-background / text-foreground</p>
              <p className="font-mono text-sm mb-2">bg-card / text-card-foreground</p>
              <p className="font-mono text-sm mb-2">bg-primary / text-primary-foreground</p>
            </div>
            <div>
              <p className="font-mono text-sm mb-2">bg-secondary / text-secondary-foreground</p>
              <p className="font-mono text-sm mb-2">bg-muted / text-muted-foreground</p>
              <p className="font-mono text-sm mb-2">bg-input / border-input</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-destructive font-semibold">
              ❌ NEVER use: #ffffff, bg-white, text-gray-500
            </p>
            <p className="text-destructive">
              ✅ ALWAYS use: Semantic tokens above
            </p>
          </div>
        </div>
      </section>

      {/* Verification Checklist */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">
          7. Manual Verification Checklist
        </h2>
        <div className="bg-card text-card-foreground p-6 rounded-lg border border-border">
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="mr-2">☐</span>
              <span>All text is visible (no white-on-white)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">☐</span>
              <span>Buttons have clear contrast between bg and text</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">☐</span>
              <span>Input fields are clearly distinguishable from background</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">☐</span>
              <span>Cards have visible borders and distinct background</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">☐</span>
              <span>Elder mode buttons are minimum 80px tall</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">☐</span>
              <span>Warm palette feels inviting (not clinical)</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Dark Mode Test */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">
          8. Dark Mode Verification
        </h2>
        <div className="bg-card text-card-foreground p-6 rounded-lg border border-border">
          <p className="text-base mb-4">
            Use the toggle in the top-right to switch between Warm and Dark modes.
          </p>
          <p className="text-base mb-4 text-muted-foreground">
            All components use token-only classes (bg-background, text-foreground, etc.).
            No conditional text-black/text-white classes are used.
          </p>
          <TintedCard variant="accent" className="mt-4">
            <span className="font-semibold">
              ✅ Token-Only Theming: Components rely on CSS variables that change via data-theme attribute
            </span>
          </TintedCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 text-center text-muted-foreground">
        <p className="text-sm">
          Timestamp: 06:02:26 Dec 11, 2025 | Phase 1.1 + Dark Mode Complete
        </p>
      </footer>
    </div>
  );
};

export default ThemeTest;
