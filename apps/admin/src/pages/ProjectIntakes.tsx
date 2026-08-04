import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogContent, Divider, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from "@mui/material";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import { getProjectIntakeSections, PROJECT_INTAKE_CATEGORIES, type ProjectIntakeRecord } from "@neurodyne/shared";
import { useAuth } from "@/context/AuthContext";
import EmptyState from "@/components/shared/EmptyState";

const categoryLabel = (id: string) => PROJECT_INTAKE_CATEGORIES.find(c => c.id === id)?.label ?? id;
const valueText = (value: unknown) => Array.isArray(value) ? value.join(", ") : typeof value === "boolean" ? (value ? "Yes" : "No") : String(value ?? "—");

export default function ProjectIntakes() {
  const { api } = useAuth();
  const [items, setItems] = useState<ProjectIntakeRecord[]>([]);
  const [status, setStatus] = useState<"" | "draft" | "submitted">("submitted");
  const [selected, setSelected] = useState<ProjectIntakeRecord>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setItems((await api.listProjectIntakes(status || undefined)).items); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not load project briefs."); }
    finally { setLoading(false); }
  }, [api, status]);
  useEffect(() => { void load(); }, [load]);
  const stats = useMemo(() => ({ submitted: items.filter(i => i.status === "submitted").length, categories: new Set(items.map(i => i.category)).size }), [items]);
  const sections = selected ? getProjectIntakeSections(selected.category) : [];

  return <Box sx={{ p: { xs: 2, md: 3 } }}>
    <Stack direction={{ xs: "column", sm: "row" }} sx={{ justifyContent: "space-between", gap: 2, mb: 3 }}>
      <Box><Typography sx={{ fontFamily: "monospace", fontSize: 11, letterSpacing: ".18em", color: "primary.main" }}>PIPELINE // DISCOVERY</Typography><Typography variant="h4" sx={{ fontWeight: 750, mt: .5 }}>Project briefs</Typography><Typography color="text.secondary">Submitted discovery briefs and in-progress client drafts.</Typography></Box>
      <FormControl size="small" sx={{ minWidth: 180 }}><InputLabel>Status</InputLabel><Select label="Status" value={status} onChange={e => setStatus(e.target.value as typeof status)}><MenuItem value="">All briefs</MenuItem><MenuItem value="submitted">Submitted</MenuItem><MenuItem value="draft">Drafts</MenuItem></Select></FormControl>
    </Stack>
    <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1.5, mb: 3 }}><Chip label={`${items.length} shown`} /><Chip label={`${stats.submitted} submitted`} color="success" variant="outlined" /><Chip label={`${stats.categories} categories`} variant="outlined" /></Stack>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {loading ? <Box sx={{ py: 10, textAlign: "center" }}><CircularProgress /></Box> : items.length === 0 ? <EmptyState icon={<AssignmentOutlinedIcon />} title="No project briefs" description="Newly saved and submitted discovery briefs will appear here." /> :
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2,1fr)", xl: "repeat(3,1fr)" }, gap: 2 }}>{items.map(item =>
        <Box key={item.id} sx={{ p: 2.5, bgcolor: "background.paper", border: "1px solid rgba(108,99,255,.14)", display: "flex", flexDirection: "column", minHeight: 210 }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", gap: 2 }}><Typography variant="h6" sx={{ fontWeight: 700 }}>{item.title || "Untitled brief"}</Typography><Chip size="small" label={item.status} color={item.status === "submitted" ? "success" : "default"} variant="outlined" /></Stack>
          <Typography variant="body2" color="primary.main" sx={{ mt: 1 }}>{categoryLabel(item.category)}</Typography>
          <Typography color="text.secondary" sx={{ mt: 2 }}>{item.contactName || "Unknown contact"} · {item.company || "Independent"}</Typography><Typography variant="body2" color="text.secondary">{item.contactEmail || "No email"}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: "auto", pt: 2 }}>Updated {new Date(item.updatedAt).toLocaleString()}</Typography><Button onClick={() => setSelected(item)} sx={{ mt: 1, alignSelf: "flex-start" }}>Review brief</Button>
        </Box>)}</Box>}
    <Dialog open={Boolean(selected)} onClose={() => setSelected(undefined)} fullWidth maxWidth="md"><DialogContent sx={{ p: { xs: 2.5, md: 4 } }}>{selected && <>
      <Stack direction={{ xs: "column", sm: "row" }} sx={{ justifyContent: "space-between", gap: 2 }}><Box><Typography sx={{ fontFamily: "monospace", color: "primary.main", fontSize: 11, letterSpacing: ".14em" }}>{categoryLabel(selected.category)}</Typography><Typography variant="h4" sx={{ fontWeight: 750, mt: 1 }}>{selected.title}</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>{selected.contactName} · {selected.contactEmail}{selected.company ? ` · ${selected.company}` : ""}</Typography></Box><Chip label={selected.status} color={selected.status === "submitted" ? "success" : "default"} sx={{ alignSelf: "flex-start" }} /></Stack>
      <Divider sx={{ my: 3 }} />
      {sections.map(section => { const answered = section.fields.filter(f => selected.answers[f.id] !== undefined && selected.answers[f.id] !== "" && (!Array.isArray(selected.answers[f.id]) || (selected.answers[f.id] as unknown[]).length)); if (!answered.length) return null; return <Box key={section.id} sx={{ mb: 4 }}><Typography sx={{ fontFamily: "monospace", fontSize: 10, color: "primary.main", letterSpacing: ".14em" }}>{section.eyebrow}</Typography><Typography variant="h6" sx={{ fontWeight: 700, mt: .5, mb: 2 }}>{section.title}</Typography><Stack spacing={2}>{answered.map(field => <Box key={field.id}><Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: ".08em" }}>{field.label}</Typography><Typography sx={{ whiteSpace: "pre-wrap", mt: .35 }}>{valueText(selected.answers[field.id])}</Typography></Box>)}</Stack></Box>; })}
    </>}</DialogContent></Dialog>
  </Box>;
}
