import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
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
  Alert,
} from "@mui/material";
import FeedbackOutlinedIcon from "@mui/icons-material/FeedbackOutlined";
import { useAuth } from "@/context/AuthContext";

const overlineSx = {
  fontFamily: "monospace",
  fontSize: "0.7rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.25em",
  color: "text.secondary",
  opacity: 0.6,
};

const TYPE_OPTIONS = ["nps", "rating", "comment", "bug", "feature"];

const typeColor: Record<string, string> = {
  nps: "#6C63FF",
  rating: "#00D4AA",
  comment: "#10B981",
  bug: "#EF4444",
  feature: "#F59E0B",
};

function npsColor(nps: number): string {
  if (nps > 0) return "#10B981";
  if (nps < 0) return "#EF4444";
  return "#F59E0B";
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatCard({
  label,
  value,
  color = "#6C63FF",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        bgcolor: "#111827",
        borderColor: `${color}30`,
        borderRadius: 2,
        flex: 1,
        minWidth: 140,
      }}
    >
      <CardContent>
        <Typography sx={{ ...overlineSx, mb: 1 }}>{label}</Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, color }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function FeedbackInbox() {
  const { api } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params: Record<string, string> = {};
      if (typeFilter) params.type = typeFilter;
      const [statsRes, listRes] = await Promise.all([
        api.get<any>("/api/v1/feedback/stats"),
        api.get<any>("/api/v1/feedback", Object.keys(params).length ? params : undefined),
      ]);
      setStats(statsRes ?? null);
      const list = Array.isArray(listRes)
        ? listRes
        : (listRes?.items ?? listRes?.data ?? []);
      setItems(list);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load feedback");
    } finally {
      setLoading(false);
    }
  }, [api, typeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const nps = Number(stats?.nps ?? stats?.NPS ?? 0);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Container maxWidth="lg" disableGutters>
        <Box sx={{ mb: 3 }}>
          <Typography sx={overlineSx}>FEEDBACK // INBOX</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
            Feedback Inbox
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            NPS, ratings, and comments submitted across the product.
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : (
          <>
            <Stack
              direction="row"
              spacing={2}
              alignItems="stretch"
              sx={{ mb: 3, flexWrap: "wrap", gap: 2 }}
            >
              <Card
                variant="outlined"
                sx={{
                  bgcolor: "#111827",
                  borderColor: `${npsColor(nps)}40`,
                  borderRadius: 2,
                  minWidth: 200,
                  flex: "1 1 200px",
                }}
              >
                <CardContent>
                  <Typography sx={{ ...overlineSx, mb: 1 }}>
                    Net Promoter Score
                  </Typography>
                  <Typography
                    variant="h2"
                    sx={{ fontWeight: 900, color: npsColor(nps), lineHeight: 1 }}
                  >
                    {nps > 0 ? `+${nps}` : nps}
                  </Typography>
                </CardContent>
              </Card>
              <StatCard
                label="Promoters"
                value={String(stats?.promoters ?? 0)}
                color="#10B981"
              />
              <StatCard
                label="Passives"
                value={String(stats?.passives ?? 0)}
                color="#F59E0B"
              />
              <StatCard
                label="Detractors"
                value={String(stats?.detractors ?? 0)}
                color="#EF4444"
              />
              <StatCard
                label="Avg Score"
                value={
                  stats?.averageScore != null
                    ? Number(stats.averageScore).toFixed(1)
                    : "—"
                }
                color="#6C63FF"
              />
            </Stack>

            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ mb: 2 }}
            >
              <Typography sx={overlineSx}>Filter by type</Typography>
              <Select
                size="small"
                value={typeFilter}
                displayEmpty
                onChange={(e) => setTypeFilter(e.target.value)}
                sx={{ minWidth: 160, fontFamily: "monospace", fontSize: "0.8rem" }}
              >
                <MenuItem value="">All types</MenuItem>
                {TYPE_OPTIONS.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </Stack>

            <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.06)" }} />

            <Card
              variant="outlined"
              sx={{ bgcolor: "#111827", borderColor: "rgba(255,255,255,0.08)", borderRadius: 2 }}
            >
              {items.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <FeedbackOutlinedIcon
                    sx={{ fontSize: 48, color: "text.secondary", opacity: 0.3, mb: 1 }}
                  />
                  <Typography sx={{ color: "text.secondary" }}>
                    No feedback yet
                    {typeFilter ? ` for type "${typeFilter}".` : "."}
                  </Typography>
                </Box>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={overlineSx}>Time</TableCell>
                      <TableCell sx={overlineSx}>Type</TableCell>
                      <TableCell sx={overlineSx}>Score</TableCell>
                      <TableCell sx={overlineSx}>Message</TableCell>
                      <TableCell sx={overlineSx}>Page</TableCell>
                      <TableCell sx={overlineSx}>Email</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((f, i) => {
                      const t = String(f.type ?? "").toLowerCase();
                      const color = typeColor[t] ?? "#94A3B8";
                      return (
                        <TableRow key={f.id ?? f._id ?? i} hover>
                          <TableCell
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "0.7rem",
                              color: "text.secondary",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatDate(f.createdAt ?? f.created_at ?? f.time)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={(f.type ?? "—").toString().toUpperCase()}
                              size="small"
                              sx={{
                                fontFamily: "monospace",
                                fontSize: "0.6rem",
                                bgcolor: `${color}18`,
                                color,
                                border: `1px solid ${color}30`,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>
                            {f.score != null ? f.score : "—"}
                          </TableCell>
                          <TableCell
                            sx={{
                              maxWidth: 320,
                              color: "text.secondary",
                              fontSize: "0.8rem",
                            }}
                          >
                            {f.message ?? f.comment ?? "—"}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "0.7rem",
                              color: "text.secondary",
                            }}
                          >
                            {f.page ?? f.url ?? "—"}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "0.7rem",
                              color: "text.secondary",
                            }}
                          >
                            {f.email ?? "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </Card>
          </>
        )}
      </Container>
    </Box>
  );
}
