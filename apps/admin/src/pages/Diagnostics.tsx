import { useState, useEffect, useCallback } from "react";
import {
  Box, Container, Stack, Typography, Card, CardContent, Chip, Select, MenuItem,
  Divider, CircularProgress, Table, TableHead, TableBody, TableRow, TableCell, Alert,
} from "@mui/material";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import { useAuth } from "@/context/AuthContext";

const overlineSx = {
  fontFamily: "monospace",
  fontSize: "0.7rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.25em",
  color: "text.secondary",
  opacity: 0.6,
};

const ROUTE_LABELS: Record<string, string> = {
  services: "Services",
  labs: "Labs",
  gov_digital_excellence: "Gov Digital Excellence",
  decline_referral: "Decline / referral",
};

const ROUTE_COLOR: Record<string, string> = {
  services: "#6C63FF",
  labs: "#8B85FF",
  gov_digital_excellence: "#00D4AA",
  decline_referral: "#F59E0B",
};

function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function StatCard({ label, value, color = "#6C63FF" }: { label: string; value: string; color?: string }) {
  return (
    <Card variant="outlined" sx={{ bgcolor: "#111827", borderColor: `${color}30`, borderRadius: 2, flex: 1, minWidth: 140 }}>
      <CardContent>
        <Typography sx={{ ...overlineSx, mb: 1 }}>{label}</Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, color }}>{value}</Typography>
      </CardContent>
    </Card>
  );
}

export default function Diagnostics() {
  const { api } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [routeFilter, setRouteFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params: Record<string, string> = {};
      if (routeFilter) params.route = routeFilter;
      const res = await api.listDiagnostics(Object.keys(params).length ? params : undefined);
      setItems(Array.isArray(res) ? res : (res?.items ?? []));
    } catch (err: any) {
      setError(err?.message ?? "Failed to load diagnostics");
    } finally {
      setLoading(false);
    }
  }, [api, routeFilter]);

  useEffect(() => { load(); }, [load]);

  const count = (route: string) => items.filter((d) => d.result?.route === route).length;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Container maxWidth="lg" disableGutters>
        <Box sx={{ mb: 3 }}>
          <Typography sx={overlineSx}>INTAKE // DIAGNOSTIC</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>Engagement Readiness Diagnostic</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Qualified intake submissions with their server-scored routing decision.
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        ) : (
          <>
            <Stack direction="row" spacing={2} sx={{ alignItems: "stretch", mb: 3, flexWrap: "wrap", gap: 2 }}>
              <StatCard label="Total" value={String(items.length)} color="#6C63FF" />
              <StatCard label="Services" value={String(count("services"))} color={ROUTE_COLOR.services} />
              <StatCard label="Labs" value={String(count("labs"))} color={ROUTE_COLOR.labs} />
              <StatCard label="Gov" value={String(count("gov_digital_excellence"))} color={ROUTE_COLOR.gov_digital_excellence} />
              <StatCard label="Declined" value={String(count("decline_referral"))} color={ROUTE_COLOR.decline_referral} />
            </Stack>

            <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 2 }}>
              <Typography sx={overlineSx}>Filter by route</Typography>
              <Select size="small" value={routeFilter} displayEmpty onChange={(e) => setRouteFilter(e.target.value)} sx={{ minWidth: 200, fontFamily: "monospace", fontSize: "0.8rem" }}>
                <MenuItem value="">All routes</MenuItem>
                {Object.entries(ROUTE_LABELS).map(([k, v]) => (
                  <MenuItem key={k} value={k}>{v}</MenuItem>
                ))}
              </Select>
            </Stack>

            <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.06)" }} />

            <Card variant="outlined" sx={{ bgcolor: "#111827", borderColor: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
              {items.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <InsightsOutlinedIcon sx={{ fontSize: 48, color: "text.secondary", opacity: 0.3, mb: 1 }} />
                  <Typography sx={{ color: "text.secondary" }}>
                    No diagnostic submissions yet{routeFilter ? ` for "${ROUTE_LABELS[routeFilter]}".` : "."}
                  </Typography>
                </Box>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={overlineSx}>Time</TableCell>
                      <TableCell sx={overlineSx}>Route</TableCell>
                      <TableCell sx={overlineSx}>Confidence</TableCell>
                      <TableCell sx={overlineSx}>Organisation</TableCell>
                      <TableCell sx={overlineSx}>Contact</TableCell>
                      <TableCell sx={overlineSx}>Top reason</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((d, i) => {
                      const route = String(d.result?.route ?? "");
                      const color = ROUTE_COLOR[route] ?? "#94A3B8";
                      return (
                        <TableRow key={d.id ?? d._id ?? i} hover>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "text.secondary", whiteSpace: "nowrap" }}>
                            {formatDate(d.createdAt ?? d.created_at)}
                          </TableCell>
                          <TableCell>
                            <Chip label={ROUTE_LABELS[route] ?? route ?? "—"} size="small" sx={{ fontFamily: "monospace", fontSize: "0.6rem", bgcolor: `${color}18`, color, border: `1px solid ${color}30` }} />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>
                            {d.result?.confidence != null ? `${Math.round(d.result.confidence * 100)}%` : "—"}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.8rem" }}>{d.org ?? "—"}</TableCell>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "text.secondary" }}>
                            {d.email ?? d.respondentName ?? "—"}
                          </TableCell>
                          <TableCell sx={{ maxWidth: 320, color: "text.secondary", fontSize: "0.8rem" }}>
                            {d.result?.reasons?.[0] ?? "—"}
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
