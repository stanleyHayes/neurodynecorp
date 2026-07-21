import { useState, useEffect, type ElementType, type ReactNode } from "react";
import { Box, Container, Grid, Typography, Link as MuiLink, IconButton, Stack, useTheme } from "@mui/material";
import { Link } from "react-router";
import { motion } from "framer-motion";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import DiscordIcon from "@mui/icons-material/Forum";
import YouTubeIcon from "@mui/icons-material/YouTube";
import EmailIcon from "@mui/icons-material/Email";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import CodeIcon from "@mui/icons-material/Code";
import PsychologyIcon from "@mui/icons-material/Psychology";
import SecurityIcon from "@mui/icons-material/Security";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PaymentsIcon from "@mui/icons-material/Payments";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import SchoolIcon from "@mui/icons-material/School";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Logo from "@/components/logo/Logo";
import HudCorners from "@/components/shared/HudCorners";

interface FooterLinkItem {
  label: string;
  path: string;
  icon?: ReactNode;
}

const footerSections: { title: string; links: FooterLinkItem[] }[] = [
  {
    title: "Company",
    links: [
      { label: "About", path: "/about" },
      { label: "Services", path: "/services" },
      { label: "Labs", path: "/labs" },
      { label: "Subsidiaries", path: "/subsidiaries" },
      { label: "Industries", path: "/industries" },
      { label: "Case Dossiers", path: "/portfolio" },
      { label: "Press", path: "/press" },
      { label: "Blog", path: "/blog" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Web Development", path: "/services#web", icon: <CodeIcon sx={{ fontSize: 15 }} /> },
      { label: "Mobile Apps", path: "/services#mobile", icon: <RocketLaunchIcon sx={{ fontSize: 15 }} /> },
      { label: "AI / ML Systems", path: "/services#ai-ml", icon: <PsychologyIcon sx={{ fontSize: 15 }} /> },
      { label: "GovTech", path: "/services#govtech", icon: <SecurityIcon sx={{ fontSize: 15 }} /> },
      { label: "Fintech", path: "/services#fintech", icon: <PaymentsIcon sx={{ fontSize: 15 }} /> },
      { label: "Healthcare", path: "/services#healthcare", icon: <LocalHospitalIcon sx={{ fontSize: 15 }} /> },
      { label: "EdTech", path: "/services#edtech", icon: <SchoolIcon sx={{ fontSize: 15 }} /> },
      { label: "GovTech Suite", path: "/services#gov-suite", icon: <AccountBalanceIcon sx={{ fontSize: 15 }} /> },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Contact", path: "/contact" },
      { label: "Start a Project", path: "/start-project" },
      { label: "Scope Estimator", path: "/estimator" },
      { label: "Submit an RFP", path: "/rfp" },
      { label: "Book a Reading", path: "/book" },
      { label: "FAQ", path: "/faq" },
      { label: "Spec Library", path: "/spec-library" },
      { label: "Help Center", path: "/help" },
    ],
  },
  {
    title: "Legal & Trust",
    links: [
      { label: "Status", path: "/status" },
      { label: "Trust Center", path: "/trust" },
      { label: "Security", path: "/legal/security" },
      { label: "Sub-processors", path: "/legal/subprocessors" },
      { label: "Cookie Policy", path: "/legal/cookies" },
      { label: "DPA", path: "/legal/dpa" },
      { label: "Accessibility", path: "/legal/accessibility" },
      { label: "Privacy", path: "/privacy" },
    ],
  },
];

const socials = [
  { icon: <GitHubIcon fontSize="small" />, label: "GitHub", href: "https://github.com" },
  { icon: <LinkedInIcon fontSize="small" />, label: "LinkedIn", href: "https://linkedin.com" },
  { icon: <TwitterIcon fontSize="small" />, label: "Twitter", href: "https://twitter.com" },
  { icon: <YouTubeIcon fontSize="small" />, label: "YouTube", href: "https://youtube.com" },
  { icon: <DiscordIcon fontSize="small" />, label: "Community", href: "https://discord.com" },
  { icon: <EmailIcon fontSize="small" />, label: "Email", href: "mailto:hello@neurodynecorp.com" },
];

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <IconButton
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      sx={{
        position: "fixed",
        bottom: 24,
        left: 24,
        zIndex: 1200,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        color: "primary.main",
        borderRadius: 0,
        "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
      }}
    >
      <KeyboardArrowUpIcon />
    </IconButton>
  );
}

export default function Footer() {
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";
  const gridLine = dark ? "rgba(108, 99, 255, 0.12)" : "rgba(91, 84, 238, 0.14)";
  const accent = dark ? "rgba(139, 133, 255, 0.85)" : "rgba(91, 84, 238, 0.9)";
  const labelColor = dark ? "rgba(148, 163, 184, 0.6)" : "rgba(71, 85, 105, 0.7)";

  return (
    <>
      <Box
        component="footer"
        sx={{
          position: "relative",
          mt: 10,
          borderTop: `1px solid ${gridLine}`,
          bgcolor: dark ? "rgba(10, 14, 26, 0.6)" : "rgba(248, 250, 252, 0.7)",
          backgroundImage: dark
            ? "radial-gradient(1200px 300px at 50% 0%, rgba(108,99,255,0.06), transparent)"
            : "radial-gradient(1200px 300px at 50% 0%, rgba(91,84,238,0.05), transparent)",
          overflow: "hidden",
        }}
      >
        <HudCorners color={gridLine} size={22} inset={14} />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, py: { xs: 6, md: 8 } }}>
          <Grid container spacing={{ xs: 4, md: 3 }}>
            {/* Brand column */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack direction="row" sx={{ alignItems: "center", gap: 1.5, mb: 2 }}>
                <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
                  <Logo size={34} />
                </motion.div>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: "0.02em",
                    background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  NeuroDyne Corp
                </Typography>
              </Stack>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 320, lineHeight: 1.8 }}>
                A productized software engineering studio founded by Stanley Asoku Hayford. Shipping structured,
                professional solutions for fintech, govtech, healthcare, and education across Africa and beyond.
              </Typography>

              <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap", mb: 3 }}>
                {socials.map((s) => (
                  <IconButton
                    key={s.label}
                    component="a"
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    size="small"
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 0,
                      border: `1px solid ${gridLine}`,
                      color: "text.secondary",
                      transition: "all 0.25s ease",
                      "&:hover": { borderColor: accent, color: "primary.main", transform: "translateY(-2px)" },
                    }}
                  >
                    {s.icon}
                  </IconButton>
                ))}
              </Stack>

              {/* status */}
              <Stack
                direction="row"
                sx={{
                  alignItems: "center",
                  gap: 1,
                  px: 1.5,
                  py: 0.75,
                  width: "fit-content",
                  border: `1px solid ${dark ? "rgba(16,185,129,0.3)" : "rgba(5,150,105,0.3)"}`,
                  borderRadius: 0,
                }}
              >
                <Box sx={{ position: "relative", width: 8, height: 8 }}>
                  <Box sx={{ position: "absolute", inset: 0, borderRadius: "50%", bgcolor: "success.main" }} />
                  <motion.div
                    animate={{ scale: [1, 2.4], opacity: [0.6, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    style={{ position: "absolute", inset: 0, borderRadius: "50%", background: theme.palette.success.main }}
                  />
                </Box>
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.72rem", letterSpacing: "0.08em", color: "success.main" }}>
                  All systems operational
                </Typography>
              </Stack>
            </Grid>

            {/* Nav columns */}
            {footerSections.map((section) => (
              <Grid
                key={section.title}
                size={{ xs: 6, md: 2 }}
                sx={{ borderLeft: { md: `1px solid ${gridLine}` }, pl: { md: 3 } }}
              >
                <Typography
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.62rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.3em",
                    color: labelColor,
                    mb: 2.5,
                    pb: 1,
                    borderBottom: `1px solid ${gridLine}`,
                  }}
                >
                  {section.title}
                </Typography>

                <Stack sx={{ gap: 1.25 }}>
                  {section.links.map((link) => (
                    <MuiLink
                      key={link.path}
                      component={Link as ElementType}
                      to={link.path}
                      underline="none"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.9,
                        color: "text.secondary",
                        fontSize: "0.9rem",
                        transition: "color 0.2s ease, transform 0.2s ease",
                        "& svg": { color: accent, flexShrink: 0 },
                        "&:hover": { color: "primary.main", transform: "translateX(3px)" },
                      }}
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </MuiLink>
                  ))}
                </Stack>
              </Grid>
            ))}
          </Grid>

          {/* Divider */}
          <Box
            sx={{
              mt: 6,
              mb: 3,
              height: "1px",
              background: `linear-gradient(90deg, transparent, ${gridLine}, transparent)`,
            }}
          />

          {/* Bottom bar */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{ justifyContent: "space-between", alignItems: "center", gap: 1.5 }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: "flex", alignItems: "center", gap: 0.6, fontSize: "0.8rem" }}
            >
              &copy; {new Date().getFullYear()} NeuroDyne Corp. Built with
              <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ display: "inline-flex" }}>
                <FavoriteIcon sx={{ fontSize: 13, color: "#EF4444" }} />
              </motion.span>
              &amp; caffeine.
            </Typography>

            <Stack
              direction="row"
              sx={{
                gap: 2.5,
                "& a": {
                  color: "text.secondary",
                  fontSize: "0.8rem",
                  transition: "color 0.2s ease",
                  "&:hover": { color: "primary.main" },
                },
              }}
            >
              <MuiLink component={Link as ElementType} to="/privacy" underline="none">
                Privacy
              </MuiLink>
              <MuiLink component={Link as ElementType} to="/terms" underline="none">
                Terms
              </MuiLink>
              <MuiLink component={Link as ElementType} to="/legal/cookies" underline="none">
                Cookies
              </MuiLink>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <BackToTop />
    </>
  );
}
