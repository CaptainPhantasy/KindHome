/**
 * KIND HOME - APP ENTRY
 * Phase 1.2: Routing & Layouts
 */

import { createBrowserRouter, RouterProvider } from 'react-router';
import ElderLayout from './layouts/ElderLayout';
import CaregiverLayout from './layouts/CaregiverLayout';
import TodayPage from './features/elder/TodayPage';
import ElderPeoplePage from './features/elder/PeoplePage';
import ElderVideoPage from './features/elder/VideoPage';
import CoachPage from './pages/CoachPage';
import MemoryVaultPage from './pages/MemoryVaultPage';
import ElderScannerPage from './pages/ElderScannerPage';
import CaregiverScannerPage from './pages/CaregiverScannerPage';
import ElderSelector from './features/caregiver/elders/ElderSelector';
import DashboardPage from './features/caregiver/DashboardPage';
import CaregiverPeoplePage from './features/caregiver/PeoplePage';
import CaregiverVideoPage from './features/caregiver/VideoPage';
import SettingsPage from './features/caregiver/SettingsPage';

const router = createBrowserRouter([
  {
    path: '/elder',
    element: <ElderLayout />,
    children: [
      { index: true, element: <TodayPage /> },
      { path: 'today', element: <TodayPage /> },
      { path: 'people', element: <ElderPeoplePage /> },
      { path: 'memory-vault', element: <MemoryVaultPage /> },
      { path: 'scanner', element: <ElderScannerPage /> },
      { path: 'video', element: <ElderVideoPage /> },
      { path: 'coach', element: <CoachPage /> },
    ],
  },
  {
    path: '/caregiver',
    element: <CaregiverLayout />,
    children: [
      { index: true, element: <ElderSelector /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'scanner', element: <CaregiverScannerPage /> },
      { path: 'people', element: <CaregiverPeoplePage /> },
      { path: 'video', element: <CaregiverVideoPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  {
    path: '/',
    element: <ElderLayout />,
    children: [{ index: true, element: <TodayPage /> }],
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
