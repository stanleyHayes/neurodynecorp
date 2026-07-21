import { useState, useMemo, useEffect, useCallback } from "react";
import { Box, Typography, Chip, Stack, TextField, InputAdornment } from "@mui/material";
import { useNavigate } from "react-router";
import SearchIcon from "@mui/icons-material/Search";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import PublishOutlinedIcon from "@mui/icons-material/PublishOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
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
  Published: "#10B981",
  Draft: "#F59E0B",
};

export default function Portfolio() {
  const navigate = useNavigate();
  const { api } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [caseStudies, setCaseStudies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCaseStudies = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.listCaseStudies();
      setCaseStudies(res.items ?? []);
    } catch (err: any) {
      setError(err.message ?? "Failed to load case studies");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadCaseStudies();
  }, [loadCaseStudies]);

  const filtered = useMemo(
    () =>
      caseStudies.filter(
        (c) =>
          (c.title ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (c.client ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (c.category ?? "").toLowerCase().includes(search.toLowerCase()),
      ),
    [search, caseStudies],
  );

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageItems = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const published = caseStudies.filter((c) => c.status === "published").length;

  const stats = [
    { label: "Case Studies", value: String(caseStudies.length), change: `${published} live`, icon: <WorkOutlineOutlinedIcon />, color: "#6C63FF" },
    { label: "Published", value: String(published), change: "on portfolio page", icon: <PublishOutlinedIcon />, color: "#10B981" },
    { label: "Drafts", value: String(caseStudies.length - published), change: "in progress", icon: <EditNoteOutlinedIcon />, color: "#F59E0B" },
    { label: "Industries", value: String(new Set(caseStudies.map((c) => c.category)).size), change: "sectors covered", icon: <TrendingUpOutlinedIcon />, color: "#8B85FF" },
  ];

  const statusLabel = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "Draft");

  if (loading) {
    return <PageSkeleton stats={3} rows={4} grid cols={3} />;
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400, flexDirection: "column", gap: 2 }}>
        <Typography color="error">{error}</Typography>
        <Typography
          component="button"
          onClick={loadCaseStudies}
          sx={{ cursor: "pointer", color: "#6C63FF", background: "none", border: "none", fontFamily: "monospace", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", "&:hover": { textDecoration: "underline" } }}
        >
          Retry
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <PageBanner
        icon={<WorkOutlineOutlinedIcon />}
        title="Portfolio"
        description="Manage case studies and project showcases on the public site."
        tag="CONTENT // PORTFOLIO"
        accentWord="Portfolio"
        iconColor="#6C63FF"
        iconLabel="CASE STUDIES"
      />

      <ActionBar label="New Case Study" subtitle="ADD PROJECT SHOWCASE" color="#6C63FF" onClick={() => navigate("/portfolio/new")} />

      <SectionLabel>Portfolio Metrics</SectionLabel>
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

      <SectionLabel>All Case Studies</SectionLabel>
      <Cell color="#6C63FF" index="04">
        <TextField
          fullWidth
          size="small"
          placeholder="Search by title, client, or category..."
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
          icon={<WorkOutlineOutlinedIcon />}
          title={search ? "No case studies match your search" : "No case studies yet"}
          description={search ? "Try adjusting your search terms or clearing the filter." : "Publish your first case study to showcase project impact on the portfolio page."}
          color="#6C63FF"
          onRefresh={loadCaseStudies}
          onAdd={() => navigate("/portfolio/new")}
          addLabel="New Case Study"
          isFiltered={!!search}
        />
      ) : (
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        {pageItems.map((study, i) => {
          const color = statusColor[statusLabel(study.status)] ?? "#94A3B8";
          return (
            <Cell key={study.id} color={study.color} index={String(page * PER_PAGE + i + 5).padStart(2, "0")} colInRow={i % 2} totalCols={2} animDelay={0.3 + i * 0.05} minH={160}>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{study.title}</Typography>
                  <Typography sx={{ fontFamily: "monospace", fontSize: "0.65rem", color: "text.secondary", opacity: 0.6 }}>{study.client} — {study.category}</Typography>
                </Box>
                <Chip label={statusLabel(study.status)} size="small" sx={{ fontFamily: "monospace", fontSize: "0.6rem", bgcolor: `${color}18`, color, border: `1px solid ${color}30` }} />
              </Stack>
              <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.7, lineHeight: 1.6, mb: 1.5 }}>{study.description}</Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
                {(study.tags ?? []).map((tag: string) => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ fontFamily: "monospace", fontSize: "0.55rem", height: 22 }} />
                ))}
              </Stack>
              <Stack direction="row" spacing={2}>
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", color: study.color, fontWeight: 600 }}>{study.impact}</Typography>
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", color: "text.secondary", opacity: 0.5 }}>{study.createdAt}</Typography>
              </Stack>
            </Cell>
          );
        })}
      </Box>
      )}

      {filtered.length > 0 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={filtered.length} />}
    </Box>
  );
}
