import { useState, useEffect, useCallback } from "react";
import { Box, Typography, Chip, Stack, Alert } from "@mui/material";
import { useParams, useNavigate } from "react-router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import PageBanner from "@/components/shared/PageBanner";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";
import PageSkeleton from "@/components/shared/PageSkeleton";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import { useAuth } from "@/context/AuthContext";

const statusColor: Record<string, string> = {
  published: "#10B981",
  draft: "#F59E0B",
  archived: "#94A3B8",
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getBlogPost(id);
      setPost(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load blog post");
    } finally {
      setLoading(false);
    }
  }, [api, id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <PageSkeleton stats={3} rows={4} />;

  if (error || !post) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Typography variant="h5" color="text.secondary">Post not found</Typography>
        )}
      </Box>
    );
  }

  const color = post.color ?? statusColor[post.status] ?? "#6C63FF";

  return (
    <Box>
      <Box
        onClick={() => navigate("/blog")}
        sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 3, py: 1.5, cursor: "pointer", color: "text.secondary", "&:hover": { color: "#6C63FF" }, transition: "color 0.2s" }}
      >
        <ArrowBackIcon sx={{ fontSize: 18 }} />
        <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.1em" }}>BACK TO BLOG</Typography>
      </Box>

      <PageBanner
        icon={<ArticleOutlinedIcon />}
        title={post.title}
        description={post.excerpt}
        tag={`CONTENT // ${(post.category ?? "").toUpperCase()}`}
        accentWord={post.category}
        iconColor={color}
        iconLabel={post.status?.toUpperCase() ?? "POST"}
      />

      {/* Meta */}
      <SectionLabel>Post Info</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" } }}>
        <Cell color={color} index="00" colInRow={0} totalCols={4} animDelay={0} minH={100}>
          <Box sx={{ color, mb: 0.5 }}><PersonOutlinedIcon sx={{ fontSize: 22 }} /></Box>
          <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "text.secondary", opacity: 0.6, mb: 0.5 }}>Author</Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{post.author}</Typography>
        </Cell>
        <Cell color={color} index="01" colInRow={1} totalCols={4} animDelay={0.1} minH={100}>
          <Box sx={{ color, mb: 0.5 }}><CalendarTodayOutlinedIcon sx={{ fontSize: 22 }} /></Box>
          <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "text.secondary", opacity: 0.6, mb: 0.5 }}>Date</Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"}
          </Typography>
        </Cell>
        <Cell color={color} index="02" colInRow={2} totalCols={4} animDelay={0.2} minH={100}>
          <Box sx={{ color, mb: 0.5 }}><AccessTimeIcon sx={{ fontSize: 22 }} /></Box>
          <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "text.secondary", opacity: 0.6, mb: 0.5 }}>Read Time</Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{post.readTime ?? "—"}</Typography>
        </Cell>
        <Cell color={statusColor[post.status] ?? color} index="03" colInRow={3} totalCols={4} animDelay={0.3} minH={100}>
          <Box sx={{ color: statusColor[post.status] ?? color, mb: 0.5 }}><ArticleOutlinedIcon sx={{ fontSize: 22 }} /></Box>
          <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "text.secondary", opacity: 0.6, mb: 0.5 }}>Status</Typography>
          <Chip label={capitalize(post.status)} size="small" sx={{ fontFamily: "monospace", fontSize: "0.6rem", bgcolor: `${statusColor[post.status] ?? color}18`, color: statusColor[post.status] ?? color, border: `1px solid ${statusColor[post.status] ?? color}30` }} />
        </Cell>
      </Box>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <>
          <SectionLabel>Tags</SectionLabel>
          <Cell color={color} index="04" animDelay={0.35}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {post.tags.map((tag: string) => (
                <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ fontFamily: "monospace", fontSize: "0.6rem" }} />
              ))}
            </Stack>
          </Cell>
        </>
      )}

      {/* Content */}
      <SectionLabel>Content</SectionLabel>
      <Cell color={color} index="05" animDelay={0.4}>
        <MarkdownRenderer content={post.content ?? ""} color={color} />
      </Cell>
    </Box>
  );
}
