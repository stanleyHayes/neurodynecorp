import { useState, useEffect, useCallback, useMemo } from "react";
import { Box, Typography, Chip, Stack, TextField, InputAdornment, Alert, MenuItem, CircularProgress } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ContactMailOutlinedIcon from "@mui/icons-material/ContactMailOutlined";
import FiberNewOutlinedIcon from "@mui/icons-material/FiberNewOutlined";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import PageBanner from "@/components/shared/PageBanner";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";
import Pagination from "@/components/shared/Pagination";
import PageSkeleton from "@/components/shared/PageSkeleton";
import EmptyState from "@/components/shared/EmptyState";
import { useAuth } from "@/context/AuthContext";

const PER_PAGE = 5;
const STATUS_OPTIONS = ["new", "read", "replied", "archived"] as const;

const statusColor: Record<string, string> = {
  new: "#6C63FF",
  read: "#F59E0B",
  replied: "#10B981",
  archived: "#94A3B8",
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ContactSubmissions() {
  const { api } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const loadSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.listContactSubmissions();
      setSubmissions(res.items ?? []);
    } catch (err: any) {
      setError(err.message ?? "Failed to load contact submissions");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const updateStatus = async (id: string, status: string) => {
    setSavingId(id);
    setToast("");
    try {
      await api.updateContactSubmission(id, { status });
      setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
      setToast(`Marked as ${status}`);
    } catch (err: any) {
      setToast(err?.message ?? "Failed to update status");
    } finally {
      setSavingId(null);
    }
  };

  const filtered = useMemo(
    () =>
      submissions.filter(
        (c) =>
          (c.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (c.company ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (c.subject ?? "").toLowerCase().includes(search.toLowerCase()),
      ),
    [search, submissions],
  );

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageItems = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const newCount = submissions.filter((c) => c.status === "new").length;
  const readCount = submissions.filter((c) => c.status === "read").length;
  const repliedCount = submissions.filter((c) => c.status === "replied").length;

  const stats = [
    { label: "Total Submissions", value: String(submissions.length), change: `${newCount} unread`, icon: <ContactMailOutlinedIcon />, color: "#6C63FF" },
    { label: "New", value: String(newCount), change: "needs attention", icon: <FiberNewOutlinedIcon />, color: "#6C63FF" },
    { label: "Read", value: String(readCount), change: "awaiting reply", icon: <MarkEmailReadOutlinedIcon />, color: "#F59E0B" },
    { label: "Replied", value: String(repliedCount), change: "responded to", icon: <ReplyOutlinedIcon />, color: "#10B981" },
  ];

  if (loading) {
    return <PageSkeleton stats={3} rows={6} />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PageBanner
        icon={<ContactMailOutlinedIcon />}
        title="Contact Submissions"
        description="Review and manage inquiries from the public contact form."
        tag="CONTENT // CONTACT"
        accentWord="Contact"
        iconColor="#6C63FF"
        iconLabel="INBOX"
      />

      <SectionLabel>Submission Metrics</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" } }}>
        {stats.map((stat, i) => (
          <Cell key={stat.label} color={stat.color} index={String(i).padStart(2, "0")} colInRow={i} totalCols={4} animDelay={i * 0.1} minH={120}>
            <Box sx={{ "& .MuiSvgIcon-root": { fontSize: 28 }, color: stat.color, filter: `drop-shadow(0 0 12px ${stat.color}40)`, mb: 1 }}>
              {stat.icon}
            </Box>
            <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "text.secondary", opacity: 0.6, mb: 0.5 }}>
              {stat.label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>{stat.value}</Typography>
            <Typography variant="caption" sx={{ color: stat.color, opacity: 0.8 }}>{stat.change}</Typography>
          </Cell>
        ))}
      </Box>

      <SectionLabel>All Submissions</SectionLabel>
      {toast && (
        <Alert
          severity={toast.startsWith("Marked") ? "success" : "error"}
          sx={{ mx: 3, mb: 1 }}
          onClose={() => setToast("")}
        >
          {toast}
        </Alert>
      )}
      <Cell color="#6C63FF" index="04">
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name, company, or subject..."
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
          icon={<ContactMailOutlinedIcon />}
          title={search ? "No submissions match your search" : "No contact submissions yet"}
          description={search ? "Try adjusting your search terms or clearing the filter." : "When visitors submit the public contact form, their inquiries will appear here."}
          color="#6C63FF"
          onRefresh={loadSubmissions}
          isFiltered={!!search}
        />
      ) : (
      <>
      {pageItems.map((sub, i) => {
        const color = statusColor[sub.status] ?? "#94A3B8";
        return (
          <Cell key={sub.id} color={color} index={String(page * PER_PAGE + i + 5).padStart(2, "0")} animDelay={0.3 + i * 0.05}>
            <Stack sx={{ justifyContent: "space-between", alignItems: "flex-start" }} direction="row">
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5, flexWrap: "wrap" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{sub.subject}</Typography>
                  <TextField
                    select
                    size="small"
                    value={
                      (STATUS_OPTIONS as readonly string[]).includes(sub.status)
                        ? sub.status
                        : "new"
                    }
                    disabled={savingId === sub.id}
                    onChange={(e) => void updateStatus(sub.id, e.target.value)}
                    sx={{
                      minWidth: 120,
                      "& .MuiOutlinedInput-root": {
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: "0.65rem",
                        color,
                        "& fieldset": { borderColor: `${color}40` },
                      },
                    }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <MenuItem key={s} value={s} sx={{ fontSize: "0.78rem" }}>
                        {capitalize(s)}
                      </MenuItem>
                    ))}
                  </TextField>
                  {savingId === sub.id && <CircularProgress size={14} />}
                </Stack>

                <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                  <Stack sx={{ alignItems: "center" }} direction="row" spacing={0.5}>
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", fontWeight: 600, color: "text.primary" }}>{sub.name}</Typography>
                  </Stack>
                  <Stack sx={{ alignItems: "center" }} direction="row" spacing={0.5}>
                    <BusinessOutlinedIcon sx={{ fontSize: 12, color: "text.secondary", opacity: 0.5 }} />
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", color: "text.secondary", opacity: 0.6 }}>{sub.company}</Typography>
                  </Stack>
                  <Stack sx={{ alignItems: "center" }} direction="row" spacing={0.5}>
                    <EmailOutlinedIcon sx={{ fontSize: 12, color: "text.secondary", opacity: 0.5 }} />
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", color: "text.secondary", opacity: 0.6 }}>{sub.email}</Typography>
                  </Stack>
                  <Stack sx={{ alignItems: "center" }} direction="row" spacing={0.5}>
                    <PhoneOutlinedIcon sx={{ fontSize: 12, color: "text.secondary", opacity: 0.5 }} />
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", color: "text.secondary", opacity: 0.6 }}>{sub.phone}</Typography>
                  </Stack>
                </Stack>

                <Chip label={sub.projectType} size="small" variant="outlined" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem", height: 22, mb: 1 }} />

                <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.7, lineHeight: 1.6 }}>
                  {sub.message}
                </Typography>
              </Box>
              <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", color: "text.secondary", opacity: 0.5, flexShrink: 0, ml: 2 }}>{formatDate(sub.createdAt)}</Typography>
            </Stack>
          </Cell>
        );
      })}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={filtered.length} />
      </>
      )}
    </Box>
  );
}
