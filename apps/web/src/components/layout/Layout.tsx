import { useEffect } from "react";
import { Box } from "@mui/material";
import { Outlet, useLocation } from "react-router";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CookieConsent from "@/components/shared/CookieConsent";
import FeedbackWidget from "@/components/shared/FeedbackWidget";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
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
