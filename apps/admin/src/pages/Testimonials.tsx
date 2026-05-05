import { useState, useEffect, useCallback, useMemo } from "react";
import { Box, Typography, Chip, Stack, Avatar, TextField, InputAdornment, Alert } from "@mui/material";
import { useNavigate } from "react-router";
import SearchIcon from "@mui/icons-material/Search";
import FormatQuoteOutlinedIcon from "@mui/icons-material/FormatQuoteOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
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
  Active: "#10B981",
  Hidden: "#94A3B8",
};

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  status: "active" | "hidden";
  avatarColor: string;
  createdAt: string;
  updatedAt: string;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function Testimonials() {
  const navigate = useNavigate();
  const { api } = useAuth();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const loadTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.listTestimonials();
      setTestimonials(res.items ?? []);
    } catch (err: any) {
      setError(err.message ?? "Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadTestimonials();
  }, [loadTestimonials]);

  const filtered = useMemo(
    () =>
      testimonials.filter(
        (t) =>
          (t.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (t.company ?? "").toLowerCase().includes(search.toLowerCase()),
      ),
    [search, testimonials],
  );

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageItems = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const active = testimonials.filter((t) => t.status === "active").length;
  const avgRating = testimonials.length > 0 ? (testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length).toFixed(1) : "0.0";

  const stats = [
    { label: "Total Testimonials", value: String(testimonials.length), change: `${active} visible`, icon: <FormatQuoteOutlinedIcon />, color: "#8B85FF" },
    { label: "Active", value: String(active), change: "shown on site", icon: <VisibilityOutlinedIcon />, color: "#10B981" },
    { label: "Hidden", value: String(testimonials.length - active), change: "not displayed", icon: <VisibilityOffOutlinedIcon />, color: "#94A3B8" },
    { label: "Avg Rating", value: avgRating, change: "out of 5.0", icon: <StarOutlinedIcon />, color: "#F59E0B" },
  ];

  if (loading) {
    return <PageSkeleton stats={3} rows={6} grid />;
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
        icon={<FormatQuoteOutlinedIcon />}
        title="Testimonials"
        description="Manage client testimonials displayed on the public website."
        tag="CONTENT // TESTIMONIALS"
        accentWord="Testimonials"
        iconColor="#8B85FF"
        iconLabel="SOCIAL PROOF"
      />

      <ActionBar label="New Testimonial" subtitle="ADD CLIENT REVIEW" color="#8B85FF" onClick={() => navigate("/testimonials/new")} />

      <SectionLabel>Testimonial Metrics</SectionLabel>
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

      <SectionLabel>All Testimonials</SectionLabel>
      <Cell color="#8B85FF" index="04">
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name or company..."
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
              "&.Mui-focused fieldset": { borderColor: "#8B85FF" },
            },
          }}
        />
      </Cell>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FormatQuoteOutlinedIcon />}
          title={search ? "No testimonials match your search" : "No testimonials yet"}
          description={search ? "Try adjusting your search terms or clearing the filter." : "Collect your first client testimonial to showcase social proof on your website."}
          color="#8B85FF"
          onRefresh={loadTestimonials}
          onAdd={() => navigate("/testimonials/new")}
          addLabel="New Testimonial"
          isFiltered={!!search}
        />
      ) : (
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        {pageItems.map((t, i) => {
          const displayStatus = capitalize(t.status);
          const color = statusColor[displayStatus] ?? "#94A3B8";
          return (
            <Cell key={t.id} color={t.avatarColor} index={String(page * PER_PAGE + i + 5).padStart(2, "0")} colInRow={i % 2} totalCols={2} animDelay={0.3 + i * 0.05}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Avatar sx={{ bgcolor: `${t.avatarColor}20`, color: t.avatarColor, width: 42, height: 42, fontSize: 14, fontWeight: 700, border: `1.5px solid ${t.avatarColor}30`, flexShrink: 0 }}>
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{t.name}</Typography>
                      <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", color: "text.secondary", opacity: 0.6 }}>{t.role}, {t.company}</Typography>
                    </Box>
                    <Chip label={displayStatus} size="small" sx={{ fontFamily: "monospace", fontSize: "0.6rem", bgcolor: `${color}18`, color, border: `1px solid ${color}30` }} />
                  </Stack>
                  <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.8, mt: 1, fontStyle: "italic", lineHeight: 1.6 }}>
                    "{t.content}"
                  </Typography>
                  <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                    {Array.from({ length: 5 }).map((_, si) => (
                      <StarOutlinedIcon key={si} sx={{ fontSize: 14, color: si < t.rating ? "#F59E0B" : "rgba(148,163,184,0.3)" }} />
                    ))}
                    <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", color: "text.secondary", opacity: 0.5, ml: 1 }}>{new Date(t.createdAt).toLocaleDateString()}</Typography>
                  </Stack>
                </Box>
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
