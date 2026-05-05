import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import { AnimatePresence } from "framer-motion";
import ThemeContextProvider from "@/context/ThemeContext";
import ClickEffect from "@/components/shared/ClickEffect";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import CommandPalette from "@/components/shared/CommandPalette";
import CursorTrail from "@/components/shared/CursorTrail";
import SoundToggle from "@/components/shared/SoundToggle";
import KonamiEgg from "@/components/shared/KonamiEgg";
import KeyboardNav from "@/components/shared/KeyboardNav";
import Layout from "@/components/layout/Layout";
import SplashScreen from "@/components/splash/SplashScreen";
import Onboarding from "@/components/onboarding/Onboarding";
import GridMenu from "@/components/onboarding/GridMenu";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Portfolio from "@/pages/Portfolio";
import Blog from "@/pages/Blog";
import Contact from "@/pages/Contact";
import StartProject from "@/pages/StartProject";
import BlogPost from "@/pages/BlogPost";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import NotFound from "@/pages/NotFound";
import Changelog from "@/pages/Changelog";
import OpenSource from "@/pages/OpenSource";
import SpecLibrary from "@/pages/SpecLibrary";

const ONBOARDING_KEY = "neurodyne_web_onboarding_complete";
const GRID_MENU_KEY = "neurodyne_web_grid_menu_shown";

function AppShell() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showGridMenu, setShowGridMenu] = useState(false);

  useEffect(() => {
    const onboardingDone = localStorage.getItem(ONBOARDING_KEY);
    const gridMenuShown = sessionStorage.getItem(GRID_MENU_KEY);

    if (!onboardingDone) {
      setShowOnboarding(true);
    } else if (!gridMenuShown) {
      setShowGridMenu(true);
    }
  }, []);

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
      <CursorTrail />
      <CommandPalette />
      <KeyboardNav />
      <KonamiEgg />
      <SoundToggle />

      <AnimatePresence>
        {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      </AnimatePresence>

      <AnimatePresence>
        {showGridMenu && !showOnboarding && <GridMenu onNavigate={handleGridMenuNavigate} />}
      </AnimatePresence>

      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          <Route path="contact" element={<Contact />} />
          <Route path="start-project" element={<StartProject />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="changelog" element={<Changelog />} />
          <Route path="open-source" element={<OpenSource />} />
          <Route path="spec-library" element={<SpecLibrary />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <HelmetProvider>
      <ThemeContextProvider>
        <ErrorBoundary>
          <ClickEffect />
          {!splashDone && <SplashScreen onComplete={() => setSplashDone(true)} />}
          {splashDone && (
            <BrowserRouter>
              <AppShell />
            </BrowserRouter>
          )}
        </ErrorBoundary>
      </ThemeContextProvider>
    </HelmetProvider>
  );
}
