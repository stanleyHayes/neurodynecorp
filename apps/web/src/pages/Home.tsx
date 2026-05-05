import { useState, useEffect } from "react";
import { Box, Typography, Stack, Avatar, Chip, Button, CircularProgress } from "@mui/material";
import { Link } from "react-router";
import { motion } from "framer-motion";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import PhoneIphoneOutlinedIcon from "@mui/icons-material/PhoneIphoneOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import TokenOutlinedIcon from "@mui/icons-material/TokenOutlined";
import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FormatQuoteOutlinedIcon from "@mui/icons-material/FormatQuoteOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import SEO, { SITE_URL } from "@/components/seo/SEO";
import LogoWall from "@/components/shared/LogoWall";
import TrustBadges from "@/components/shared/TrustBadges";
import ActivityTicker from "@/components/shared/ActivityTicker";
import FounderNote from "@/components/shared/FounderNote";
import NewsletterCTA from "@/components/shared/NewsletterCTA";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

const MotionBox = motion.create(Box);

const BORDER = "rgba(108, 99, 255, 0.12)";

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
  color: string;
}

interface TestimonialData {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  avatarColor: string;
}

interface CaseStudyData {
  id: string;
  title: string;
  client: string;
  category: string;
  tags: string[];
  description: string;
  impact: string;
  color: string;
}

// ── Reusable cell ──

function Cell({
  children,
  color,
  index,
  colInRow,
  totalCols,
  minH = { xs: 240, md: 300 },
  animDelay = 0,
  onClick,
  component,
  to,
}: {
  children: React.ReactNode;
  color: string;
  index: string;
  colInRow: number;
  totalCols: number;
  minH?: Record<string, number>;
  animDelay?: number;
  onClick?: () => void;
  component?: React.ElementType;
  to?: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: animDelay }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      {...(component && to ? { component, to } : {})}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        minHeight: minH,
        p: { xs: 3, md: 4 },
        position: "relative",
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        cursor: onClick || to ? "pointer" : "default",
        borderRight: { xs: "none", md: colInRow < totalCols - 1 ? `1px solid ${BORDER}` : "none" },
        borderBottom: `1px solid ${BORDER}`,
        background: hovered ? `${color}06` : "transparent",
        transition: "background 0.3s",
      }}
    >
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
            borderTop: pos.bT ? `2px solid ${color}${hovered ? "80" : "30"}` : "none",
            borderBottom: pos.bB ? `2px solid ${color}${hovered ? "80" : "30"}` : "none",
            borderLeft: pos.bL ? `2px solid ${color}${hovered ? "80" : "30"}` : "none",
            borderRight: pos.bR ? `2px solid ${color}${hovered ? "80" : "30"}` : "none",
            filter: hovered ? `drop-shadow(0 0 6px ${color}50)` : "none",
            transition: "all 0.3s",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
      ))}

      {hovered && (
        <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "60%", height: "60%", borderRadius: "50%", background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`, filter: "blur(40px)", pointerEvents: "none" }} />
      )}

      <Typography sx={{ position: "absolute", top: 16, left: 40, fontSize: "0.65rem", fontFamily: "monospace", color: hovered ? color : "text.secondary", opacity: 0.5, letterSpacing: "0.15em", transition: "color 0.3s", zIndex: 2 }}>
        {index}
      </Typography>

      <Box sx={{ position: "absolute", bottom: 0, left: "10%", right: "10%", height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, opacity: hovered ? 0.6 : 0, transition: "opacity 0.3s", pointerEvents: "none" }} />

      <Box sx={{ position: "relative", zIndex: 1 }}>{children}</Box>
    </MotionBox>
  );
}

function SectionLabel({ text, color = "#6C63FF" }: { text: string; color?: string }) {
  return (
    <Box sx={{ borderBottom: `1px solid ${BORDER}`, py: 2, px: 4 }}>
      <Typography sx={{ fontSize: "0.7rem", fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.3em", color, filter: `drop-shadow(0 0 6px ${color}60)` }}>
        {text}
      </Typography>
    </Box>
  );
}

function LoadingRow() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8, borderBottom: `1px solid ${BORDER}` }}>
      <CircularProgress size={28} sx={{ color: "#6C63FF" }} />
    </Box>
  );
}

// ── Page ──

export default function Home() {
  const [services, setServices] = useState<(ServiceData & { index: string; iconNode: React.ReactNode })[]>([]);
  const [testimonials, setTestimonials] = useState<(TestimonialData & { index: string; avatar: string; color: string })[]>([]);
  const [caseStudies, setCaseStudies] = useState<(CaseStudyData & { index: string })[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [loadingCaseStudies, setLoadingCaseStudies] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/services?status=active`)
      .then((res) => res.json())
      .then((data) => {
        const items = (data.items ?? []).slice(0, 5).map((item: ServiceData, i: number) => ({
          ...item,
          color: item.color || COLORS[i % COLORS.length],
          index: String(i + 1).padStart(2, "0"),
          iconNode: ICON_MAP[item.icon] ?? <CodeOutlinedIcon />,
        }));
        setServices(items);
      })
      .catch(() => setServices([]))
      .finally(() => setLoadingServices(false));

    fetch(`${API_URL}/api/v1/testimonials?status=active`)
      .then((res) => res.json())
      .then((data) => {
        const items = (data.items ?? []).slice(0, 3).map((item: TestimonialData, i: number) => ({
          ...item,
          color: item.avatarColor || COLORS[i % COLORS.length],
          avatar: item.name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
          index: String(i + 6).padStart(2, "0"),
        }));
        setTestimonials(items);
      })
      .catch(() => setTestimonials([]))
      .finally(() => setLoadingTestimonials(false));

    fetch(`${API_URL}/api/v1/portfolio?status=published`)
      .then((res) => res.json())
      .then((data) => {
        const items = (data.items ?? []).slice(0, 3).map((item: CaseStudyData, i: number) => ({
          ...item,
          color: item.color || COLORS[i % COLORS.length],
          index: String(i + 9).padStart(2, "0"),
        }));
        setCaseStudies(items);
      })
      .catch(() => setCaseStudies([]))
      .finally(() => setLoadingCaseStudies(false));
  }, []);

  return (
    <>
      <SEO
        title="Home"
        description="NeuroDyne Corp - A Productized Software Engineering Platform. Custom Software, Mobile, AI/ML, Blockchain, and DevOps solutions."
        canonical={SITE_URL}
        ogUrl={SITE_URL}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "NeuroDyne Corp",
          description: "Productized Software Engineering Platform",
          url: SITE_URL,
          logo: `${SITE_URL}/og-image.png`,
          sameAs: [],
        }}
      />

      {/* ═══ HERO — full-width cell ═══ */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.4fr 0.6fr" },
          borderBottom: `1px solid ${BORDER}`,
          minHeight: { xs: "70vh", md: "85vh" },
        }}
      >
        {/* Left — headline */}
        <Cell color="#6C63FF" index="00" colInRow={0} totalCols={2} minH={{ xs: 400, md: 600 }}>
          <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <Typography
              sx={{
                fontSize: "0.6rem",
                fontFamily: "monospace",
                fontWeight: 600,
                color: "#6C63FF",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                mb: 3,
                opacity: 0.7,
              }}
            >
              PRODUCTIZED SOFTWARE ENGINEERING
            </Typography>

            <Box sx={{ mb: 3 }}>
              <ActivityTicker />
            </Box>

            <Typography
              variant="h1"
              sx={{
                mb: 3,
                fontSize: { xs: "2.5rem", md: "3.8rem" },
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                color: "text.secondary",
              }}
            >
              Transform Your Ideas
              <br />
              Into{" "}
              <Box
                component="span"
                sx={{
                  background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Professional Software
              </Box>
            </Typography>

            <Typography
              variant="body1"
              sx={{ mb: 5, maxWidth: 520, color: "text.secondary", opacity: 0.7, lineHeight: 1.8 }}
            >
              Replace vague conversations with structured intelligence. From concept to specification to delivery — fully automated.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/start-project"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
                  fontWeight: 700,
                  px: 4,
                  "&:hover": { boxShadow: "0 4px 24px rgba(108,99,255,0.4)" },
                }}
              >
                Start a Project
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={Link}
                to="/portfolio"
                sx={{
                  borderColor: "rgba(108,99,255,0.2)",
                  color: "text.secondary",
                  fontWeight: 600,
                  "&:hover": { borderColor: "rgba(108,99,255,0.4)", color: "text.primary" },
                }}
              >
                View Our Work
              </Button>
            </Stack>
          </MotionBox>
        </Cell>

        {/* Right — stats */}
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {[
            { value: "50+", label: "Projects Delivered", color: "#6C63FF" },
            { value: "92%", label: "On-Time Delivery", color: "#00D4AA" },
            { value: "4.8", label: "Client Satisfaction", color: "#8B85FF" },
          ].map((stat, i) => (
            <Cell key={stat.label} color={stat.color} index={`0${i}`} colInRow={1} totalCols={2} minH={{ xs: 120, md: 0 }} animDelay={0.2 + i * 0.1}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h2"
                  fontWeight={800}
                  sx={{
                    color: stat.color,
                    filter: `drop-shadow(0 0 8px ${stat.color}40)`,
                    letterSpacing: "-0.02em",
                    mb: 0.5,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.65rem",
                    color: "text.secondary",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    opacity: 0.5,
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>
            </Cell>
          ))}
        </Box>
      </Box>

      {/* ═══ SERVICES ═══ */}
      <SectionLabel text="WHAT WE BUILD" color="#6C63FF" />

      {loadingServices ? (
        <LoadingRow />
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: `repeat(${Math.min(services.length, 5)}, 1fr)` } }}>
          {services.map((s, i) => (
            <Cell key={s.id ?? s.index} color={s.color} index={s.index} colInRow={i} totalCols={Math.min(services.length, 5)} minH={{ xs: 200, md: 260 }} animDelay={i * 0.05} component={Link} to="/services">
              <Box sx={{ color: s.color, mb: 2, "& .MuiSvgIcon-root": { fontSize: { xs: 32, md: 40 } }, filter: `drop-shadow(0 0 4px ${s.color}40)` }}>
                {s.iconNode}
              </Box>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1, letterSpacing: "0.03em", textTransform: "uppercase", color: "text.secondary", fontSize: { xs: "0.85rem", md: "1rem" } }}>
                {s.title}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.6, lineHeight: 1.5 }}>
                {s.description}
              </Typography>
            </Cell>
          ))}
        </Box>
      )}

      {/* ═══ LOGO WALL + TRUST ═══ */}
      <LogoWall />
      <TrustBadges />

      {/* ═══ FOUNDER NOTE ═══ */}
      <FounderNote />

      {/* ═══ NEWSLETTER ═══ */}
      <Box sx={{ px: { xs: 2, md: 6 }, py: { xs: 2, md: 4 } }}>
        <NewsletterCTA />
      </Box>

      {/* ═══ TESTIMONIALS ═══ */}
      <SectionLabel text="WHAT CLIENTS SAY" color="#00D4AA" />

      {loadingTestimonials ? (
        <LoadingRow />
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" } }}>
          {testimonials.map((t, i) => (
            <Cell key={t.id ?? t.index} color={t.color} index={t.index} colInRow={i} totalCols={3} minH={{ xs: 240, md: 300 }} animDelay={i * 0.08}>
              <FormatQuoteOutlinedIcon sx={{ fontSize: 28, color: t.color, filter: `drop-shadow(0 0 4px ${t.color}40)`, mb: 2, opacity: 0.6 }} />
              <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.8, fontStyle: "italic", mb: 3, opacity: 0.8 }}>
                "{t.content}"
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: "auto", pt: 2, borderTop: `1px solid ${BORDER}` }}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    background: `linear-gradient(135deg, ${t.color}30, ${t.color}10)`,
                    border: `1px solid ${t.color}30`,
                    color: t.color,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    fontFamily: "monospace",
                  }}
                >
                  {t.avatar}
                </Avatar>
                <Box>
                  <Typography variant="caption" fontWeight={700} sx={{ lineHeight: 1.2, display: "block" }}>
                    {t.name}
                  </Typography>
                  <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", color: t.color, opacity: 0.7, letterSpacing: "0.05em" }}>
                    {t.role}{t.company ? `, ${t.company}` : ""}
                  </Typography>
                </Box>
              </Stack>
            </Cell>
          ))}
        </Box>
      )}

      {/* ═══ FEATURED PROJECTS ═══ */}
      <SectionLabel text="FEATURED PROJECTS" color="#6C63FF" />

      {loadingCaseStudies ? (
        <LoadingRow />
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" } }}>
          {caseStudies.map((cs, i) => (
            <Cell key={cs.id ?? cs.index} color={cs.color} index={cs.index} colInRow={i} totalCols={3} minH={{ xs: 220, md: 280 }} animDelay={i * 0.08} component={Link} to="/portfolio">
              <Typography sx={{ fontSize: "0.6rem", fontFamily: "monospace", fontWeight: 600, color: cs.color, letterSpacing: "0.2em", textTransform: "uppercase", mb: 1, opacity: 0.7 }}>
                {cs.category}
              </Typography>
              <Typography variant="h4" fontWeight={800} sx={{ mb: 1.5, letterSpacing: "-0.02em", color: "text.secondary" }}>
                {cs.title}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.6, lineHeight: 1.6, mb: 2.5 }}>
                {cs.description}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ pt: 2, borderTop: `1px solid ${BORDER}` }}>
                {cs.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{
                      fontSize: "0.6rem",
                      fontFamily: "monospace",
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                      height: 22,
                      background: `${cs.color}10`,
                      color: cs.color,
                      border: `1px solid ${cs.color}20`,
                    }}
                  />
                ))}
              </Stack>
            </Cell>
          ))}
        </Box>
      )}

      {/* ═══ CTA ═══ */}
      <Box
        component={Link}
        to="/start-project"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          py: { xs: 6, md: 8 },
          px: 4,
          position: "relative",
          overflow: "hidden",
          textDecoration: "none",
          color: "inherit",
          cursor: "pointer",
          borderBottom: `1px solid ${BORDER}`,
          transition: "background 0.3s",
          "&:hover": {
            background: "rgba(0,212,170,0.04)",
            "& .cta-arrow": { opacity: 1, transform: "translateX(0)" },
            "& .cta-brackets Box": { borderColor: "#00D4AA80" },
          },
        }}
      >
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
              borderTop: pos.bT ? "2px solid #00D4AA30" : "none",
              borderBottom: pos.bB ? "2px solid #00D4AA30" : "none",
              borderLeft: pos.bL ? "2px solid #00D4AA30" : "none",
              borderRight: pos.bR ? "2px solid #00D4AA30" : "none",
              transition: "all 0.3s",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
        ))}

        <Box sx={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <RocketLaunchOutlinedIcon sx={{ fontSize: 40, color: "#00D4AA", filter: "drop-shadow(0 0 8px rgba(0,212,170,0.4))", mb: 2 }} />
          <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: "-0.02em", textTransform: "uppercase", color: "text.secondary", mb: 1 }}>
            Ready to Build?
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.6, mb: 2 }}>
            Start with our intelligent project questionnaire and get a professional specification in minutes.
          </Typography>
          <ArrowForwardIcon
            className="cta-arrow"
            sx={{
              fontSize: 24,
              color: "#00D4AA",
              opacity: 0,
              transform: "translateX(-12px)",
              filter: "drop-shadow(0 0 6px rgba(0,212,170,0.5))",
              transition: "all 0.3s",
            }}
          />
        </Box>
      </Box>
    </>
  );
}
