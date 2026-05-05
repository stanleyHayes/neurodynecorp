import { useRef, useCallback, useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link as MuiLink,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Link } from "react-router";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
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
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Logo from "@/components/logo/Logo";

const MotionBox = motion.create(Box);
const MotionIconButton = motion.create(IconButton);
const MotionTypography = motion.create(Typography);

/* ─── data ──────────────────────────────────────────────── */

const footerSections = [
  {
    title: "Company",
    links: [
      { label: "About", path: "/about" },
      { label: "Services", path: "/services" },
      { label: "Portfolio", path: "/portfolio" },
      { label: "Blog", path: "/blog" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Custom Software", path: "/services#custom-software", icon: <CodeIcon sx={{ fontSize: 14 }} /> },
      { label: "Mobile Development", path: "/services#mobile", icon: <RocketLaunchIcon sx={{ fontSize: 14 }} /> },
      { label: "AI/ML Systems", path: "/services#ai-ml", icon: <PsychologyIcon sx={{ fontSize: 14 }} /> },
      { label: "Blockchain", path: "/services#blockchain", icon: <SecurityIcon sx={{ fontSize: 14 }} /> },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Contact", path: "/contact" },
      { label: "Start a Project", path: "/start-project" },
      { label: "Spec Library", path: "/spec-library" },
      { label: "Changelog", path: "/changelog" },
      { label: "Open Source", path: "/open-source" },
      { label: "RSS Feed", path: "/feed.xml" },
      { label: "Privacy Policy", path: "/privacy" },
      { label: "Terms of Service", path: "/terms" },
    ],
  },
];

const socials = [
  { icon: <GitHubIcon />, label: "GitHub", color: "#fff" },
  { icon: <LinkedInIcon />, label: "LinkedIn", color: "#0A66C2" },
  { icon: <TwitterIcon />, label: "Twitter", color: "#1DA1F2" },
  { icon: <YouTubeIcon />, label: "YouTube", color: "#FF0000" },
  { icon: <DiscordIcon />, label: "Discord", color: "#5865F2" },
  { icon: <EmailIcon />, label: "Email", color: "#00D4AA" },
];


/* ─── constellation background ──────────────────────────── */

interface Star {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  r: number;
  pulse: number;
  speed: number;
}

function ConstellationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);

  const init = useCallback((canvas: HTMLCanvasElement) => {
    const count = 45;
    const stars: Star[] = [];
    for (let i = 0; i < count; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      stars.push({
        x,
        y,
        baseX: x,
        baseY: y,
        r: Math.random() * 2 + 1,
        pulse: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.005 + 0.002,
      });
    }
    starsRef.current = stars;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      init(canvas);
    };

    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    canvas.addEventListener("mousemove", onMove);

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      const stars = starsRef.current;
      const mouse = mouseRef.current;

      for (const star of stars) {
        star.pulse += star.speed;
        const dx = mouse.x - star.baseX;
        const dy = mouse.y - star.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - dist / 200);
        star.x = star.baseX + dx * influence * 0.15;
        star.y = star.baseY + dy * influence * 0.15;
      }

      // connections
      for (let i = 0; i < stars.length; i++) {
        const a = stars[i]!;
        for (let j = i + 1; j < stars.length; j++) {
          const b = stars[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.15;
            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            grad.addColorStop(0, `rgba(108, 99, 255, ${alpha})`);
            grad.addColorStop(1, `rgba(0, 212, 170, ${alpha})`);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // stars
      for (const star of stars) {
        const glow = 0.5 + Math.sin(star.pulse) * 0.5;
        const gradient = ctx.createRadialGradient(
          star.x,
          star.y,
          0,
          star.x,
          star.y,
          star.r * 4,
        );
        gradient.addColorStop(0, `rgba(108, 99, 255, ${0.8 * glow})`);
        gradient.addColorStop(0.5, `rgba(0, 212, 170, ${0.3 * glow})`);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r * glow, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * glow})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
    };
  }, [init]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "auto",
      }}
    />
  );
}

/* ─── animated wave divider ─────────────────────────────── */

function WaveDivider() {
  return (
    <Box sx={{ position: "relative", height: 80, overflow: "hidden", mt: -1 }}>
      <Box
        component="svg"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        sx={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <defs>
          <linearGradient id="wave-grad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#00D4AA" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6C63FF" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <motion.path
          d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,20 1440,40 L1440,80 L0,80 Z"
          fill="url(#wave-grad)"
          animate={{
            d: [
              "M0,40 C360,80 720,0 1080,40 C1260,60 1380,20 1440,40 L1440,80 L0,80 Z",
              "M0,50 C360,10 720,70 1080,30 C1260,10 1380,60 1440,50 L1440,80 L0,80 Z",
              "M0,40 C360,80 720,0 1080,40 C1260,60 1380,20 1440,40 L1440,80 L0,80 Z",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M0,55 C480,20 960,70 1440,55 L1440,80 L0,80 Z"
          fill="#111827"
          animate={{
            d: [
              "M0,55 C480,20 960,70 1440,55 L1440,80 L0,80 Z",
              "M0,60 C480,75 960,30 1440,60 L1440,80 L0,80 Z",
              "M0,55 C480,20 960,70 1440,55 L1440,80 L0,80 Z",
            ],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </Box>
    </Box>
  );
}

/* ─── orbital social button ─────────────────────────────── */

function SocialOrb({
  icon,
  label,
  color,
  index,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  index: number;
}) {
  return (
    <Tooltip title={label} arrow>
      <MotionIconButton
        size="small"
        aria-label={label}
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
          delay: 0.6 + index * 0.08,
        }}
        whileHover={{
          scale: 1.3,
          rotate: [0, -10, 10, 0],
          transition: { duration: 0.4 },
        }}
        whileTap={{ scale: 0.9 }}
        sx={{
          color: "text.secondary",
          border: "1px solid",
          borderColor: "rgba(108, 99, 255, 0.2)",
          backdropFilter: "blur(8px)",
          background: "rgba(17, 24, 39, 0.6)",
          transition: "all 0.3s ease",
          "&:hover": {
            color,
            borderColor: color,
            boxShadow: `0 0 20px ${color}33, 0 0 40px ${color}11`,
            background: `${color}11`,
          },
        }}
      >
        {icon}
      </MotionIconButton>
    </Tooltip>
  );
}


/* ─── animated link ─────────────────────────────────────── */

function FooterLink({
  label,
  path,
  icon,
  index,
}: {
  label: string;
  path: string;
  icon?: React.ReactNode;
  index: number;
}) {
  return (
    <MotionBox
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3 + index * 0.06, duration: 0.35 }}
    >
      <MuiLink
        component={Link}
        to={path}
        color="text.secondary"
        display="flex"
        alignItems="center"
        gap={1}
        sx={{
          mb: 1.25,
          textDecoration: "none",
          position: "relative",
          py: 0.25,
          transition: "all 0.3s ease",
          "&::before": {
            content: '""',
            position: "absolute",
            left: icon ? -8 : -12,
            top: "50%",
            transform: "translateY(-50%)",
            width: 0,
            height: "60%",
            borderRadius: 4,
            background: "linear-gradient(180deg, #6C63FF, #00D4AA)",
            transition: "width 0.3s ease",
          },
          "&:hover": {
            color: "#F1F5F9",
            pl: 1,
            "&::before": {
              width: 3,
            },
          },
        }}
      >
        {icon && (
          <Box sx={{ opacity: 0.5, display: "flex", alignItems: "center" }}>
            {icon}
          </Box>
        )}
        {label}
      </MuiLink>
    </MotionBox>
  );
}

/* ─── live status pulse ─────────────────────────────────── */

function StatusPulse() {
  return (
    <MotionBox
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 1 }}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        mt: 2,
        px: 1.5,
        py: 0.5,
        borderRadius: "20px",
        border: "1px solid rgba(16, 185, 129, 0.3)",
        background: "rgba(16, 185, 129, 0.05)",
      }}
    >
      <Box sx={{ position: "relative", width: 8, height: 8 }}>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            bgcolor: "#10B981",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: -2,
            borderRadius: "50%",
            bgcolor: "#10B981",
            animation: "statusPing 2s cubic-bezier(0, 0, 0.2, 1) infinite",
            "@keyframes statusPing": {
              "0%": { opacity: 0.8, transform: "scale(1)" },
              "100%": { opacity: 0, transform: "scale(2.5)" },
            },
          }}
        />
      </Box>
      <Typography
        variant="caption"
        sx={{ fontSize: "0.7rem", color: "#10B981", letterSpacing: "0.05em" }}
      >
        All systems operational
      </Typography>
    </MotionBox>
  );
}

/* ─── back to top ───────────────────────────────────────── */

function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <MotionBox
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 20 }}
      transition={{ duration: 0.3 }}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      sx={{
        position: "fixed",
        bottom: 32,
        right: 32,
        zIndex: 50,
        width: 44,
        height: 44,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
        boxShadow: "0 4px 20px rgba(108, 99, 255, 0.4)",
        pointerEvents: show ? "auto" : "none",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: -3,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
          opacity: 0.3,
          animation: "topPulse 2s ease-in-out infinite",
          "@keyframes topPulse": {
            "0%, 100%": { transform: "scale(1)", opacity: 0.3 },
            "50%": { transform: "scale(1.25)", opacity: 0 },
          },
        },
      }}
    >
      <KeyboardArrowUpIcon sx={{ color: "#fff", fontSize: 24 }} />
    </MotionBox>
  );
}

/* ─── glowing section title ─────────────────────────────── */

function SectionTitle({ children, index }: { children: string; index: number }) {
  return (
    <MotionTypography
      variant="subtitle2"
      fontWeight={700}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 + index * 0.1 }}
      sx={{
        mb: 2.5,
        position: "relative",
        display: "inline-block",
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: -6,
          left: 0,
          width: "100%",
          height: 2,
          borderRadius: 1,
          background: "linear-gradient(90deg, #6C63FF, #00D4AA)",
          opacity: 0.6,
        },
      }}
    >
      {children}
    </MotionTypography>
  );
}

/* ─── main footer ───────────────────────────────────────── */

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const isInView = useInView(footerRef, { once: true, margin: "-100px" });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  return (
    <>
      <WaveDivider />
      <Box
        ref={footerRef}
        component="footer"
        sx={{
          position: "relative",
          bgcolor: "#111827",
          overflow: "hidden",
          pt: 8,
          pb: 4,
        }}
        onMouseMove={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          mouseX.set((e.clientX - rect.left) / rect.width);
          mouseY.set((e.clientY - rect.top) / rect.height);
        }}
      >
        {/* constellation bg */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            opacity: isInView ? 1 : 0,
            transition: "opacity 1.5s ease",
          }}
        >
          <ConstellationCanvas />
        </Box>

        {/* gradient orbs for ambient light */}
        <MotionBox
          style={{ x: springX, y: springY }}
          sx={{
            position: "absolute",
            top: "-30%",
            left: "-10%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(108,99,255,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
            filter: "blur(40px)",
          }}
        />
        <MotionBox
          style={{ x: springY, y: springX }}
          sx={{
            position: "absolute",
            bottom: "-20%",
            right: "-10%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,212,170,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
            filter: "blur(40px)",
          }}
        />

        {/* content */}
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={4}>
            {/* brand column */}
            <Grid size={{ xs: 12, md: 4 }}>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                >
                  <Logo size={36} />
                </motion.div>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  NeuroDyne Corp
                </Typography>
              </MotionBox>

              <MotionBox
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2, maxWidth: 300, lineHeight: 1.8 }}
                >
                  A Productized Software Engineering Platform. Transforming ideas
                  into structured, professional software solutions.
                </Typography>
              </MotionBox>

              {/* social orbs */}
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                {socials.map((s, i) => (
                  <SocialOrb key={s.label} {...s} index={i} />
                ))}
              </Box>

              <StatusPulse />
            </Grid>

            {/* nav columns */}
            {footerSections.map((section, si) => (
              <Grid key={section.title} size={{ xs: 6, md: 2.66 }}>
                <SectionTitle index={si}>{section.title}</SectionTitle>
                {section.links.map((link, li) => (
                  <FooterLink
                    key={link.path}
                    label={link.label}
                    path={link.path}
                    icon={"icon" in link ? (link as { icon?: React.ReactNode }).icon : undefined}
                    index={li}
                  />
                ))}
              </Grid>
            ))}
          </Grid>

          {/* bottom bar */}
          <MotionBox
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.8 }}
            sx={{
              mt: 6,
              mb: 3,
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(108,99,255,0.4), rgba(0,212,170,0.4), transparent)",
              transformOrigin: "center",
            }}
          />

          <MotionBox
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1, duration: 0.5 }}
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                fontSize: "0.8rem",
              }}
            >
              &copy; {new Date().getFullYear()} NeuroDyne Corp. Built with
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ display: "inline-flex" }}
              >
                <FavoriteIcon sx={{ fontSize: 14, color: "#EF4444" }} />
              </motion.span>
              &amp; caffeine.
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                "& a": {
                  color: "text.secondary",
                  textDecoration: "none",
                  fontSize: "0.8rem",
                  transition: "color 0.3s ease",
                  "&:hover": { color: "primary.light" },
                },
              }}
            >
              <MuiLink component={Link} to="/privacy">
                Privacy
              </MuiLink>
              <MuiLink component={Link} to="/terms">
                Terms
              </MuiLink>
            </Box>
          </MotionBox>
        </Container>
      </Box>

      <BackToTop />
    </>
  );
}
