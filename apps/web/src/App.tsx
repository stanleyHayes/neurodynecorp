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
import Solutions from "@/pages/Solutions";
import Philosophy from "@/pages/Philosophy";
import OpenStandards from "@/pages/OpenStandards";
import Research from "@/pages/Research";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
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
import Status from "@/pages/Status";
import Trust from "@/pages/Trust";
import Help from "@/pages/Help";
import HelpArticle from "@/pages/HelpArticle";
import Glossary from "@/pages/Glossary";
import NewsletterConfirm from "@/pages/NewsletterConfirm";
import LegalCookies from "@/pages/LegalCookies";
import LegalAcceptableUse from "@/pages/LegalAcceptableUse";
import LegalAccessibility from "@/pages/LegalAccessibility";
import LegalSubprocessors from "@/pages/LegalSubprocessors";
import LegalSecurity from "@/pages/LegalSecurity";
import LegalDPA from "@/pages/LegalDPA";
import Labs from "@/pages/Labs";
import LabsProduct from "@/pages/LabsProduct";
import Subsidiaries from "@/pages/Subsidiaries";
import Industries from "@/pages/Industries";
import IndustryDetail from "@/pages/IndustryDetail";
import ServiceDetail from "@/pages/ServiceDetail";
import FAQ from "@/pages/FAQ";
import Press from "@/pages/Press";
import PortfolioDetail from "@/pages/PortfolioDetail";
import Diagnostic from "@/pages/Diagnostic";
import Estimator from "@/pages/Estimator";
import RFP from "@/pages/RFP";
import Booking from "@/pages/Booking";

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
          <Route path="solutions" element={<Solutions />} />
          <Route path="philosophy" element={<Philosophy />} />
          <Route path="open-standards" element={<OpenStandards />} />
          <Route path="research" element={<Research />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:slug" element={<ProjectDetail />} />
          <Route path="services/:slug" element={<ServiceDetail />} />
          <Route path="labs" element={<Labs />} />
          <Route path="labs/:slug" element={<LabsProduct />} />
          <Route path="subsidiaries" element={<Subsidiaries />} />
          <Route path="industries" element={<Industries />} />
          <Route path="industries/:slug" element={<IndustryDetail />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="press" element={<Press />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="portfolio/:slug" element={<PortfolioDetail />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          <Route path="contact" element={<Contact />} />
          <Route path="start-project" element={<StartProject />} />
          <Route path="diagnostic" element={<Diagnostic />} />
          <Route path="estimator" element={<Estimator />} />
          <Route path="rfp" element={<RFP />} />
          <Route path="book" element={<Booking />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="changelog" element={<Changelog />} />
          <Route path="open-source" element={<OpenSource />} />
          <Route path="spec-library" element={<SpecLibrary />} />
          <Route path="status" element={<Status />} />
          <Route path="trust" element={<Trust />} />
          <Route path="help" element={<Help />} />
          <Route path="help/:slug" element={<HelpArticle />} />
          <Route path="glossary" element={<Glossary />} />
          <Route path="newsletter/confirm" element={<NewsletterConfirm />} />
          <Route path="legal/cookies" element={<LegalCookies />} />
          <Route path="legal/acceptable-use" element={<LegalAcceptableUse />} />
          <Route path="legal/accessibility" element={<LegalAccessibility />} />
          <Route path="legal/subprocessors" element={<LegalSubprocessors />} />
          <Route path="legal/security" element={<LegalSecurity />} />
          <Route path="legal/dpa" element={<LegalDPA />} />
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
