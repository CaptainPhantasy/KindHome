/**
 * KIND HOME - APP ENTRY
 * Phase 1.2: Routing & Layouts
 * Phase 2: Code Splitting for Distribution Logic
 */

import { createBrowserRouter, RouterProvider } from 'react-router';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import ElderLayout from './layouts/ElderLayout';
import CaregiverLayout from './layouts/CaregiverLayout';
import RootGatekeeper from './components/RootGatekeeper';

// Lazy load Elder routes (only downloaded when /elder is accessed)
const TodayPage = lazy(() => import('./features/elder/TodayPage'));
const ElderPeoplePage = lazy(() => import('./features/elder/PeoplePage'));
const ElderVideoPage = lazy(() => import('./features/elder/VideoPage'));
const CoachPage = lazy(() => import('./pages/CoachPage'));
const MemoryVaultPage = lazy(() => import('./pages/MemoryVaultPage'));
const ElderScannerPage = lazy(() => import('./pages/ElderScannerPage'));

// Lazy load Caregiver routes (only downloaded when /caregiver is accessed)
const CaregiverScannerPage = lazy(() => import('./pages/CaregiverScannerPage'));
const ElderSelector = lazy(() => import('./features/caregiver/elders/ElderSelector'));
const DashboardPage = lazy(() => import('./features/caregiver/DashboardPage'));
const CaregiverPeoplePage = lazy(() => import('./features/caregiver/PeoplePage'));
const CaregiverVideoPage = lazy(() => import('./features/caregiver/VideoPage'));
const SettingsPage = lazy(() => import('./features/caregiver/SettingsPage'));
const MedicationsPage = lazy(() => import('./features/caregiver/MedicationsPage'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="text-foreground text-sm">Loading...</p>
    </div>
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootGatekeeper />,
  },
  {
    path: '/elder',
    element: <ElderLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <TodayPage />
          </Suspense>
        ),
      },
      {
        path: 'today',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <TodayPage />
          </Suspense>
        ),
      },
      {
        path: 'people',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ElderPeoplePage />
          </Suspense>
        ),
      },
      {
        path: 'memory-vault',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <MemoryVaultPage />
          </Suspense>
        ),
      },
      {
        path: 'scanner',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ElderScannerPage />
          </Suspense>
        ),
      },
      {
        path: 'video',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ElderVideoPage />
          </Suspense>
        ),
      },
      {
        path: 'coach',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <CoachPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/caregiver',
    element: <CaregiverLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ElderSelector />
          </Suspense>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'medications',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <MedicationsPage />
          </Suspense>
        ),
      },
      {
        path: 'scanner',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <CaregiverScannerPage />
          </Suspense>
        ),
      },
      {
        path: 'people',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <CaregiverPeoplePage />
          </Suspense>
        ),
      },
      {
        path: 'video',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <CaregiverVideoPage />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <SettingsPage />
          </Suspense>
        ),
      },
    ],
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
