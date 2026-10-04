// ============================================================================
// IRONFORGE - Main Application Router
// Routes strictly configured for the gym admin console:
// Login, Dashboard, Members, Fees, Plans.
// ============================================================================

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { GymProvider } from './context/GymContext';
import { GymSettingsModal } from './components/GymSettingsModal';
import { AppLayout } from './components/layout/AppLayout';

// Page components
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { ProvisionGymPage } from './pages/ProvisionGymPage';
import { DashboardPage } from './pages/DashboardPage';
import { MembersPage } from './pages/MembersPage';
import { FeesPage } from './pages/FeesPage';
import { PlansPage } from './pages/PlansPage';

const AppRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <Routes location={location} key={location.pathname}>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Admin Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Obscure Super Admin Gym Provisioning (Unlinked) */}
      <Route path="/provision-new-gym" element={<ProvisionGymPage />} />

      {/* Protected Admin App Shell */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/fees" element={<FeesPage />} />
        <Route path="/plans" element={<PlansPage />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GymProvider>
          <BrowserRouter>
            <AppRoutes />
            <GymSettingsModal />
          </BrowserRouter>
        </GymProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
