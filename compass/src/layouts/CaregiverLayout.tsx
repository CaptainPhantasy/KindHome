/**
 * CAREGIVER LAYOUT - Sidebar Dashboard
 * Phase 1.2: CareBridge Admin Layout
 * 
 * Features:
 * - Sidebar navigation
 * - Dense, informative dashboard
 * - CareBridge branding
 * - Standard desktop/tablet UI patterns
 */

import { Outlet, Link, useLocation } from 'react-router';
import { LayoutDashboard, Users, Video, Settings, Home, Pill } from 'lucide-react';
import type { ReactNode } from 'react';

interface CaregiverLayoutProps {
  children?: ReactNode;
}

const CaregiverLayout = ({ children }: CaregiverLayoutProps) => {
  const location = useLocation();

  const navItems = [
    { path: '/caregiver/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/caregiver/scanner', icon: Pill, label: 'Med Scanner' },
    { path: '/caregiver/people', icon: Users, label: 'People' },
    { path: '/caregiver/video', icon: Video, label: 'Video Bridge' },
    { path: '/caregiver/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        {/* CareBridge Branding */}
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-foreground">CareBridge</h1>
          <p className="text-sm text-muted-foreground mt-1">Admin Dashboard</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-4 py-3
                      rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-foreground hover:bg-muted'
                      }
                    `}
                  >
                    <Icon size={20} strokeWidth={2} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer Link to Elder View */}
        <div className="p-4 border-t border-border">
          <Link
            to="/elder/today"
            className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <Home size={20} strokeWidth={2} />
            <span className="font-medium">Elder View</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default CaregiverLayout;

