import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@/theme/ThemeContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SplashScreen from "@/components/splash/SplashScreen";
import Onboarding from "@/components/onboarding/Onboarding";
import GridMenu from "@/components/onboarding/GridMenu";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import Documents from "@/pages/Documents";
import Billing from "@/pages/Billing";
import Messages from "@/pages/Messages";
import Notifications from "@/pages/Notifications";
import Settings from "@/pages/Settings";
import Security from "@/pages/Security";
import Webhooks from "@/pages/Webhooks";
import HelpCenter from "@/pages/HelpCenter";
import StartProject from "@/pages/StartProject";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import NotFound from "@/pages/NotFound";
import CommandPalette from "@/components/shared/CommandPalette";
import KeyboardNav from "@/components/shared/KeyboardNav";
import CursorTrail from "@/components/shared/CursorTrail";
import SoundToggle from "@/components/shared/SoundToggle";
import ErrorBoundary from "@/components/shared/ErrorBoundary";

const ONBOARDING_KEY = "neurodyne_onboarding_complete";
const GRID_MENU_KEY = "neurodyne_grid_menu_shown";
const SPLASH_KEY = "neurodyne_client_splash_shown";

function AppShell() {
  const { isAuthenticated } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showGridMenu, setShowGridMenu] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const onboardingDone = localStorage.getItem(ONBOARDING_KEY);
    const gridMenuShown = sessionStorage.getItem(GRID_MENU_KEY);

    if (!onboardingDone) {
      setShowOnboarding(true);
    } else if (!gridMenuShown) {
      setShowGridMenu(true);
    }
  }, [isAuthenticated]);

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
    setShowGridMenu(true);
  };

  const handleGridMenuNavigate = () => {
    sessionStorage.setItem(GRID_MENU_KEY, "true");
    setShowGridMenu(false);
  };

  return (
    <>
      <CommandPalette />
      <KeyboardNav />

      <AnimatePresence>
        {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      </AnimatePresence>

      <AnimatePresence>
        {showGridMenu && !showOnboarding && <GridMenu onNavigate={handleGridMenuNavigate} />}
      </AnimatePresence>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="start-project" element={<StartProject />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="documents" element={<Documents />} />
          <Route path="billing" element={<Billing />} />
          <Route path="messages" element={<Messages />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="security" element={<Security />} />
          <Route path="webhooks" element={<Webhooks />} />
          <Route path="help" element={<HelpCenter />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(
    () => sessionStorage.getItem(SPLASH_KEY) === "true",
  );

  const handleSplashComplete = () => {
    sessionStorage.setItem(SPLASH_KEY, "true");
    setSplashDone(true);
  };

  return (
    <ThemeProvider>
      <ErrorBoundary>
        {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}
        <CursorTrail />
        <SoundToggle />
        <AuthProvider>
          <BrowserRouter>
            <AppShell />
          </BrowserRouter>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
