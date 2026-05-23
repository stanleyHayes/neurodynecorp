import { useState, useMemo, useEffect, useCallback } from "react";
import { Box, Typography, Chip, Stack, TextField, InputAdornment, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router";
import SearchIcon from "@mui/icons-material/Search";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import DraftsOutlinedIcon from "@mui/icons-material/DraftsOutlined";
import PageBanner from "@/components/shared/PageBanner";
import ActionBar from "@/components/shared/ActionBar";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";
import Pagination from "@/components/shared/Pagination";
import PageSkeleton from "@/components/shared/PageSkeleton";
import EmptyState from "@/components/shared/EmptyState";
import { useAuth } from "@/context/AuthContext";

interface ApiProject {
  id: string;
  client_id: string;
  title: string;
  type: string;
  status: string;
  specification_id?: string;
}

interface ApiSpec {
  id: string;
  project_id: string;
  version: number;
  status: string;
  overview: string;
  created_at: string;
  updated_at: string;
}

interface SpecDisplay {
  id: string;
  project: string;
  projectId: string;
  client: string;
  version: number;
  status: string;
  date: string;
}

const PER_PAGE = 9;

const statusColors: Record<string, string> = {
  Draft: "#94A3B8",
  draft: "#94A3B8",
  Generated: "#6C63FF",
  generated: "#6C63FF",
  "Under Review": "#F59E0B",
  under_review: "#F59E0B",
  Approved: "#10B981",
  approved: "#10B981",
  Rejected: "#EF4444",
  rejected: "#EF4444",
};

function formatStatus(status: string): string {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const inputSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "rgba(108, 99, 255, 0.04)",
    "& fieldset": { borderColor: "rgba(139,92,246,0.15)" },
    "&:hover fieldset": { borderColor: "rgba(139,92,246,0.3)" },
    "&.Mui-focused fieldset": { borderColor: "#8B5CF6" },
  },
};

export default function Specifications() {
  const navigate = useNavigate();
  const { api } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [specs, setSpecs] = useState<SpecDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate dialog state
  const [genOpen, setGenOpen] = useState(false);
  const [genProjectId, setGenProjectId] = useState("");
  const [genProjects, setGenProjects] = useState<{ id: string; title: string }[]>([]);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");

  const fetchSpecs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all projects, then fetch specs for projects that have specification_id
      const projectsRes = await api.listProjects({ pageSize: "100" });
      const projects = (projectsRes.items ?? []) as unknown as ApiProject[];

      const specPromises = projects
        .filter((p) => p.specification_id)
        .map(async (p) => {
          try {
            const spec = (await api.getSpec(p.specification_id!)) as unknown as ApiSpec;
            return {
              id: spec.id,
              project: p.title,
              projectId: p.id,
              client: p.client_id,
              version: spec.version,
              status: spec.status,
              date: spec.created_at?.slice(0, 10) ?? "",
            } as SpecDisplay;
          } catch {
            return null;
          }
        });

      const results = await Promise.all(specPromises);
      setSpecs(results.filter((s): s is SpecDisplay => s !== null));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load specifications");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchSpecs();
  }, [fetchSpecs]);

  const filtered = useMemo(
    () => specs.filter((s) => (s.project ?? "").toLowerCase().includes(search.toLowerCase()) || (s.client ?? "").toLowerCase().includes(search.toLowerCase())),
    [search, specs],
  );

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageItems = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const approved = specs.filter((s) => s.status === "Approved" || s.status === "approved").length;
  const underReview = specs.filter((s) => s.status === "Under Review" || s.status === "under_review").length;
  const drafts = specs.filter((s) => s.status === "Draft" || s.status === "draft" || s.status === "Generated" || s.status === "generated").length;

  const stats = [
    { label: "Total Specs", value: String(specs.length), change: "across all projects", icon: <DescriptionOutlinedIcon />, color: "#8B5CF6" },
    { label: "Approved", value: String(approved), change: "ready for dev", icon: <CheckCircleOutlinedIcon />, color: "#10B981" },
    { label: "Under Review", value: String(underReview), change: "awaiting feedback", icon: <RateReviewOutlinedIcon />, color: "#F59E0B" },
    { label: "Draft / Generated", value: String(drafts), change: "in progress", icon: <DraftsOutlinedIcon />, color: "#6C63FF" },
  ];

  if (loading) {
    return <PageSkeleton stats={0} rows={6} />;
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PageBanner
        icon={<DescriptionOutlinedIcon />}
        title="Specifications"
        description="Review, approve, and manage AI-generated project specifications."
        tag="ADMIN // SPECIFICATIONS"
        accentWord="Specifications"
        iconColor="#8B5CF6"
        iconLabel="SPEC ENGINE"
      />

      <ActionBar label="New Spec" subtitle="GENERATE SPECIFICATION" color="#8B5CF6" onClick={async () => {
        try {
          const res = await api.listProjects({ pageSize: "100" });
          const projects = (res.items ?? []).filter((p: any) => !p.specification_id);
          setGenProjects(projects.map((p: any) => ({ id: p.id, title: p.title })));
          setGenProjectId(projects[0]?.id ?? "");
          setGenError("");
          setGenOpen(true);
        } catch {
          setGenProjects([]);
          setGenOpen(true);
        }
      }} />

      <SectionLabel>Spec Metrics</SectionLabel>
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

      <SectionLabel>All Specifications</SectionLabel>
      <Cell color="#8B5CF6" index="04">
        <TextField
          fullWidth
          size="small"
          placeholder="Search specifications..."
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
              "& fieldset": { borderColor: "rgba(139,92,246,0.15)" },
              "&:hover fieldset": { borderColor: "rgba(139,92,246,0.3)" },
              "&.Mui-focused fieldset": { borderColor: "#8B5CF6" },
            },
          }}
        />
      </Cell>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<DescriptionOutlinedIcon />}
          title={search ? "No specifications match your search" : "No specifications yet"}
          description={search ? "Try adjusting your search terms or clearing the filter." : "Generate your first AI-powered project specification to streamline the planning process."}
          color="#8B5CF6"
          onRefresh={fetchSpecs}
          onAdd={() => setGenOpen(true)}
          addLabel="New Spec"
          isFiltered={!!search}
        />
      ) : (
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" } }}>
        {pageItems.map((spec, i) => {
          const color = statusColors[spec.status] ?? "#94A3B8";
          const displayStatus = formatStatus(spec.status);
          return (
            <Cell key={spec.id} color={color} index={String(page * PER_PAGE + i + 5).padStart(2, "0")} colInRow={i % 3} totalCols={3} animDelay={0.3 + i * 0.05}>
              <Box onClick={() => navigate(`/specifications/${spec.id}`)} sx={{ cursor: "pointer" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{spec.project}</Typography>
                  <Typography sx={{ fontFamily: "monospace", fontSize: "0.65rem", color: "text.secondary", opacity: 0.6 }}>{spec.client}</Typography>
                </Box>
                <Chip
                  label={`v${spec.version}`}
                  size="small"
                  sx={{ fontFamily: "monospace", fontSize: "0.6rem", bgcolor: `${color}15`, color, border: `1px solid ${color}25`, ml: 1 }}
                />
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <Chip label={displayStatus} size="small" sx={{ fontFamily: "monospace", fontSize: "0.55rem", bgcolor: `${color}18`, color, border: `1px solid ${color}30` }} />
              </Stack>
              <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", color: "text.secondary", opacity: 0.5 }}>{spec.date}</Typography>
              </Box>
            </Cell>
          );
        })}
      </Box>
      )}

      {filtered.length > 0 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={filtered.length} />}

      {/* Generate Spec Dialog */}
      <Dialog open={genOpen} onClose={() => setGenOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: "background.paper" } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Generate Specification</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            Select a project to generate an AI-powered specification. Only projects without an existing specification are shown.
          </Typography>
          {genError && <Alert severity="error" sx={{ mb: 2 }}>{genError}</Alert>}
          {genProjects.length === 0 ? (
            <Alert severity="info">All projects already have specifications, or no projects exist.</Alert>
          ) : (
            <TextField
              select
              fullWidth
              size="small"
              label="Project"
              value={genProjectId}
              onChange={(e) => setGenProjectId(e.target.value)}
              sx={{ ...inputSx, mt: 1 }}
            >
              {genProjects.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>
              ))}
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenOpen(false)} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button
            variant="contained"
            disabled={generating || !genProjectId || genProjects.length === 0}
            onClick={async () => {
              setGenerating(true);
              setGenError("");
              try {
                const spec = await api.generateSpec(genProjectId);
                setGenOpen(false);
                navigate(`/specifications/${spec.id}`);
              } catch (err: any) {
                setGenError(err.message ?? "Failed to generate specification");
              } finally {
                setGenerating(false);
              }
            }}
            sx={{ textTransform: "none", bgcolor: "#8B5CF6", "&:hover": { bgcolor: "#7C3AED" } }}
          >
            {generating ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Generate"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
