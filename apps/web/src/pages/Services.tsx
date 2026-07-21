import { useState, useEffect } from "react";
import HudCorners from "@/components/shared/HudCorners";
import { Box, Typography, Stack, CircularProgress } from "@mui/material";
import { Link } from "react-router";
import { motion } from "framer-motion";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import PhoneIphoneOutlinedIcon from "@mui/icons-material/PhoneIphoneOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import TokenOutlinedIcon from "@mui/icons-material/TokenOutlined";
import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import MiscellaneousServicesOutlinedIcon from "@mui/icons-material/MiscellaneousServicesOutlined";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import EmptyState from "@/components/shared/EmptyState";
import ScopeEstimator from "@/components/shared/ScopeEstimator";
import TrustBadges from "@/components/shared/TrustBadges";
import TechStackPicker from "@/components/shared/TechStackPicker";
import { Container } from "@mui/material";
import { SectionHeading, CardGrid, Overline } from "@/components/shared/Marketing";
import { SERVICE_LINES } from "@/data/serviceLines";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

const MotionBox = motion.create(Box);

const COLORS = ["#6C63FF", "#00D4AA", "#8B85FF", "#33DDBB"];

const ICON_MAP: Record<string, React.ReactNode> = {
  CodeOutlined: <CodeOutlinedIcon />,
  PhoneIphoneOutlined: <PhoneIphoneOutlinedIcon />,
  PsychologyOutlined: <PsychologyOutlinedIcon />,
  TokenOutlined: <TokenOutlinedIcon />,
  CloudOutlined: <CloudOutlinedIcon />,
};

interface ServiceData {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  color: string;
  order: number;
}

const BORDER = "rgba(108, 99, 255, 0.12)";

const ctaItem = {
  title: "Start a Project",
  tag: "INITIATE",
  description: "Tell us about your vision and we'll craft a tailored solution.",
  color: "#00D4AA",
  index: "06",
};

function ServiceCell({ service, index }: { service: ServiceData & { tag: string; index: string; iconNode: React.ReactNode }; index: number }) {
  const [hovered, setHovered] = useState(false);
  const row = index < 3 ? 0 : 1;
  const colsInRow = row === 0 ? 3 : 2;
  const col = row === 0 ? index : index - 3;

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: { xs: 320, md: 380 },
        p: { xs: 3, md: 4 },
        position: "relative",
        overflow: "hidden",
        borderRight: { xs: "none", md: col < colsInRow - 1 ? `1px solid ${BORDER}` : "none" },
        borderBottom: `1px solid ${BORDER}`,
        background: hovered ? `${service.color}06` : "transparent",
        transition: "background 0.3s",
      }}
    >
      {/* Corner brackets */}
      {[
        { top: 12, left: 12, bT: true, bL: true },
        { top: 12, right: 12, bT: true, bR: true },
        { bottom: 12, left: 12, bB: true, bL: true },
        { bottom: 12, right: 12, bB: true, bR: true },
      ].map((pos, ci) => (
        <Box
          key={ci}
          sx={{
            position: "absolute",
            ...(pos.top !== undefined && { top: pos.top }),
            ...(pos.bottom !== undefined && { bottom: pos.bottom }),
            ...(pos.left !== undefined && { left: pos.left }),
            ...(pos.right !== undefined && { right: pos.right }),
            width: 16,
            height: 16,
            borderTop: pos.bT ? `2px solid ${service.color}${hovered ? "80" : "30"}` : "none",
            borderBottom: pos.bB ? `2px solid ${service.color}${hovered ? "80" : "30"}` : "none",
            borderLeft: pos.bL ? `2px solid ${service.color}${hovered ? "80" : "30"}` : "none",
            borderRight: pos.bR ? `2px solid ${service.color}${hovered ? "80" : "30"}` : "none",
            filter: hovered ? `drop-shadow(0 0 6px ${service.color}50)` : "none",
            transition: "all 0.3s",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
      ))}

      {/* Hover glow */}
      {hovered && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "60%",
            height: "60%",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${service.color}10 0%, transparent 70%)`,
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Index */}
      <Typography
        sx={{
          position: "absolute",
          top: 16,
          left: 40,
          fontSize: "0.65rem",
          fontFamily: "monospace",
          color: hovered ? service.color : "text.secondary",
          opacity: 0.5,
          letterSpacing: "0.15em",
          transition: "color 0.3s",
          zIndex: 2,
        }}
      >
        {service.index}
      </Typography>

      {/* Content */}
      <Box sx={{ position: "relative", zIndex: 1 }}>
        {/* Icon */}
        <Box
          sx={{
            color: service.color,
            mb: 2,
            "& .MuiSvgIcon-root": { fontSize: { xs: 36, md: 44 } },
            filter: hovered
              ? `drop-shadow(0 0 10px ${service.color}90) drop-shadow(0 0 24px ${service.color}50)`
              : `drop-shadow(0 0 4px ${service.color}40)`,
            transition: "filter 0.3s",
          }}
        >
          {service.iconNode}
        </Box>

        <Typography
          sx={{
            fontSize: "0.6rem",
            fontFamily: "monospace",
            fontWeight: 600,
            color: service.color,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            mb: 1,
            opacity: 0.7,
          }}
        >
          {service.tag}
        </Typography>

        <Typography
          variant="h5"
          sx={{ fontWeight: 800,
            mb: 1.5,
            color: hovered ? "text.primary" : "text.secondary",
            transition: "color 0.3s",
            letterSpacing: "-0.01em",
            textTransform: "uppercase",
          }}
        >
          {service.title}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            opacity: hovered ? 0.9 : 0.6,
            transition: "opacity 0.3s",
            lineHeight: 1.6,
            mb: 2.5,
          }}
        >
          {service.description}
        </Typography>
      </Box>

      {/* Features list at bottom */}
      <Stack
        spacing={0.75}
        sx={{
          position: "relative",
          zIndex: 1,
          pt: 2,
          borderTop: `1px solid ${BORDER}`,
        }}
      >
        {service.features.map((feature) => (
          <Stack sx={{ alignItems: "center" }} key={feature} direction="row" spacing={1}>
            <CheckOutlinedIcon
              sx={{
                fontSize: 12,
                color: service.color,
                opacity: hovered ? 1 : 0.5,
                filter: hovered ? `drop-shadow(0 0 3px ${service.color}60)` : "none",
                transition: "all 0.3s",
                flexShrink: 0,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontFamily: "monospace",
                fontSize: "0.65rem",
                color: "text.secondary",
                opacity: hovered ? 0.9 : 0.5,
                transition: "opacity 0.3s",
                letterSpacing: "0.02em",
              }}
            >
              {feature}
            </Typography>
          </Stack>
        ))}
      </Stack>

      {/* Bottom accent line */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: "10%",
          right: "10%",
          height: 2,
          background: `linear-gradient(90deg, transparent, ${service.color}, transparent)`,
          opacity: hovered ? 0.6 : 0,
          transition: "opacity 0.3s",
          pointerEvents: "none",
        }}
      />
    </MotionBox>
  );
}

export default function Services() {
  const [ctaHovered, setCtaHovered] = useState(false);
  const [services, setServices] = useState<(ServiceData & { tag: string; index: string; iconNode: React.ReactNode })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/services?status=active`)
      .then((res) => res.json())
      .then((data) => {
        const items = (data.items ?? []).map((item: ServiceData, i: number) => ({
          ...item,
          color: item.color || COLORS[i % COLORS.length],
          tag: item.title.toUpperCase(),
          index: String(i + 1).padStart(2, "0"),
          iconNode: ICON_MAP[item.icon] ?? <CodeOutlinedIcon />,
        }));
        setServices(items);
      })
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SEO
        title="Services"
        description="Custom Software, Mobile Development, AI/ML Systems, Blockchain Solutions, and DevOps & Infrastructure services by NeuroDyne Corp."
        canonical="https://neurodynecorp.com/services"
        ogUrl="https://neurodynecorp.com/services"
      />

      <PageHero
        icon={<MiscellaneousServicesOutlinedIcon />}
        title="Our Services"
        description="Full-spectrum engineering expertise across every major technology domain."
        tag="CAPABILITIES // MATRIX"
        accentWord="Services"
        iconColor="#00D4AA"
        iconLabel="SYSTEMS ONLINE"
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 12 }}>
          <CircularProgress size={32} sx={{ color: "#6C63FF" }} />
        </Box>
      ) : services.length === 0 ? (
        <EmptyState
          icon={<MiscellaneousServicesOutlinedIcon />}
          title="Services coming soon"
          description="We're preparing our full-spectrum engineering capabilities. Check back shortly."
          color="#00D4AA"
        />
      ) : (
        <>
          {/* Grid — row 1: 3 cols, row 2: 2 cols, row 3: full-width CTA */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              borderTop: `1px solid ${BORDER}`,
            }}
          >
            {services.slice(0, 3).map((s, i) => (
              <ServiceCell key={s.id ?? s.index} service={s} index={i} />
            ))}
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
            }}
          >
            {services.slice(3).map((s, i) => (
              <ServiceCell key={s.id ?? s.index} service={s} index={i + 3} />
            ))}
          </Box>
        </>
      )}

      {/* Strategic service lines — deep pages */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <SectionHeading
          tag="§ — SERVICE LINES"
          title="Five ways we engage"
          lead="Beyond the capability matrix, the firm engages along five strategic service lines. Each has its own dedicated page."
          color="#6C63FF"
        />
        <CardGrid columns={3}>
          {SERVICE_LINES.map((s) => (
            <Box
              key={s.slug}
              component={Link}
              to={`/services/${s.slug}`}
              sx={{
                display: "block",
                height: "100%",
                p: { xs: 3, md: 3.5 },
                borderRadius: 0,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: `${s.color}0A`,
                textDecoration: "none",
                color: "inherit",
                transition: "border-color 0.3s, background 0.3s, transform 0.3s",
                "&:hover": { borderColor: `${s.color}66`, bgcolor: `${s.color}14`, transform: "translateY(-3px)" },
              }}
            >
              <HudCorners />
              <Overline color={s.color}>{s.kicker}</Overline>
              <Typography variant="h6" sx={{ fontWeight: 800, mt: 1, mb: 1 }}>
                {s.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {s.positioning}
              </Typography>
            </Box>
          ))}
        </CardGrid>
      </Container>

      {/* Trust badges */}
      <TrustBadges />

      {/* Scope estimator */}
      <Box sx={{ px: { xs: 3, md: 6 }, py: { xs: 6, md: 10 } }}>
        <ScopeEstimator />
      </Box>

      {/* Tech stack picker */}
      <Box sx={{ px: { xs: 3, md: 6 }, pb: { xs: 6, md: 10 } }}>
        <TechStackPicker />
      </Box>

      {/* Full-width CTA row */}
      <Box
        component={Link}
        to="/start-project"
        onMouseEnter={() => setCtaHovered(true)}
        onMouseLeave={() => setCtaHovered(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          py: { xs: 5, md: 6 },
          px: 4,
          position: "relative",
          overflow: "hidden",
          textDecoration: "none",
          color: "inherit",
          cursor: "pointer",
          borderBottom: `1px solid ${BORDER}`,
          background: ctaHovered ? `${ctaItem.color}06` : "transparent",
          transition: "background 0.3s",
        }}
      >
        {/* Corner brackets */}
        {[
          { top: 12, left: 12, bT: true, bL: true },
          { top: 12, right: 12, bT: true, bR: true },
          { bottom: 12, left: 12, bB: true, bL: true },
          { bottom: 12, right: 12, bB: true, bR: true },
        ].map((pos, ci) => (
          <Box
            key={ci}
            sx={{
              position: "absolute",
              ...(pos.top !== undefined && { top: pos.top }),
              ...(pos.bottom !== undefined && { bottom: pos.bottom }),
              ...(pos.left !== undefined && { left: pos.left }),
              ...(pos.right !== undefined && { right: pos.right }),
              width: 16,
              height: 16,
              borderTop: pos.bT ? `2px solid ${ctaItem.color}${ctaHovered ? "80" : "30"}` : "none",
              borderBottom: pos.bB ? `2px solid ${ctaItem.color}${ctaHovered ? "80" : "30"}` : "none",
              borderLeft: pos.bL ? `2px solid ${ctaItem.color}${ctaHovered ? "80" : "30"}` : "none",
              borderRight: pos.bR ? `2px solid ${ctaItem.color}${ctaHovered ? "80" : "30"}` : "none",
              filter: ctaHovered ? `drop-shadow(0 0 6px ${ctaItem.color}50)` : "none",
              transition: "all 0.3s",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
        ))}

        {/* Index */}
        <Typography
          sx={{
            position: "absolute",
            top: 16,
            left: 40,
            fontSize: "0.65rem",
            fontFamily: "monospace",
            color: ctaHovered ? ctaItem.color : "text.secondary",
            opacity: 0.5,
            letterSpacing: "0.15em",
            transition: "color 0.3s",
          }}
        >
          {ctaItem.index}
        </Typography>

        {ctaHovered && (
          <Box
            sx={{
              position: "absolute",
              width: 400,
              height: 200,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${ctaItem.color}10 0%, transparent 70%)`,
              filter: "blur(60px)",
              pointerEvents: "none",
            }}
          />
        )}

        <Box sx={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <Typography
            sx={{
              fontSize: "0.6rem",
              fontFamily: "monospace",
              fontWeight: 600,
              color: ctaItem.color,
              letterSpacing: "0.2em",
              mb: 1,
              opacity: 0.7,
            }}
          >
            {ctaItem.tag}
          </Typography>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800,
              color: ctaHovered ? "text.primary" : "text.secondary",
              transition: "color 0.3s",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              mb: 1,
            }}
          >
            {ctaItem.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ opacity: ctaHovered ? 0.8 : 0.5, transition: "opacity 0.3s" }}>
            {ctaItem.description}
          </Typography>
        </Box>

        <ArrowForwardIcon
          sx={{
            fontSize: 24,
            color: ctaItem.color,
            opacity: ctaHovered ? 1 : 0,
            transform: ctaHovered ? "translateX(0)" : "translateX(-12px)",
            filter: ctaHovered ? `drop-shadow(0 0 8px ${ctaItem.color}60)` : "none",
            transition: "all 0.3s",
            position: "relative",
            zIndex: 1,
          }}
        />

        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: "20%",
            right: "20%",
            height: 2,
            background: `linear-gradient(90deg, transparent, ${ctaItem.color}, transparent)`,
            opacity: ctaHovered ? 0.6 : 0,
            transition: "opacity 0.3s",
            pointerEvents: "none",
          }}
        />
      </Box>
    </>
  );
}
