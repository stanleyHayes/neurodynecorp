import { Box, Typography, Stack, CircularProgress, TextField, InputAdornment, Chip } from "@mui/material";
import { motion } from "framer-motion";
import { Link } from "react-router";
import ArticleIcon from "@mui/icons-material/Article";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SearchIcon from "@mui/icons-material/Search";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import EmptyState from "@/components/shared/EmptyState";
import NewsletterCTA from "@/components/shared/NewsletterCTA";
import { useState, useEffect, useMemo } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

const MotionBox = motion.create(Box);

const COLORS = ["#6C63FF", "#00D4AA", "#8B85FF", "#33DDBB"];

interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  readTime: string;
  createdAt: string;
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const BORDER = "rgba(108, 99, 255, 0.12)";

function BlogCell({
  post,
  index,
}: {
  post: BlogPostItem & { color: string; index: string };
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const slug = post.slug || slugify(post.title);
  const col = index % 3;

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Box
        component={Link}
        to={`/blog/${slug}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
          minHeight: { xs: 220, md: 280 },
          p: { xs: 3, md: 4 },
          textDecoration: "none",
          color: "inherit",
          position: "relative",
          overflow: "hidden",
          cursor: "pointer",
          borderRight: { xs: "none", md: col < 2 ? `1px solid ${BORDER}` : "none" },
          borderBottom: `1px solid ${BORDER}`,
          background: hovered ? `${post.color}06` : "transparent",
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
              borderTop: pos.bT ? `2px solid ${post.color}${hovered ? "80" : "30"}` : "none",
              borderBottom: pos.bB ? `2px solid ${post.color}${hovered ? "80" : "30"}` : "none",
              borderLeft: pos.bL ? `2px solid ${post.color}${hovered ? "80" : "30"}` : "none",
              borderRight: pos.bR ? `2px solid ${post.color}${hovered ? "80" : "30"}` : "none",
              filter: hovered ? `drop-shadow(0 0 6px ${post.color}50)` : "none",
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
              background: `radial-gradient(circle, ${post.color}10 0%, transparent 70%)`,
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
            color: hovered ? post.color : "text.secondary",
            opacity: 0.5,
            letterSpacing: "0.15em",
            transition: "color 0.3s",
            zIndex: 2,
          }}
        >
          {post.index}
        </Typography>

        {/* Content */}
        <Box sx={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Typography
            sx={{
              fontSize: "0.6rem",
              fontFamily: "monospace",
              fontWeight: 600,
              color: post.color,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              mb: 1.5,
              opacity: 0.7,
            }}
          >
            {post.category}
          </Typography>

          <Typography
            variant="h5"
            sx={{ fontWeight: 700,
              mb: 1.5,
              color: hovered ? "text.primary" : "text.secondary",
              transition: "color 0.3s",
              letterSpacing: "-0.01em",
              lineHeight: 1.3,
            }}
          >
            {post.title}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              opacity: hovered ? 0.9 : 0.6,
              transition: "opacity 0.3s",
              lineHeight: 1.6,
              display: { xs: "none", md: "block" },
            }}
          >
            {post.excerpt}
          </Typography>
        </Box>

        {/* Metadata footer */}
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1, mt: 2, pt: 2, borderTop: `1px solid ${BORDER}` }}
        >
          <Stack sx={{ alignItems: "center" }} direction="row" spacing={2}>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", color: "text.secondary", opacity: 0.6 }}>
              <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
              <Typography variant="caption" sx={{ fontFamily: "monospace", fontSize: "0.65rem" }}>
                {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", color: "text.secondary", opacity: 0.6 }}>
              <AccessTimeIcon sx={{ fontSize: 12 }} />
              <Typography variant="caption" sx={{ fontFamily: "monospace", fontSize: "0.65rem" }}>
                {post.readTime}
              </Typography>
            </Stack>
          </Stack>
          <ArrowForwardIcon
            sx={{
              fontSize: 16,
              color: post.color,
              opacity: hovered ? 1 : 0,
              transform: hovered ? "translateX(0)" : "translateX(-8px)",
              transition: "all 0.3s",
            }}
          />
        </Stack>

        {/* Bottom accent line */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: "10%",
            right: "10%",
            height: 2,
            background: `linear-gradient(90deg, transparent, ${post.color}, transparent)`,
            opacity: hovered ? 0.6 : 0,
            transition: "opacity 0.3s",
            pointerEvents: "none",
          }}
        />
      </Box>
    </MotionBox>
  );
}

export default function Blog() {
  const [posts, setPosts] = useState<(BlogPostItem & { color: string; index: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | "ALL">("ALL");

  useEffect(() => {
    fetch(`${API_URL}/api/v1/blog?status=published`)
      .then((res) => res.json())
      .then((data) => {
        const items = (data.items ?? []).map((item: BlogPostItem, i: number) => ({
          ...item,
          color: COLORS[i % COLORS.length],
          index: String(i + 1).padStart(2, "0"),
        }));
        setPosts(items);
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set(posts.map((p) => p.category).filter(Boolean));
    return ["ALL", ...Array.from(set)];
  }, [posts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((p) => {
      const matchCat = category === "ALL" || p.category === category;
      const matchQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [posts, search, category]);

  return (
    <>
      <SEO
        title="Blog"
        description="Engineering insights, tutorials, and thought leadership from the NeuroDyne Corp team."
        canonical="https://neurodyne.dev/blog"
        ogUrl="https://neurodyne.dev/blog"
      />

      <PageHero
        icon={<ArticleIcon />}
        title="Our Blog"
        description="Engineering insights, tutorials, and thought leadership from the NeuroDyne Corp team."
        tag="TRANSMISSIONS // FEED"
        accentWord="Blog"
        iconColor="#8B85FF"
        iconLabel="SIGNAL LIVE"
      />

      {/* Search + filter bar */}
      {!loading && posts.length > 0 && (
        <Box sx={{ px: { xs: 3, md: 6 }, py: 3, borderBottom: `1px solid ${BORDER}` }}>
          <Stack sx={{ alignItems: { md: "center" } }} direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              size="small"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "text.secondary", opacity: 0.6, fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                minWidth: { md: 280 },
                "& .MuiOutlinedInput-root": {
                  bgcolor: "rgba(108,99,255,0.04)",
                  fontFamily: "monospace",
                  fontSize: "0.85rem",
                  "& fieldset": { borderColor: "rgba(108,99,255,0.15)" },
                  "&:hover fieldset": { borderColor: "rgba(108,99,255,0.3)" },
                  "&.Mui-focused fieldset": { borderColor: "#6C63FF" },
                },
              }}
            />
            <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75 }}>
              {categories.map((c) => {
                const active = c === category;
                return (
                  <Chip
                    key={c}
                    label={c}
                    onClick={() => setCategory(c)}
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.65rem",
                      cursor: "pointer",
                      bgcolor: active ? "rgba(108,99,255,0.15)" : "transparent",
                      color: active ? "#6C63FF" : "text.secondary",
                      border: active ? "1px solid #6C63FF" : "1px solid rgba(108,99,255,0.15)",
                      "&:hover": { borderColor: "rgba(108,99,255,0.4)" },
                    }}
                  />
                );
              })}
            </Stack>
            <Box sx={{ flex: 1 }} />
            <Typography sx={{ fontFamily: "monospace", fontSize: "0.65rem", color: "text.secondary", opacity: 0.5, letterSpacing: "0.1em" }}>
              {filtered.length} POST{filtered.length === 1 ? "" : "S"}
            </Typography>
          </Stack>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 12 }}>
          <CircularProgress size={32} sx={{ color: "#6C63FF" }} />
        </Box>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<ArticleIcon />}
          title="No blog posts published yet"
          description="Check back soon for engineering insights, tutorials, and thought leadership from our team."
          color="#8B85FF"
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<SearchIcon />}
          title="No posts match your filters"
          description={search ? `Nothing found for "${search}". Try a different keyword or clear the filter.` : "Try a different category or clear the filter."}
          color="#8B85FF"
        />
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            borderTop: `1px solid ${BORDER}`,
          }}
        >
          {filtered.map((post, index) => (
            <BlogCell key={post.id ?? post.title} post={post} index={index} />
          ))}
        </Box>
      )}

      {/* Newsletter CTA */}
      <Box sx={{ px: { xs: 3, md: 6 }, py: { xs: 6, md: 8 } }}>
        <NewsletterCTA />
      </Box>
    </>
  );
}
