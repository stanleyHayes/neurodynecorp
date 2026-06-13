import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Stack,
  Typography,
  Card,
  CardContent,
  Chip,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import UnsubscribeOutlinedIcon from "@mui/icons-material/UnsubscribeOutlined";
import { useAuth } from "@/context/AuthContext";

const overlineSx = {
  fontFamily: "monospace",
  fontSize: "0.7rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.25em",
  color: "text.secondary",
  opacity: 0.6,
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "#F59E0B" },
  confirmed: { label: "Confirmed", color: "#10B981" },
  unsubscribed: { label: "Unsubscribed", color: "#94A3B8" },
};

function asList(res: any): any[] {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.items)) return res.items;
  if (Array.isArray(res?.data)) return res.data;
  return [];
}

function fmtDate(v: any): string {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

export default function Newsletter() {
  const { api } = useAuth();
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = statusFilter === "all" ? undefined : { status: statusFilter };
      const res: any = await api.get("/api/v1/newsletter", params);
      setSubscribers(asList(res));
    } catch {
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  }, [api, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const counts = {
    pending: subscribers.filter((s) => s.status === "pending").length,
    confirmed: subscribers.filter((s) => s.status === "confirmed").length,
    unsubscribed: subscribers.filter((s) => s.status === "unsubscribed").length,
  };

  const stats = [
    { key: "total", label: "Total", value: subscribers.length, icon: <MarkEmailReadOutlinedIcon />, color: "#6C63FF" },
    { key: "pending", label: "Pending", value: counts.pending, icon: <HourglassEmptyOutlinedIcon />, color: "#F59E0B" },
    { key: "confirmed", label: "Confirmed", value: counts.confirmed, icon: <CheckCircleOutlineOutlinedIcon />, color: "#10B981" },
    { key: "unsubscribed", label: "Unsubscribed", value: counts.unsubscribed, icon: <UnsubscribeOutlinedIcon />, color: "#94A3B8" },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} flexWrap="wrap">
        <Box>
          <Typography sx={overlineSx}>AUDIENCE // NEWSLETTER</Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
            Newsletter
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Track newsletter subscribers and their confirmation lifecycle.
          </Typography>
        </Box>
        <Select
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 180, flexShrink: 0 }}
        >
          <MenuItem value="all">All statuses</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="confirmed">Confirmed</MenuItem>
          <MenuItem value="unsubscribed">Unsubscribed</MenuItem>
        </Select>
      </Stack>

      <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.08)" }} />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
          gap: 2,
          mb: 3,
        }}
      >
        {stats.map((s) => (
          <Card key={s.key} sx={{ bgcolor: "background.paper" }}>
            <CardContent>
              <Box sx={{ color: s.color, mb: 1, "& .MuiSvgIcon-root": { fontSize: 26 } }}>{s.icon}</Box>
              <Typography sx={{ ...overlineSx, fontSize: "0.6rem", mb: 0.5 }}>{s.label}</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {loading ? "—" : s.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card sx={{ bgcolor: "background.paper" }}>
        <CardContent>
          <Typography sx={{ ...overlineSx, fontSize: "0.65rem", mb: 2 }}>SUBSCRIBERS</Typography>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : subscribers.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <MarkEmailReadOutlinedIcon sx={{ fontSize: 48, color: "text.secondary", opacity: 0.4, mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                No subscribers found
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                {statusFilter === "all"
                  ? "Subscribers will appear here once people sign up."
                  : `No subscribers with status "${statusFilter}".`}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Segments</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Confirmed</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subscribers.map((s, i) => {
                    const meta = STATUS_META[s.status] ?? { label: s.status ?? "Unknown", color: "#94A3B8" };
                    const segments: string[] = Array.isArray(s.segments)
                      ? s.segments
                      : s.segments
                        ? String(s.segments).split(",").map((x: string) => x.trim()).filter(Boolean)
                        : [];
                    return (
                      <TableRow key={s.id ?? s._id ?? s.email ?? i} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{s.email ?? "—"}</TableCell>
                        <TableCell>
                          <Chip
                            label={meta.label}
                            size="small"
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "0.6rem",
                              bgcolor: `${meta.color}1A`,
                              color: meta.color,
                              border: `1px solid ${meta.color}30`,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {segments.length === 0 ? (
                            <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.6 }}>
                              —
                            </Typography>
                          ) : (
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                              {segments.map((seg) => (
                                <Chip
                                  key={seg}
                                  label={seg}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: "0.6rem", borderColor: "rgba(108,99,255,0.3)", color: "text.secondary" }}
                                />
                              ))}
                            </Stack>
                          )}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap", color: "text.secondary" }}>
                          {fmtDate(s.createdAt ?? s.created_at)}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap", color: "text.secondary" }}>
                          {fmtDate(s.confirmedAt ?? s.confirmed_at)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
