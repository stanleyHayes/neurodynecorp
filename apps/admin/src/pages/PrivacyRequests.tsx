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
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import PrivacyTipOutlinedIcon from "@mui/icons-material/PrivacyTipOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import { useAuth } from "@/context/AuthContext";

const overlineSx = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "0.7rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.25em",
  color: "text.secondary",
  opacity: 0.6,
};

const STATUS_OPTIONS = ["received", "in_progress", "completed", "rejected"];

const statusColor: Record<string, string> = {
  received: "#3B82F6",
  in_progress: "#F59E0B",
  completed: "#10B981",
  rejected: "#EF4444",
};

const typeColor: Record<string, string> = {
  access: "#06B6D4",
  export: "#06B6D4",
  deletion: "#EF4444",
  delete: "#EF4444",
  rectification: "#F59E0B",
  correction: "#F59E0B",
};

/**
 * Days left to answer, against the 30-day commitment on /account-deletion.
 *
 * The page promised a deadline that nothing tracked, so a request could sit in
 * "received" indefinitely while the promise stood. This is the promise made
 * visible to the person who has to keep it.
 */
function dueState(r: any): { label: string; color: string; overdue: boolean } | null {
  const raw = r.dueAt ?? r.due_at;
  if (!raw) return null;
  const due = new Date(raw);
  if (isNaN(due.getTime())) return null;

  const settled = r.status === "completed" || r.status === "rejected";
  if (settled) return { label: "Closed", color: "#94A3B8", overdue: false };

  const days = Math.ceil((due.getTime() - Date.now()) / 86_400_000);
  if (days < 0) return { label: `${Math.abs(days)}d overdue`, color: "#EF4444", overdue: true };
  if (days === 0) return { label: "Due today", color: "#EF4444", overdue: true };
  if (days <= 7) return { label: `${days}d left`, color: "#F59E0B", overdue: false };
  return { label: `${days}d left`, color: "#10B981", overdue: false };
}

function statusLabel(s: string): string {
  return s
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
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
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        bgcolor: "#111a2e",
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

export default function PrivacyRequests() {
  const { api } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ msg: string; severity: "success" | "error" } | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get<any>("/api/v1/privacy/requests");
      const list = Array.isArray(res) ? res : (res?.items ?? res?.data ?? []);
      setItems(list);
      const initNotes: Record<string, string> = {};
      for (const r of list) {
        const id = r.id ?? r._id;
        if (id) initNotes[id] = r.notes ?? "";
      }
      setNotes(initNotes);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load privacy requests");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const patchRequest = useCallback(
    async (id: string, body: Record<string, unknown>, successMsg: string) => {
      try {
        setSavingId(id);
        await api.patch(`/api/v1/privacy/requests/${id}`, body);
        setItems((prev) =>
          prev.map((r) =>
            (r.id ?? r._id) === id ? { ...r, ...body } : r,
          ),
        );
        setToast({ msg: successMsg, severity: "success" });
      } catch (err: any) {
        setToast({ msg: err?.message ?? "Update failed", severity: "error" });
      } finally {
        setSavingId(null);
      }
    },
    [api],
  );

  const counts = STATUS_OPTIONS.reduce<Record<string, number>>((acc, s) => {
    acc[s] = items.filter((r) => r.status === s).length;
    return acc;
  }, {});

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Container maxWidth="lg" disableGutters>
        <Box sx={{ mb: 3 }}>
          <Typography sx={overlineSx}>PRIVACY // DSAR</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
            Privacy Requests
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Track and resolve data subject access, export, and deletion requests.
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
              sx={{ mb: 3, flexWrap: "wrap", gap: 2 }}
            >
              {STATUS_OPTIONS.map((s) => (
                <StatCard
                  key={s}
                  label={statusLabel(s)}
                  value={String(counts[s] ?? 0)}
                  color={statusColor[s]}
                />
              ))}
            </Stack>

            <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.06)" }} />

            <Card
              variant="outlined"
              sx={{
                bgcolor: "#111a2e",
                borderColor: "rgba(255,255,255,0.08)",
                borderRadius: 2,
              }}
            >
              {items.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <PrivacyTipOutlinedIcon
                    sx={{ fontSize: 48, color: "text.secondary", opacity: 0.3, mb: 1 }}
                  />
                  <Typography sx={{ color: "text.secondary" }}>
                    No privacy requests yet.
                  </Typography>
                </Box>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={overlineSx}>Time</TableCell>
                      <TableCell sx={overlineSx}>Email</TableCell>
                      <TableCell sx={overlineSx}>Type</TableCell>
                      <TableCell sx={overlineSx}>Status</TableCell>
                      <TableCell sx={overlineSx}>Due</TableCell>
                      <TableCell sx={overlineSx}>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((r, i) => {
                      const id = r.id ?? r._id ?? String(i);
                      const t = String(r.type ?? "").toLowerCase();
                      const tColor = typeColor[t] ?? "#94A3B8";
                      const isSaving = savingId === id;
                      return (
                        <TableRow key={id} hover>
                          <TableCell
                            sx={{
                              fontFamily: "'Outfit', sans-serif",
                              fontSize: "0.7rem",
                              color: "text.secondary",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatDate(r.createdAt ?? r.created_at ?? r.time)}
                          </TableCell>
                          <TableCell
                            sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.75rem" }}
                          >
                            {r.email ?? "—"}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={(r.type ?? "—").toString().toUpperCase()}
                              size="small"
                              sx={{
                                fontFamily: "'Outfit', sans-serif",
                                fontSize: "0.6rem",
                                bgcolor: `${tColor}18`,
                                color: tColor,
                                border: `1px solid ${tColor}30`,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ minWidth: 170 }}>
                            <Stack sx={{ alignItems: "center" }}
                              direction="row"
                              spacing={1}
                            >
                              <Select
                                size="small"
                                value={
                                  STATUS_OPTIONS.includes(r.status)
                                    ? r.status
                                    : "received"
                                }
                                disabled={isSaving}
                                onChange={(e) => {
                                  const status = e.target.value;
                                  const body: Record<string, unknown> = { status };
                                  if (status === "completed") {
                                    const note = (notes[id] ?? "").trim();
                                    if (note.length < 8) {
                                      setToast({
                                        msg: "Add fulfillment notes (8+ characters) before marking completed",
                                        severity: "error",
                                      });
                                      return;
                                    }
                                    body.fulfillmentNote = note;
                                  }
                                  patchRequest(id, body, "Status updated");
                                }}
                                sx={{
                                  fontFamily: "'Outfit', sans-serif",
                                  fontSize: "0.72rem",
                                  minWidth: 140,
                                  color: statusColor[r.status] ?? "text.primary",
                                }}
                              >
                                {STATUS_OPTIONS.map((s) => (
                                  <MenuItem
                                    key={s}
                                    value={s}
                                    sx={{ fontSize: "0.78rem" }}
                                  >
                                    {statusLabel(s)}
                                  </MenuItem>
                                ))}
                              </Select>
                              {isSaving && <CircularProgress size={16} />}
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            {(() => {
                              const due = dueState(r);
                              if (!due) return <Box component="span" sx={{ color: "text.secondary" }}>—</Box>;
                              return (
                                <Chip
                                  label={due.label}
                                  size="small"
                                  // The word carries the meaning; the colour only reinforces it.
                                  icon={due.overdue ? <ErrorOutlineOutlinedIcon sx={{ fontSize: 14 }} /> : undefined}
                                  sx={{
                                    fontFamily: "'Outfit', sans-serif",
                                    fontSize: "0.6rem",
                                    fontWeight: due.overdue ? 700 : 400,
                                    bgcolor: `${due.color}18`,
                                    color: due.color,
                                    border: `1px solid ${due.color}30`,
                                    "& .MuiChip-icon": { color: due.color },
                                  }}
                                />
                              );
                            })()}
                          </TableCell>
                          <TableCell sx={{ minWidth: 240 }}>
                            <TextField
                              size="small"
                              fullWidth
                              multiline
                              maxRows={3}
                              placeholder="Add notes…"
                              value={notes[id] ?? ""}
                              disabled={isSaving}
                              onChange={(e) =>
                                setNotes((prev) => ({
                                  ...prev,
                                  [id]: e.target.value,
                                }))
                              }
                              onBlur={() => {
                                if ((notes[id] ?? "") !== (r.notes ?? "")) {
                                  patchRequest(
                                    id,
                                    { notes: notes[id] ?? "" },
                                    "Notes saved",
                                  );
                                }
                              }}
                              slotProps={{
                                htmlInput: {
                                  style: { fontSize: "0.78rem" },
                                },
                              }}
                            />
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

      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast?.severity ?? "success"}
          variant="filled"
          onClose={() => setToast(null)}
          sx={{ width: "100%" }}
        >
          {toast?.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
