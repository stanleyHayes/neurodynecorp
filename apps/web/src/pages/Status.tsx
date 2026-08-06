import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Stack,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  TextField,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import BuildCircleOutlinedIcon from "@mui/icons-material/BuildCircleOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import SEO from "@/components/seo/SEO";
import { api } from "@/api/client";

const MotionBox = motion.create(Box);

const OVERLINE_SX = {
  fontFamily: "monospace",
  fontSize: "0.7rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.25em",
  color: "text.secondary",
  opacity: 0.6,
};

/** Maps a free-form status string to a colour + icon + label. */
function statusMeta(raw: string | undefined) {
  const s = (raw ?? "").toLowerCase();
  if (s.includes("major") || s.includes("critical") || s.includes("outage") || s.includes("down")) {
    return { color: "#EF4444", label: "Major Outage", Icon: ErrorOutlineOutlinedIcon };
  }
  if (s.includes("degraded") || s.includes("partial") || s.includes("minor")) {
    return { color: "#F59E0B", label: "Degraded Performance", Icon: WarningAmberOutlinedIcon };
  }
  if (s.includes("maintenance")) {
    return { color: "#6C63FF", label: "Under Maintenance", Icon: BuildCircleOutlinedIcon };
  }
  if (s === "investigating" || s === "identified") {
    return { color: "#F59E0B", label: s === "identified" ? "Identified" : "Investigating", Icon: WarningAmberOutlinedIcon };
  }
  if (s === "monitoring") {
    return { color: "#6C63FF", label: "Monitoring", Icon: BuildCircleOutlinedIcon };
  }
  if (s === "resolved") {
    return { color: "#10B981", label: "Resolved", Icon: CheckCircleOutlinedIcon };
  }
  return { color: "#10B981", label: "Operational", Icon: CheckCircleOutlinedIcon };
}

function StatusChip({ status }: { status?: string }) {
  const { color, label } = statusMeta(status);
  return (
    <Chip
      label={status ? label : "Operational"}
      size="small"
      sx={{
        bgcolor: `${color}1A`,
        color,
        fontWeight: 600,
        fontSize: "0.72rem",
        border: `1px solid ${color}40`,
      }}
    />
  );
}

function formatDate(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function Status() {
  const [loading, setLoading] = useState(true);
  const [overall, setOverall] = useState<any>(null);
  const [components, setComponents] = useState<any[]>([]);
  const [activeIncidents, setActiveIncidents] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; severity: "success" | "error"; message: string }>(
    { open: false, severity: "success", message: "" }
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [status, incidents] = await Promise.all([
          api.get<any>("/api/v1/status").catch(() => null),
          api.get<any>("/api/v1/status/incidents").catch(() => null),
        ]);
        if (!active) return;
        setOverall(status?.overallStatus ?? null);
        setComponents(Array.isArray(status?.components) ? status.components : []);
        setActiveIncidents(Array.isArray(status?.activeIncidents) ? status.activeIncidents : []);
        setHistory(Array.isArray(incidents?.items) ? incidents.items : []);
      } catch {
        if (active) {
          setComponents([]);
          setActiveIncidents([]);
          setHistory([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function handleSubscribe() {
    const value = email.trim();
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setSnack({ open: true, severity: "error", message: "Please enter a valid email address." });
      return;
    }
    setSubscribing(true);
    try {
      await api.post("/api/v1/status/subscribe", { email: value });
      setEmail("");
      setSnack({ open: true, severity: "success", message: "You're subscribed to status updates." });
    } catch {
      setSnack({ open: true, severity: "error", message: "Couldn't subscribe right now. Please try again." });
    } finally {
      setSubscribing(false);
    }
  }

  const banner = statusMeta(overall);
  const BannerIcon = banner.Icon;

  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <SEO
        title="System Status"
        description="Real-time operational status of NeuroDyne Corp services, active incidents, and incident history."
      />
      <Container maxWidth="lg">
        <Typography sx={OVERLINE_SX}>System Status</Typography>
        <Typography variant="h3" sx={{ fontWeight: 700, mt: 1.5, mb: { xs: 4, md: 6 } }}>
          Service Status
        </Typography>

        {loading ? (
          <Stack sx={{ alignItems: "center", py: 12 }}>
            <CircularProgress />
          </Stack>
        ) : (
          <Stack spacing={{ xs: 4, md: 6 }}>
            {/* Overall banner */}
            <MotionBox
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card
                sx={{
                  bgcolor: `${banner.color}14`,
                  border: `1px solid ${banner.color}55`,
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Stack sx={{ alignItems: "center" }} direction="row" spacing={2.5}>
                    <BannerIcon sx={{ fontSize: 44, color: banner.color }} />
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: banner.color }}>
                        {overall ? banner.label : "All Systems Operational"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {activeIncidents.length > 0
                          ? `${activeIncidents.length} active incident${activeIncidents.length > 1 ? "s" : ""} being tracked.`
                          : "No active incidents reported."}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </MotionBox>

            {/* Components */}
            <Box>
              <Typography sx={OVERLINE_SX}>Components</Typography>
              <Card sx={{ mt: 2, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                <CardContent sx={{ p: 0 }}>
                  {components.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: "center" }}>
                      <Typography color="text.secondary">No components to display.</Typography>
                    </Box>
                  ) : (
                    components.map((c: any, i: number) => (
                      <Box key={c.id ?? c.name ?? i}>
                        {i > 0 && <Divider />}
                        <Stack
                          direction="row"
                          sx={{ alignItems: "center", justifyContent: "space-between", px: { xs: 2.5, md: 3 }, py: 2 }}
                        >
                          <Box>
                            <Typography sx={{ fontWeight: 600 }}>{c.name ?? "Service"}</Typography>
                            {c.description && (
                              <Typography variant="body2" color="text.secondary">
                                {c.description}
                              </Typography>
                            )}
                          </Box>
                          <StatusChip status={c.status} />
                        </Stack>
                      </Box>
                    ))
                  )}
                </CardContent>
              </Card>
            </Box>

            {/* Active incidents */}
            {activeIncidents.length > 0 && (
              <Box>
                <Typography sx={OVERLINE_SX}>Active Incidents</Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {activeIncidents.map((inc: any, i: number) => {
                    const meta = statusMeta(inc.status);
                    return (
                      <Card
                        key={inc.id ?? i}
                        sx={{ borderRadius: 3, border: `1px solid ${meta.color}55`, bgcolor: `${meta.color}0D` }}
                      >
                        <CardContent>
                          <Stack
                            direction="row"
                            spacing={2}
                            sx={{ alignItems: "center", justifyContent: "space-between", mb: 1 }}
                          >
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              {inc.title ?? inc.name ?? "Incident"}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                              {inc.impact && inc.impact !== "none" && (
                                <Chip
                                  label={String(inc.impact).replace(/_/g, " ")}
                                  size="small"
                                  sx={{ textTransform: "capitalize", fontSize: "0.7rem" }}
                                />
                              )}
                              <StatusChip status={inc.status} />
                            </Stack>
                          </Stack>
                          {inc.startedAt || inc.createdAt ? (
                            <Typography variant="caption" color="text.secondary">
                              Started {formatDate(inc.startedAt ?? inc.createdAt)}
                            </Typography>
                          ) : null}
                          {Array.isArray(inc.updates) && inc.updates.length > 0 && (
                            <Stack spacing={1.5} sx={{ mt: 2 }}>
                              {inc.updates.map((u: any, ui: number) => (
                                <Box
                                  key={u.id ?? ui}
                                  sx={{ pl: 2, borderLeft: "2px solid", borderColor: "divider" }}
                                >
                                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.25 }}>
                                    {u.status && (
                                      <Typography
                                        sx={{
                                          fontFamily: "monospace",
                                          fontSize: "0.7rem",
                                          textTransform: "uppercase",
                                          letterSpacing: "0.1em",
                                          color: "text.secondary",
                                        }}
                                      >
                                        {u.status}
                                      </Typography>
                                    )}
                                    <Typography variant="caption" color="text.secondary">
                                      {formatDate(u.createdAt ?? u.timestamp)}
                                    </Typography>
                                  </Stack>
                                  <Typography variant="body2">{u.body ?? u.message}</Typography>
                                </Box>
                              ))}
                            </Stack>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              </Box>
            )}

            {/* Incident history */}
            <Box>
              <Typography sx={OVERLINE_SX}>Incident History</Typography>
              {history.length === 0 ? (
                <Card sx={{ mt: 2, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                  <CardContent sx={{ textAlign: "center", py: 5 }}>
                    <Typography color="text.secondary">
                      No incidents recorded. All quiet on the wire.
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {history.map((inc: any, i: number) => {
                    return (
                      <Card
                        key={inc.id ?? i}
                        sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}
                      >
                        <CardContent>
                          <Stack sx={{ alignItems: "center", justifyContent: "space-between" }}
                            direction="row"
                            spacing={2}
                          >
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                {inc.title ?? inc.name ?? "Incident"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(inc.startedAt ?? inc.createdAt)}
                                {inc.resolvedAt ? ` — resolved ${formatDate(inc.resolvedAt)}` : ""}
                              </Typography>
                            </Box>
                            <StatusChip status={inc.status} />
                          </Stack>
                          {Array.isArray(inc.updates) && inc.updates.length > 0 && (
                            <Stack spacing={1.5} sx={{ mt: 2 }}>
                              {inc.updates.map((u: any, ui: number) => (
                                <Box
                                  key={u.id ?? ui}
                                  sx={{ pl: 2, borderLeft: "2px solid", borderColor: "divider" }}
                                >
                                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.25 }}>
                                    {u.status && (
                                      <Typography
                                        sx={{
                                          fontFamily: "monospace",
                                          fontSize: "0.7rem",
                                          textTransform: "uppercase",
                                          letterSpacing: "0.1em",
                                          color: "text.secondary",
                                        }}
                                      >
                                        {u.status}
                                      </Typography>
                                    )}
                                    <Typography variant="caption" color="text.secondary">
                                      {formatDate(u.createdAt ?? u.timestamp)}
                                    </Typography>
                                  </Stack>
                                  <Typography variant="body2">{u.body ?? u.message}</Typography>
                                </Box>
                              ))}
                            </Stack>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              )}
            </Box>

            {/* Subscribe */}
            <Card
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "rgba(108,99,255,0.06)",
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1 }}>
                  <NotificationsActiveOutlinedIcon sx={{ color: "#6C63FF" }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Subscribe to updates
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                  Get notified by email when we open or resolve an incident.
                </Typography>
                <Stack sx={{ alignItems: { sm: "stretch" } }} direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <TextField
                    fullWidth
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSubscribe();
                    }}
                    size="medium"
                  />
                  <Button
                    variant="contained"
                    onClick={handleSubscribe}
                    disabled={subscribing}
                    sx={{ px: 4, whiteSpace: "nowrap" }}
                  >
                    {subscribing ? <CircularProgress size={22} color="inherit" /> : "Subscribe"}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        )}
      </Container>

      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
