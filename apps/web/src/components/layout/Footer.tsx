import { PARTNER_INVITATION } from "@/content/interface";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import { useState, useEffect } from "react";
import { Box, Container, Typography, IconButton, Stack } from "@mui/material";
import { Link, NavLink } from "react-router";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Logo from "@/components/logo/Logo";
import { CANON } from "@/content/company";
import { footerSections, socials } from "@/content/footer";
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
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
        })
      }
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
  return (
    <>
      <Box
        component="footer"
        sx={{
          "& a[aria-current=page]": {
            color: "primary.main",
            fontWeight: 750,
            textDecoration: "underline",
            textUnderlineOffset: "5px",
            bgcolor: "action.selected",
          },
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 } }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 3,
              alignItems: "center",
              justifyContent: "space-between",
              pb: 4,
            }}
          >
            <Box sx={{ maxWidth: 510 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
                <Logo size={36} />
                <Typography variant="h6" component="p" sx={{ fontWeight: 800 }}>
                  Neurodyne
                </Typography>
              </Stack>
              <Typography color="text.secondary" sx={{ fontSize: ".95rem", lineHeight: 1.7 }}>
                {CANON.short}
              </Typography>
            </Box>
            <Box
              component={Link}
              to="/partners"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                color: "text.primary",
                textDecoration: "none",
                position: "relative",
                overflow: "hidden",
                p: 2.5,
                width: { xs: "100%", md: 440 },
                border: "1px solid",
                borderColor: "primary.main",
                py: 1.5,
                "&:hover": { color: "primary.main" },
              }}
            >
              <Box aria-hidden sx={{ position: "absolute", right: 12, bottom: -24, opacity: 0.06 }}>
                <HandshakeOutlinedIcon sx={{ fontSize: 160 }} />
              </Box>
              <Box sx={{ position: "relative" }}>
                <Typography sx={{ fontSize: ".7rem", color: "primary.main", mb: 0.75 }}>
                  {PARTNER_INVITATION.eyebrow}
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: "1.3rem", mb: 0.75 }}>
                  {PARTNER_INVITATION.title}
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: ".85rem", lineHeight: 1.6 }}>
                  {PARTNER_INVITATION.description}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mt: 2,
                    color: "primary.main",
                    fontWeight: 600,
                  }}
                >
                  {PARTNER_INVITATION.action}
                  <ArrowForwardIcon sx={{ fontSize: 20 }} />
                </Box>
              </Box>
            </Box>
          </Box>
          <Box
            component="nav"
            aria-label="Footer navigation"
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1.3fr 1fr" },
              gap: { xs: 2, md: 4 },
              borderTop: "1px solid",
              borderColor: "divider",
              py: 3,
            }}
          >
            {footerSections.slice(0, 4).map((section) => (
              <Box key={section.title}>
                <Typography
                  component="h2"
                  sx={{ fontSize: ".74rem", fontWeight: 800, color: "primary.main", mb: 1.5 }}
                >
                  {section.title}
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr" },
                    gap: 0.25,
                  }}
                >
                  {section.links.map((link) => (
                    <Box
                      component={NavLink}
                      end={link.path === "/company/engineering-services"}
                      to={link.path}
                      key={link.path}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        py: 0.65,
                        fontSize: ".83rem",
                        textDecoration: "none",
                        color: "text.secondary",
                        "& svg": { fontSize: 16, flexShrink: 0 },
                        "&:hover, &:focus-visible": { color: "primary.main" },
                      }}
                    >
                      {link.icon}
                      {link.label}
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
          <Box sx={{ borderTop: "1px solid", borderColor: "divider", py: 2 }}>
            <Typography component="h2" sx={{ fontSize: ".74rem", fontWeight: 800, mb: 1 }}>
              Legal & trust
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", columnGap: 2, rowGap: 0.5 }}>
              {[...footerSections[4]!.links, { label: "Terms", path: "/terms" }].map((link) => (
                <Box
                  component={NavLink}
                  end={link.path === "/company/engineering-services"}
                  to={link.path}
                  key={link.path}
                  sx={{
                    color: "text.secondary",
                    fontSize: ".76rem",
                    textDecoration: "none",
                    py: 0.5,
                    "&:hover, &:focus-visible": {
                      color: "primary.main",
                      textDecoration: "underline",
                    },
                  }}
                >
                  {link.label}
                </Box>
              ))}
            </Box>
          </Box>
          <Box
            sx={{
              borderTop: "1px solid",
              borderColor: "divider",
              pt: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box>
              <Typography sx={{ fontSize: ".72rem", color: "text.secondary" }}>
                © {new Date().getFullYear()} Neurodyne Corp
              </Typography>
              <Typography sx={{ fontSize: ".72rem", mt: 0.5, color: "text.secondary" }}>
                {CANON.geography}
              </Typography>
            </Box>
            <Stack direction="row">
              {socials.map((s) => (
                <IconButton key={s.label} component="a" href={s.href} aria-label={s.label}>
                  {s.icon}
                </IconButton>
              ))}
            </Stack>
          </Box>
        </Container>
      </Box>
      <BackToTop />
    </>
  );
}
