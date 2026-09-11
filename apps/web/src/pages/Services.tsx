import { Box, Container, Typography, Button } from "@mui/material";
import { Link } from "react-router";
import ArchitectureOutlinedIcon from "@mui/icons-material/ArchitectureOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import WebOutlinedIcon from "@mui/icons-material/WebOutlined";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import ScopeEstimator from "@/components/shared/ScopeEstimator";
import TechStackPicker from "@/components/shared/TechStackPicker";
import { SERVICE_LINES } from "@/data/serviceLines";
import { SERVICES_OVERVIEW } from "@/content/interface";

const icons = [
  ArchitectureOutlinedIcon,
  AccountBalanceOutlinedIcon,
  PsychologyOutlinedIcon,
  WebOutlinedIcon,
  ExploreOutlinedIcon,
];

export default function Services() {
  return (
    <>
      <SEO
        title="Engineering Services"
        description={SERVICES_OVERVIEW.description}
        canonical="https://neurodyne.dev/company/engineering-services"
      />
      <PageHero
        icon={<ArchitectureOutlinedIcon />}
        title="Engineering Services"
        description={SERVICES_OVERVIEW.description}
        tag="COMPANY // ENGINEERING"
        accentWord="Services"
        iconColor="#00D4AA"
        iconLabel="WAYS TO ENGAGE"
      />
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Typography component="h2" variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
          {SERVICES_OVERVIEW.title}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
            borderTop: "1px solid",
            borderLeft: "1px solid",
            borderColor: "divider",
          }}
        >
          {SERVICE_LINES.map((service, index) => {
            const Icon = icons[index] ?? ArchitectureOutlinedIcon;
            return (
              <Box
                component={Link}
                to={`/company/engineering-services/${service.slug}`}
                key={service.slug}
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  p: 3,
                  borderRight: "1px solid",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  color: "text.primary",
                  textDecoration: "none",
                  "&:hover, &:focus-visible": {
                    bgcolor: "action.hover",
                    outline: "2px solid",
                    outlineColor: "primary.main",
                    outlineOffset: -2,
                  },
                }}
              >
                <Box
                  aria-hidden
                  sx={{ position: "absolute", bottom: 50, right: -25, opacity: 0.045 }}
                >
                  <Icon sx={{ fontSize: 190 }} />
                </Box>
                <Box sx={{ position: "relative", flex: 1 }}>
                  <Box
                    aria-hidden
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                      color: service.color,
                    }}
                  >
                    <Icon sx={{ fontSize: 34 }} />
                    <Typography sx={{ fontFamily: "monospace", fontSize: ".7rem" }}>
                      {String(index + 1).padStart(2, "0")}
                    </Typography>
                  </Box>
                  <Typography
                    component="h3"
                    sx={{ fontWeight: 750, fontSize: "1.2rem", lineHeight: 1.4, mb: 1.5 }}
                  >
                    {service.name}
                  </Typography>
                  <Typography color="text.secondary" sx={{ fontSize: ".9rem", lineHeight: 1.75 }}>
                    {service.positioning}
                  </Typography>
                  <Box
                    component="ul"
                    sx={{
                      pl: 2,
                      my: 2.5,
                      color: "text.secondary",
                      "& li": { mb: 0.75, fontSize: ".82rem", lineHeight: 1.6 },
                    }}
                  >
                    {service.deliverables.slice(0, 3).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid",
                    borderColor: "divider",
                    pt: 2,
                    color: "primary.main",
                    fontSize: ".85rem",
                    fontWeight: 600,
                  }}
                >
                  Explore this service
                  <ArrowForwardIcon sx={{ fontSize: 20 }} />
                </Box>
              </Box>
            );
          })}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              p: 3,
              borderRight: "1px solid",
              borderBottom: "1px solid",
              borderColor: "divider",
              bgcolor: "action.hover",
            }}
          >
            <AddOutlinedIcon sx={{ fontSize: 38, color: "primary.main", mb: 2 }} />
            <Typography component="h3" sx={{ fontSize: "1.3rem", fontWeight: 700, mb: 1.5 }}>
              {SERVICES_OVERVIEW.helpTitle}
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: ".9rem", lineHeight: 1.75, mb: 3 }}>
              {SERVICES_OVERVIEW.helpBody}
            </Typography>
            <Button
              component={Link}
              to="/company/engineering-services/brief"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
            >
              Describe your project
            </Button>
          </Box>
        </Box>
      </Container>
      <Container maxWidth="lg" sx={{ pb: { xs: 4, md: 6 } }}>
        <ScopeEstimator />
      </Container>
      <Container maxWidth="lg" sx={{ pb: { xs: 4, md: 6 } }}>
        <TechStackPicker />
      </Container>
    </>
  );
}
