import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import { MotionConfig } from "framer-motion";
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

// ── Core positioning ─────────────────────────────────────────────────────────
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProjectDetail from "@/pages/ProjectDetail";
import Infrastructure from "@/pages/Infrastructure";
import Developers from "@/pages/Developers";
import OpenSource from "@/pages/OpenSource";
import Research from "@/pages/Research";
import Labs from "@/pages/Labs";
import LabsProduct from "@/pages/LabsProduct";
import Vision from "@/pages/Vision";
import Partners from "@/pages/Partners";
import About from "@/pages/About";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Contact from "@/pages/Contact";

// ── Engineering services (secondary — Company → Engineering Services) ────────
import Services from "@/pages/Services";
import ServiceDetail from "@/pages/ServiceDetail";
import ProjectDiscovery from "@/pages/ProjectDiscovery";
import Diagnostic from "@/pages/Diagnostic";
import Estimator from "@/pages/Estimator";
import RFP from "@/pages/RFP";
import SpecLibrary from "@/pages/SpecLibrary";
import Portfolio from "@/pages/Portfolio";
import PortfolioDetail from "@/pages/PortfolioDetail";
import Booking from "@/pages/Booking";

// ── Company / support / legal ────────────────────────────────────────────────
import Changelog from "@/pages/Changelog";
import Status from "@/pages/Status";
import Trust from "@/pages/Trust";
import Help from "@/pages/Help";
import HelpArticle from "@/pages/HelpArticle";
import Glossary from "@/pages/Glossary";
import FAQ from "@/pages/FAQ";
import NewsletterConfirm from "@/pages/NewsletterConfirm";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import AccountDeletion from "@/pages/AccountDeletion";
import LegalCookies from "@/pages/LegalCookies";
import LegalAcceptableUse from "@/pages/LegalAcceptableUse";
import LegalAccessibility from "@/pages/LegalAccessibility";
import LegalSubprocessors from "@/pages/LegalSubprocessors";
import LegalSecurity from "@/pages/LegalSecurity";
import LegalDPA from "@/pages/LegalDPA";
import NotFound from "@/pages/NotFound";

const ENGINEERING_SERVICES = "/company/engineering-services";

function AppShell() {
  return (
    <>
      <CursorTrail />
      <CommandPalette />
      <KeyboardNav />
      <KonamiEgg />
      <SoundToggle />

      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />

          {/* ── Products ──────────────────────────────────────────────── */}
          <Route path="products" element={<Products />} />
          <Route path="products/:slug" element={<ProjectDetail />} />
          {/* Client engagements share the detail renderer; the page itself
              suppresses the maturity badge for `client-work` entries. */}
          <Route path="work/:slug" element={<ProjectDetail />} />

          {/* ── Infrastructure ────────────────────────────────────────── */}
          <Route path="infrastructure" element={<Infrastructure />} />
          <Route path="developers" element={<Developers />} />
          <Route path="open-source" element={<OpenSource />} />
          <Route path="research" element={<Research />} />
          <Route path="labs" element={<Labs />} />
          <Route path="labs/:slug" element={<LabsProduct />} />

          {/* ── Company ───────────────────────────────────────────────── */}
          <Route path="about" element={<About />} />
          <Route path="vision" element={<Vision />} />
          <Route path="partners" element={<Partners />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          <Route path="contact" element={<Contact />} />

          {/* ── Engineering Services (secondary area) ─────────────────── */}
          <Route path="company/engineering-services" element={<Services />} />
          <Route path="company/engineering-services/brief" element={<ProjectDiscovery />} />
          <Route path="company/engineering-services/diagnostic" element={<Diagnostic />} />
          <Route path="company/engineering-services/estimator" element={<Estimator />} />
          <Route path="company/engineering-services/rfp" element={<RFP />} />
          <Route path="company/engineering-services/spec-library" element={<SpecLibrary />} />
          <Route path="company/engineering-services/work" element={<Portfolio />} />
          <Route path="company/engineering-services/work/:slug" element={<PortfolioDetail />} />
          {/* Keep the :slug service route last so the literal paths above win. */}
          <Route path="company/engineering-services/:slug" element={<ServiceDetail />} />
          <Route path="book" element={<Booking />} />

          {/* ── Support, status, legal ────────────────────────────────── */}
          <Route path="changelog" element={<Changelog />} />
          <Route path="status" element={<Status />} />
          <Route path="trust" element={<Trust />} />
          <Route path="help" element={<Help />} />
          <Route path="help/:slug" element={<HelpArticle />} />
          <Route path="glossary" element={<Glossary />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="newsletter/confirm" element={<NewsletterConfirm />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="account-deletion" element={<AccountDeletion />} />
          <Route path="legal/cookies" element={<LegalCookies />} />
          <Route path="legal/acceptable-use" element={<LegalAcceptableUse />} />
          <Route path="legal/accessibility" element={<LegalAccessibility />} />
          <Route path="legal/subprocessors" element={<LegalSubprocessors />} />
          <Route path="legal/security" element={<LegalSecurity />} />
          <Route path="legal/dpa" element={<LegalDPA />} />

          {/* ── Redirects from the pre-2026 information architecture ───── */}
          {/* These URLs are indexed and linked from outside; they must not 404. */}
          <Route path="projects" element={<Navigate to="/products" replace />} />
          <Route path="projects/:slug" element={<RedirectProject />} />
          <Route path="solutions" element={<Navigate to="/infrastructure" replace />} />
          <Route path="open-standards" element={<Navigate to="/infrastructure" replace />} />
          <Route path="philosophy" element={<Navigate to="/vision" replace />} />
          <Route path="industries" element={<Navigate to="/infrastructure" replace />} />
          <Route path="industries/:slug" element={<Navigate to="/infrastructure" replace />} />
          <Route path="press" element={<Navigate to="/about" replace />} />
          <Route path="subsidiaries" element={<Navigate to="/about" replace />} />
          <Route path="services" element={<Navigate to={ENGINEERING_SERVICES} replace />} />
          <Route path="services/:slug" element={<RedirectService />} />
          <Route path="start-project" element={<Navigate to={`${ENGINEERING_SERVICES}/brief`} replace />} />
          <Route path="diagnostic" element={<Navigate to={`${ENGINEERING_SERVICES}/diagnostic`} replace />} />
          <Route path="estimator" element={<Navigate to={`${ENGINEERING_SERVICES}/estimator`} replace />} />
          <Route path="rfp" element={<Navigate to={`${ENGINEERING_SERVICES}/rfp`} replace />} />
          <Route path="spec-library" element={<Navigate to={`${ENGINEERING_SERVICES}/spec-library`} replace />} />
          <Route path="portfolio" element={<Navigate to={`${ENGINEERING_SERVICES}/work`} replace />} />
          <Route path="portfolio/:slug" element={<RedirectPortfolio />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

/* Slug-preserving redirects. `Navigate` cannot interpolate a param on its own,
   so each of these reads the param and rebuilds the new path. */
function RedirectProject() {
  const slug = window.location.pathname.split("/").filter(Boolean)[1] ?? "";
  return <Navigate to={`/products/${slug}`} replace />;
}

function RedirectService() {
  const slug = window.location.pathname.split("/").filter(Boolean)[1] ?? "";
  return <Navigate to={`${ENGINEERING_SERVICES}/${slug}`} replace />;
}

function RedirectPortfolio() {
  const slug = window.location.pathname.split("/").filter(Boolean)[1] ?? "";
  return <Navigate to={`${ENGINEERING_SERVICES}/work/${slug}`} replace />;
}

export default function App() {
  // `?nosplash=1` skips the intro — used by screenshot/E2E tooling, which
  // otherwise never gets past the splash's looping animations.
  const [splashDone, setSplashDone] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("nosplash"),
  );

  return (
    <HelmetProvider>
      {/* One global switch for prefers-reduced-motion. framer-motion's
          `reducedMotion="user"` disables transform/layout animations for
          readers who ask for it, without every page having to opt in — pages
          were individually ignoring the preference before. */}
      <MotionConfig reducedMotion="user">
      <ThemeContextProvider>
        <ErrorBoundary>
          <ClickEffect />
          {/* The router mounts immediately and the splash sits *over* it.
              Previously the tree was `{splashDone && <BrowserRouter/>}`, so
              until the intro animation finished the document contained no
              routed content at all — which is what a crawler that does not
              wait for animations sees. Page content is now in the DOM on the
              first paint regardless of the intro. */}
          <BrowserRouter>
            <AppShell />
          </BrowserRouter>
          {!splashDone && <SplashScreen onComplete={() => setSplashDone(true)} />}
        </ErrorBoundary>
      </ThemeContextProvider>
      </MotionConfig>
    </HelmetProvider>
  );
}
