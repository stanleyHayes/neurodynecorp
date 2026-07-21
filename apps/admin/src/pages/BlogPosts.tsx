import { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Typography, Chip, Stack, TextField, InputAdornment, Alert } from "@mui/material";
import { useNavigate } from "react-router";
import SearchIcon from "@mui/icons-material/Search";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import PublishOutlinedIcon from "@mui/icons-material/PublishOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PageBanner from "@/components/shared/PageBanner";
import ActionBar from "@/components/shared/ActionBar";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";
import Pagination from "@/components/shared/Pagination";
import PageSkeleton from "@/components/shared/PageSkeleton";
import EmptyState from "@/components/shared/EmptyState";
import { useAuth } from "@/context/AuthContext";

const PER_PAGE = 6;

const statusColor: Record<string, string> = {
  published: "#10B981",
  draft: "#F59E0B",
  archived: "#94A3B8",
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function BlogPosts() {
  const navigate = useNavigate();
  const { api } = useAuth();
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.listBlogPosts();
      setBlogPosts(res.items ?? []);
    } catch (err: any) {
      setError(err.message ?? "Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const filtered = useMemo(
    () =>
      blogPosts.filter(
        (p) =>
          (p.title ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (p.category ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (p.author ?? "").toLowerCase().includes(search.toLowerCase()),
      ),
    [search, blogPosts],
  );

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageItems = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const published = blogPosts.filter((p) => p.status === "published").length;
  const drafts = blogPosts.filter((p) => p.status === "draft").length;

  const avgReadTime =
    blogPosts.length > 0
      ? Math.round(blogPosts.reduce((sum, p) => sum + (parseInt(p.readTime) || 0), 0) / blogPosts.length)
      : 0;

  const stats = [
    { label: "Total Posts", value: String(blogPosts.length), change: `${published} live`, icon: <ArticleOutlinedIcon />, color: "#6C63FF" },
    { label: "Published", value: String(published), change: "visible on site", icon: <PublishOutlinedIcon />, color: "#10B981" },
    { label: "Drafts", value: String(drafts), change: "in progress", icon: <EditNoteOutlinedIcon />, color: "#F59E0B" },
    { label: "Avg Read Time", value: `${avgReadTime} min`, change: "across all posts", icon: <AccessTimeIcon />, color: "#8B85FF" },
  ];

  if (loading) {
    return <PageSkeleton stats={4} rows={6} />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PageBanner
        icon={<ArticleOutlinedIcon />}
        title="Blog Posts"
        description="Create and manage blog content that appears on the public website."
        tag="CONTENT // BLOG"
        accentWord="Blog"
        iconColor="#6C63FF"
        iconLabel="CMS ACTIVE"
      />

      <ActionBar label="New Post" subtitle="WRITE ARTICLE" onClick={() => navigate("/blog/new")} />

      <SectionLabel>Post Metrics</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" } }}>
        {stats.map((stat, i) => (
          <Cell key={stat.label} color={stat.color} index={String(i).padStart(2, "0")} colInRow={i} totalCols={4} animDelay={i * 0.1} minH={120}>
            <Box sx={{ "& .MuiSvgIcon-root": { fontSize: 28 }, color: stat.color, filter: `drop-shadow(0 0 12px ${stat.color}40)`, mb: 1 }}>
              {stat.icon}
            </Box>
            <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "text.secondary", opacity: 0.6, mb: 0.5 }}>
              {stat.label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>{stat.value}</Typography>
            <Typography variant="caption" sx={{ color: stat.color, opacity: 0.8 }}>{stat.change}</Typography>
          </Cell>
        ))}
      </Box>

      <SectionLabel>All Posts</SectionLabel>
      <Cell color="#6C63FF" index="04">
        <TextField
          fullWidth
          size="small"
          placeholder="Search by title, category, or author..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "text.secondary" }} /></InputAdornment>,
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: "rgba(108, 99, 255, 0.04)",
              "& fieldset": { borderColor: "rgba(108,99,255,0.15)" },
              "&:hover fieldset": { borderColor: "rgba(108,99,255,0.3)" },
              "&.Mui-focused fieldset": { borderColor: "#6C63FF" },
            },
          }}
        />
      </Cell>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ArticleOutlinedIcon />}
          title={search ? "No posts match your search" : "No blog posts yet"}
          description={search ? "Try adjusting your search terms or clearing the filter." : "Write your first blog post to share insights and thought leadership."}
          color="#6C63FF"
          onRefresh={loadPosts}
          onAdd={() => navigate("/blog/new")}
          addLabel="New Post"
          isFiltered={!!search}
        />
      ) : (
      <>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" } }}>
        {pageItems.map((post, i) => {
          const color = statusColor[post.status] ?? "#94A3B8";
          return (
            <Cell
              key={post.id}
              color={post.color ?? color}
              index={String(page * PER_PAGE + i + 5).padStart(2, "0")}
              colInRow={i % 3}
              totalCols={3}
              animDelay={0.3 + i * 0.05}
              minH={180}
            >
              <Box
                onClick={() => navigate(`/blog/${post.id}`)}
                sx={{ cursor: "pointer", height: "100%" }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
                  <Chip label={post.category} size="small" variant="outlined" sx={{ fontFamily: "monospace", fontSize: "0.6rem" }} />
                  <Chip label={capitalize(post.status)} size="small" sx={{ fontFamily: "monospace", fontSize: "0.6rem", bgcolor: `${color}18`, color, border: `1px solid ${color}30` }} />
                </Stack>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>{post.title}</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.7, mb: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {post.excerpt}
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mt: "auto" }}>
                  <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", color: "text.secondary", opacity: 0.5 }}>{post.author}</Typography>
                  <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", color: "text.secondary", opacity: 0.5 }}>{new Date(post.createdAt).toLocaleDateString()}</Typography>
                  <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", color: "text.secondary", opacity: 0.5 }}>{post.readTime}</Typography>
                </Stack>
              </Box>
            </Cell>
          );
        })}
      </Box>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={filtered.length} />
      </>
      )}
    </Box>
  );
}
