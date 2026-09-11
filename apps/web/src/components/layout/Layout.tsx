import { useEffect } from "react";
import { Box } from "@mui/material";
import { Outlet, useLocation } from "react-router";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CookieConsent from "@/components/shared/CookieConsent";
import FeedbackWidget from "@/components/shared/FeedbackWidget";

/**
 * Restores scroll position on navigation.
 *
 * A plain scroll-to-top ignores the hash, which silently breaks every in-page
 * anchor on the site — the homepage links to /partners#governments-institutions
 * and Partners has its own pathway nav, and both used to dump the reader at the
 * top of the page instead. The hash is resolved after paint so the target
 * element exists, with a rAF fallback for content that mounts a frame later.
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior: ScrollBehavior = prefersReduced ? "auto" : "smooth";

    const target = () => document.getElementById(decodeURIComponent(hash.slice(1)));

    const el = target();
    if (el) {
      el.scrollIntoView({ behavior, block: "start" });
      return;
    }

    // The section may not have mounted yet on a cross-page navigation.
    const raf = requestAnimationFrame(() => {
      target()?.scrollIntoView({ behavior, block: "start" });
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname, hash]);

  return null;
}

export default function Layout() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <ScrollToTop />
      <Navbar />
      <Box component="main" sx={{ flex: 1, pb: { xs: 10, md: 12 } }}>
        <Outlet />
      </Box>
      <Footer />
      <CookieConsent />
      <FeedbackWidget />
    </Box>
  );
}
