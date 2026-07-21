import { useRef, useEffect, useCallback, useState } from "react";
import { Box, Container, Typography, Chip, Divider, Button, Stack, Avatar, Skeleton } from "@mui/material";
import { Link, useParams } from "react-router";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SEO, { SITE_URL } from "@/components/seo/SEO";
import ReadingProgress from "@/components/shared/ReadingProgress";
import PostReactions from "@/components/shared/PostReactions";
import NewsletterCTA from "@/components/shared/NewsletterCTA";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

const MotionBox = motion.create(Box);
const MotionTypography = motion.create(Typography);

const BORDER = "rgba(108, 99, 255, 0.12)";
const COLORS = ["#6C63FF", "#00D4AA", "#8B85FF", "#33DDBB"];

/* ─── floating mesh canvas ──────────────────────────────── */

function MeshCanvas({ color }: { color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef(0);

  const hexToRgb = useCallback((hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rgb = hexToRgb(color);

    interface Orb {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      color: { r: number; g: number; b: number };
      alpha: number;
    }

    let orbs: Orb[] = [];
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);

      orbs = Array.from({ length: 6 }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 150 + 100,
        color: i % 2 === 0 ? rgb : { r: 0, g: 212, b: 170 },
        alpha: Math.random() * 0.12 + 0.04,
      }));
    };

    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / w,
        y: (e.clientY - rect.top) / h,
      };
    };
    canvas.addEventListener("mousemove", onMove);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const orb of orbs) {
        orb.x += orb.vx + (mx - 0.5) * 0.3;
        orb.y += orb.vy + (my - 0.5) * 0.3;
        if (orb.x < -orb.r) orb.x = w + orb.r;
        if (orb.x > w + orb.r) orb.x = -orb.r;
        if (orb.y < -orb.r) orb.y = h + orb.r;
        if (orb.y > h + orb.r) orb.y = -orb.r;

        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        grad.addColorStop(0, `rgba(${orb.color.r},${orb.color.g},${orb.color.b},${orb.alpha})`);
        grad.addColorStop(1, `rgba(${orb.color.r},${orb.color.g},${orb.color.b},0)`);
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
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
  }, [color, hexToRgb]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "auto" }}
    />
  );
}

/* ─── floating geometric shapes ─────────────────────────── */

function FloatingShape({
  shape,
  size,
  x,
  y,
  color,
  delay,
  duration,
}: {
  shape: "circle" | "ring" | "diamond" | "cross";
  size: number;
  x: string;
  y: string;
  color: string;
  delay: number;
  duration: number;
}) {
  const shapeEl = {
    circle: (
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: `${color}15`,
          border: `1px solid ${color}25`,
        }}
      />
    ),
    ring: (
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: `2px solid ${color}20`,
        }}
      />
    ),
    diamond: (
      <Box
        sx={{
          width: size,
          height: size,
          background: `${color}12`,
          border: `1px solid ${color}20`,
          transform: "rotate(45deg)",
          borderRadius: 2,
        }}
      />
    ),
    cross: (
      <Box sx={{ position: "relative", width: size, height: size }}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: 0,
            width: "100%",
            height: 2,
            background: `${color}25`,
            transform: "translateY(-50%)",
            borderRadius: 1,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            top: 0,
            height: "100%",
            width: 2,
            background: `${color}25`,
            transform: "translateX(-50%)",
            borderRadius: 1,
          }}
        />
      </Box>
    ),
  };

  return (
    <MotionBox
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1, 1, 0.5],
        y: [0, -20, 20, 0],
        rotate: [0, 90, 180, 360],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      sx={{
        position: "absolute",
        left: x,
        top: y,
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {shapeEl[shape]}
    </MotionBox>
  );
}

/* ─── scan line effect ──────────────────────────────────── */

function ScanLine({ color }: { color: string }) {
  return (
    <MotionBox
      animate={{ top: ["-5%", "110%"] }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
      sx={{
        position: "absolute",
        left: 0,
        right: 0,
        height: "1px",
        background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
        zIndex: 2,
        pointerEvents: "none",
      }}
    />
  );
}

/* ─── grid skeleton loader ──────────────────────────────── */

function BlogPostSkeleton() {
  const SK = "rgba(108,99,255,0.08)";

  return (
    <Box>
      {/* Banner skeleton */}
      <Box
        sx={{
          position: "relative",
          minHeight: { xs: 420, md: 520 },
          bgcolor: "#0A0E1A",
          overflow: "hidden",
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(108,99,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(108,99,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1, pb: { xs: 5, md: 7 }, pt: { xs: 12, md: 16 } }}>
          {/* Back button skeleton */}
          <Skeleton variant="rounded" width={120} height={32} sx={{ bgcolor: SK, borderRadius: 4, mb: 4 }} />

          {/* Meta row skeleton */}
          <Stack direction="row" spacing={1.5} sx={{ mb: 2.5 }}>
            <Skeleton variant="rounded" width={80} height={24} sx={{ bgcolor: SK, borderRadius: 4 }} />
            <Skeleton variant="rounded" width={110} height={20} sx={{ bgcolor: SK, borderRadius: 2 }} />
            <Skeleton variant="rounded" width={80} height={20} sx={{ bgcolor: SK, borderRadius: 2 }} />
          </Stack>

          {/* Title skeleton */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 1, mb: 3 }}>
            <Skeleton variant="text" sx={{ bgcolor: SK, fontSize: { xs: "2rem", md: "3rem" }, width: "90%" }} />
            <Skeleton variant="text" sx={{ bgcolor: SK, fontSize: { xs: "2rem", md: "3rem" }, width: "60%" }} />
          </Box>

          {/* Author skeleton */}
          <Stack sx={{ alignItems: "center" }} direction="row" spacing={1.5}>
            <Skeleton variant="circular" width={34} height={34} sx={{ bgcolor: SK }} />
            <Box>
              <Skeleton variant="text" width={100} sx={{ bgcolor: SK }} />
              <Skeleton variant="text" width={70} sx={{ bgcolor: SK, fontSize: "0.7rem" }} />
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Content skeleton — grid-style blocks */}
      <Box sx={{ py: { xs: 5, md: 8 } }}>
        <Container maxWidth="md">
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 0 }}>
            {/* Intro paragraph block */}
            <Box sx={{ borderBottom: `1px solid ${BORDER}`, pb: 4, mb: 4 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={`intro-${i}`}
                  variant="text"
                  sx={{ bgcolor: SK, width: i === 3 ? "45%" : "100%", fontSize: "1rem", mb: 0.5 }}
                />
              ))}
            </Box>

            {/* Section blocks mimicking grid cells */}
            {Array.from({ length: 3 }).map((_, section) => (
              <Box
                key={section}
                sx={{
                  position: "relative",
                  p: { xs: 2, md: 3 },
                  mb: 0,
                  borderBottom: `1px solid ${BORDER}`,
                  borderLeft: `1px solid ${BORDER}`,
                  borderRight: `1px solid ${BORDER}`,
                  ...(section === 0 && { borderTop: `1px solid ${BORDER}` }),
                }}
              >
                {/* Corner brackets */}
                {[
                  { top: 8, left: 8, bT: true, bL: true },
                  { top: 8, right: 8, bT: true, bR: true },
                  { bottom: 8, left: 8, bB: true, bL: true },
                  { bottom: 8, right: 8, bB: true, bR: true },
                ].map((pos, i) => (
                  <Box
                    key={i}
                    sx={{
                      position: "absolute",
                      ...(pos.top !== undefined && { top: pos.top }),
                      ...(pos.bottom !== undefined && { bottom: pos.bottom }),
                      ...(pos.left !== undefined && { left: pos.left }),
                      ...(pos.right !== undefined && { right: pos.right }),
                      width: 12,
                      height: 12,
                      borderTop: pos.bT ? `1.5px solid rgba(108,99,255,0.12)` : "none",
                      borderBottom: pos.bB ? `1.5px solid rgba(108,99,255,0.12)` : "none",
                      borderLeft: pos.bL ? `1.5px solid rgba(108,99,255,0.12)` : "none",
                      borderRight: pos.bR ? `1.5px solid rgba(108,99,255,0.12)` : "none",
                      pointerEvents: "none",
                    }}
                  />
                ))}

                {/* Section heading */}
                <Skeleton variant="text" width={section === 1 ? "35%" : "25%"} sx={{ bgcolor: SK, fontSize: "1.5rem", mb: 2 }} />

                {/* Content lines */}
                {Array.from({ length: section === 1 ? 5 : 3 }).map((_, i, arr) => (
                  <Skeleton
                    key={i}
                    variant="text"
                    sx={{ bgcolor: SK, width: i === arr.length - 1 ? "60%" : "100%", fontSize: "1rem", mb: 0.3 }}
                  />
                ))}

                {/* Code block skeleton for some sections */}
                {section === 0 && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "rgba(10, 14, 26, 0.5)",
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton
                        key={i}
                        variant="text"
                        sx={{ bgcolor: "rgba(108,99,255,0.06)", width: `${50 + Math.random() * 40}%`, fontSize: "0.85rem" }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            ))}

            {/* Two-column grid blocks */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, mt: 0 }}>
              {Array.from({ length: 2 }).map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    p: { xs: 2, md: 3 },
                    borderBottom: `1px solid ${BORDER}`,
                    borderLeft: `1px solid ${BORDER}`,
                    borderRight: i === 0 ? "none" : `1px solid ${BORDER}`,
                    borderTop: `1px solid ${BORDER}`,
                  }}
                >
                  <Skeleton variant="text" width="40%" sx={{ bgcolor: SK, fontSize: "1.3rem", mb: 1.5 }} />
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} variant="text" sx={{ bgcolor: SK, width: j === 2 ? "50%" : "90%", fontSize: "0.9rem", mb: 0.3 }} />
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

/* ─── types ─────────────────────────────────────────────── */

interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  status: string;
  author: string;
  authorId: string;
  readTime: string;
  tags: string[];
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const color: string = (post ? COLORS[post.title.length % COLORS.length] : "#6C63FF") ?? "#6C63FF";

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setNotFound(false);

    fetch(`${API_URL}/api/v1/blog/slug/${encodeURIComponent(slug)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => setPost(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <BlogPostSkeleton />;

  if (notFound || !post) {
    return (
      <Box sx={{ py: 12, textAlign: "center" }}>
        <Container>
          <Typography variant="h3" sx={{ mb: 2 }}>Post not found</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            The article you're looking for doesn't exist or has been moved.
          </Typography>
          <Button component={Link} to="/blog" startIcon={<ArrowBackIcon />} variant="outlined">
            Back to Blog
          </Button>
        </Container>
      </Box>
    );
  }

  const publishedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "";

  return (
    <>
      <ReadingProgress color={color} />
      <SEO
        title={post.title}
        description={post.excerpt || post.content.slice(0, 160).trim()}
        ogType="article"
        canonical={`${SITE_URL}/blog/${slug}`}
        ogUrl={`${SITE_URL}/blog/${slug}`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt || post.content.slice(0, 160).trim(),
          datePublished: post.createdAt,
          author: { "@type": "Organization", name: "NeuroDyne Corp" },
          publisher: {
            "@type": "Organization",
            name: "NeuroDyne Corp",
            logo: { "@type": "ImageObject", url: `${SITE_URL}/og-image.png` },
          },
          mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${slug}` },
        }}
      />

      {/* ─── cinematic banner ─────────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          minHeight: { xs: 420, md: 520 },
          display: "flex",
          alignItems: "flex-end",
          overflow: "hidden",
          bgcolor: "#0A0E1A",
        }}
      >
        {/* animated mesh background */}
        <Box sx={{ position: "absolute", inset: 0 }}>
          <MeshCanvas color={color} />
        </Box>

        {/* grid overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(${color}08 1px, transparent 1px),
              linear-gradient(90deg, ${color}08 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            pointerEvents: "none",
          }}
        />

        {/* scan line */}
        <ScanLine color={color} />

        {/* floating shapes */}
        <FloatingShape shape="ring" size={60} x="8%" y="20%" color={color} delay={0} duration={12} />
        <FloatingShape shape="diamond" size={24} x="85%" y="15%" color="#00D4AA" delay={1.5} duration={10} />
        <FloatingShape shape="circle" size={16} x="72%" y="65%" color={color} delay={0.8} duration={14} />
        <FloatingShape shape="cross" size={28} x="15%" y="70%" color="#6C63FF" delay={2} duration={11} />
        <FloatingShape shape="ring" size={40} x="90%" y="55%" color="#8B85FF" delay={3} duration={13} />
        <FloatingShape shape="diamond" size={18} x="45%" y="12%" color={color} delay={0.5} duration={9} />
        <FloatingShape shape="circle" size={10} x="30%" y="80%" color="#00D4AA" delay={1} duration={15} />

        {/* large decorative letter */}
        <MotionBox
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          sx={{
            position: "absolute",
            top: { xs: -30, md: -60 },
            right: { xs: -20, md: 40 },
            fontSize: { xs: "12rem", md: "18rem" },
            fontWeight: 900,
            lineHeight: 1,
            color: `${color}06`,
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 1,
          }}
        >
          {post.category.charAt(0)}
        </MotionBox>

        {/* bottom gradient fade */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "60%",
            background: "linear-gradient(to top, #0A0E1A 0%, transparent 100%)",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />

        {/* content */}
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 3, pb: { xs: 5, md: 7 }, pt: { xs: 12, md: 16 } }}>
          {/* back button */}
          <MotionBox
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Button
              component={Link}
              to="/blog"
              startIcon={<ArrowBackIcon />}
              sx={{
                mb: 4,
                color: "text.secondary",
                backdropFilter: "blur(8px)",
                background: "rgba(17, 24, 39, 0.4)",
                borderRadius: "20px",
                px: 2,
                border: "1px solid rgba(108, 99, 255, 0.1)",
                "&:hover": { color: "text.primary", background: "rgba(17, 24, 39, 0.6)" },
              }}
            >
              All Articles
            </Button>
          </MotionBox>

          {/* meta row */}
          <MotionBox
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexWrap: "wrap", mb: 2.5 }}>
              <Chip
                label={post.category}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  background: `${color}20`,
                  color,
                  border: `1px solid ${color}35`,
                  boxShadow: `0 0 12px ${color}20`,
                }}
              />
              {publishedDate && (
                <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", color: "text.secondary" }}>
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 14 }} />
                  <Typography variant="caption">{publishedDate}</Typography>
                </Stack>
              )}
              <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", color: "text.secondary" }}>
                <AccessTimeIcon sx={{ fontSize: 14 }} />
                <Typography variant="caption">{post.readTime}</Typography>
              </Stack>
            </Stack>
          </MotionBox>

          {/* title */}
          <MotionTypography
            variant="h2"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
            sx={{ fontWeight: 800,
              mb: 3,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              fontSize: { xs: "2rem", md: "3rem" },
              maxWidth: 700,
            }}
          >
            {post.title}
          </MotionTypography>

          {/* author card */}
          <MotionBox
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: "center",
                display: "inline-flex",
                px: 2,
                py: 1,
                borderRadius: "24px",
                background: "rgba(17, 24, 39, 0.5)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(108, 99, 255, 0.1)",
              }}
            >
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  background: `linear-gradient(135deg, ${color}, ${color}80)`,
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  boxShadow: `0 0 16px ${color}30`,
                }}
              >
                NL
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2, fontSize: "0.85rem" }}>
                  {post.author}
                </Typography>
              </Box>
            </Stack>
          </MotionBox>
        </Container>

        {/* bottom edge glow */}
        <MotionBox
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }}
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: `linear-gradient(90deg, transparent, ${color}, #00D4AA, transparent)`,
            transformOrigin: "center",
            zIndex: 4,
          }}
        />
      </Box>

      <Box sx={{ py: { xs: 5, md: 8 } }}>
        <Container maxWidth="md">

          {/* Markdown content */}
          <Box
            sx={{
              "& h2": {
                color: "text.primary",
                fontWeight: 700,
                fontSize: "1.6rem",
                mt: 5,
                mb: 2,
                letterSpacing: "-0.01em",
              },
              "& h3": {
                color: "text.primary",
                fontWeight: 600,
                fontSize: "1.25rem",
                mt: 4,
                mb: 1.5,
              },
              "& p": {
                color: "text.secondary",
                lineHeight: 1.85,
                mb: 2,
                fontSize: "1rem",
              },
              "& a": {
                color,
                textDecoration: "none",
                fontWeight: 500,
                borderBottom: `1px solid ${color}40`,
                transition: "border-color 0.2s",
                "&:hover": { borderColor: color },
              },
              "& ul, & ol": {
                color: "text.secondary",
                pl: 3,
                mb: 2,
                "& li": { mb: 0.75, lineHeight: 1.7 },
              },
              "& blockquote": {
                borderLeft: `3px solid ${color}`,
                pl: 3,
                py: 0.5,
                my: 3,
                mx: 0,
                background: `${color}08`,
                borderRadius: "0 8px 8px 0",
                "& p": { color: "text.secondary", fontStyle: "italic", mb: 0 },
              },
              "& code": {
                fontFamily: "monospace",
                fontSize: "0.85em",
                background: "rgba(108, 99, 255, 0.1)",
                color: "#8B85FF",
                px: 0.8,
                py: 0.2,
                borderRadius: 1,
              },
              "& pre": {
                background: "rgba(10, 14, 26, 0.8)",
                border: "1px solid rgba(108, 99, 255, 0.1)",
                borderRadius: 3,
                p: 3,
                mb: 3,
                overflowX: "auto",
                "& code": {
                  background: "none",
                  color: "#c9d1d9",
                  px: 0,
                  py: 0,
                  fontSize: "0.85rem",
                  lineHeight: 1.7,
                },
              },
              "& table": {
                width: "100%",
                borderCollapse: "collapse",
                mb: 3,
                "& th": {
                  textAlign: "left",
                  py: 1.5,
                  px: 2,
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  color: "text.primary",
                  borderBottom: "2px solid rgba(108, 99, 255, 0.15)",
                  background: "rgba(108, 99, 255, 0.04)",
                },
                "& td": {
                  py: 1.5,
                  px: 2,
                  fontSize: "0.85rem",
                  color: "text.secondary",
                  borderBottom: "1px solid rgba(108, 99, 255, 0.08)",
                },
              },
              "& hr": {
                border: "none",
                height: 1,
                background: "rgba(108, 99, 255, 0.12)",
                my: 5,
              },
              "& strong": {
                color: "text.primary",
                fontWeight: 600,
              },
              "& em": {
                fontStyle: "italic",
              },
              "& img": {
                maxWidth: "100%",
                borderRadius: 3,
              },
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content.trim()}
            </ReactMarkdown>
          </Box>

          {/* Reactions */}
          <PostReactions postId={post.id ?? slug ?? "post"} color={color} />

          {/* Newsletter */}
          <Box sx={{ my: 4 }}>
            <NewsletterCTA />
          </Box>

          {/* Footer divider */}
          <Divider sx={{ my: 6, borderColor: "rgba(108, 99, 255, 0.1)" }} />

          <Button
            component={Link}
            to="/blog"
            startIcon={<ArrowBackIcon />}
            variant="outlined"
            sx={{ borderColor: "rgba(108, 99, 255, 0.2)", "&:hover": { borderColor: "rgba(108, 99, 255, 0.4)" } }}
          >
            Back to All Articles
          </Button>
        </Container>
      </Box>
    </>
  );
}
