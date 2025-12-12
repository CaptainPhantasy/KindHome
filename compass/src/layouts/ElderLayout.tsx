/**
 * ELDER LAYOUT - Bottom Navigation
 * Phase 1.2: Elder Mode Layout
 * 
 * Features:
 * - Bottom navigation bar (100px height)
 * - 80px minimum touch targets
 * - Elder mode styling (data-mode="elder")
 * - Large icons and text for senior readability
 */

import { Outlet, Link, useLocation } from 'react-router';
import { Home, Heart, Video, MessageCircleHeart, Archive, Pill } from 'lucide-react';
import type { ReactNode } from 'react';

interface ElderLayoutProps {
  children?: ReactNode;
}

const ElderLayout = ({ children }: ElderLayoutProps) => {
  const location = useLocation();

  const navItems = [
    { path: '/elder/today', icon: Home, label: 'Today' },
    { path: '/elder/people', icon: Heart, label: 'People' },
    { path: '/elder/memory-vault', icon: Archive, label: 'Vault' },
    { path: '/elder/scanner', icon: Pill, label: 'Scanner' },
    { path: '/elder/video', icon: Video, label: 'Video' },
    { path: '/elder/coach', icon: MessageCircleHeart, label: 'Coach' },
  ];

  return (
    <div data-mode="elder" className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden pb-24 min-h-0">
        {children || <Outlet />}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-24 bg-card border-t border-border shadow-card-depth" style={{ transform: 'translateZ(15px)' }}>
        <div className="flex h-full items-center justify-around px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex flex-col items-center justify-center
                  min-h-20 min-w-20 px-4 py-2
                  rounded-lg transition-all
                  shadow-realistic
                  active:scale-95
                  ${isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-foreground hover:bg-muted'
                  }
                `}
              >
                <Icon size={32} strokeWidth={2} />
                <span className="text-lg mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default ElderLayout;

