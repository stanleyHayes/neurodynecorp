import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogContent, Divider, FormControl, InputLabel, LinearProgress, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { getProjectIntakeSections, PROJECT_INTAKE_CATEGORIES, type ProjectIntakeCategory, type ProjectIntakeRecord } from "@neurodyne/shared";
import { useAuth } from "@/context/AuthContext";
import PageBanner from "@/components/shared/PageBanner";

type Draft = Pick<ProjectIntakeRecord, "category" | "title" | "contactName" | "contactEmail" | "company" | "answers" | "currentSection">;
const emptyDraft: Draft = { category: "general", title: "", contactName: "", contactEmail: "", company: "", answers: {}, currentSection: 0 };

export default function StartProject() {
  const { api, user } = useAuth();
  const [items, setItems] = useState<ProjectIntakeRecord[]>([]);
  const [draft, setDraft] = useState<Draft>({ ...emptyDraft, contactName: user ? `${user.first_name} ${user.last_name}` : "", contactEmail: user?.email ?? "", company: user?.company ?? "" });
  const [id, setId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string>();
  const [error, setError] = useState<string>();
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotMessage, setCopilotMessage] = useState("");
  const [copilotReply, setCopilotReply] = useState("");
  const [copilotBusy, setCopilotBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const sections = useMemo(() => getProjectIntakeSections(draft.category), [draft.category]);
  const section = sections[Math.min(draft.currentSection, sections.length - 1)]!;
  const completion = Math.round((Object.values(draft.answers).filter(v => v !== "" && (!Array.isArray(v) || v.length)).length / sections.flatMap(s => s.fields).length) * 100);

  useEffect(() => { api.listMyProjectIntakes().then(r => setItems(r.items)).catch(() => undefined); }, [api]);
  useEffect(() => {
    if (!id) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void save(false), 900);
    return () => clearTimeout(timer.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, id]);

  const save = async (showNotice = true) => {
    setBusy(true); setError(undefined);
    try {
      const saved = id ? await api.updateProjectIntake(id, draft as unknown as Record<string, unknown>, true) : await api.createProjectIntake(draft as unknown as Record<string, unknown>, true);
      setId(saved.id);
      if (showNotice) setNotice("Draft saved. You can safely return later.");
      setItems(prev => [saved, ...prev.filter(i => i.id !== saved.id)]);
      return saved;
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save the draft."); }
    finally { setBusy(false); }
  };
  const submit = async () => {
    const missing = !draft.title.trim() || !draft.contactName.trim() || !/^\S+@\S+\.\S+$/.test(draft.contactEmail);
    if (missing) { setError("Add the project title, contact name, and a valid email before submitting."); return; }
    const requiredMissing = sections.flatMap((s, sectionIndex) => s.fields.filter(f => f.required && (draft.answers[f.id] === undefined || draft.answers[f.id] === "" || (Array.isArray(draft.answers[f.id]) && !(draft.answers[f.id] as unknown[]).length))).map(f => ({ sectionIndex, label: f.label })));
    if (requiredMissing.length) { setDraft(d => ({ ...d, currentSection: requiredMissing[0]!.sectionIndex })); setError(`Complete the required field: ${requiredMissing[0]!.label}`); return; }
    setBusy(true);
    try { const saved = id ? await save(false) : await save(false); if (!saved) return; const done = await api.submitProjectIntake(saved.id, undefined, true); setItems(prev => [done, ...prev.filter(i => i.id !== done.id)]); setNotice("Project brief submitted for review."); setId(undefined); setDraft({ ...emptyDraft, contactName: draft.contactName, contactEmail: draft.contactEmail, company: draft.company }); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not submit the project brief."); } finally { setBusy(false); }
  };
  const askCopilot = async () => {
    if (!copilotMessage.trim()) return;
    setCopilotBusy(true);
    try { const r = await api.askProjectCopilot({ category: draft.category, section: section.title, message: copilotMessage, answers: draft.answers }); setCopilotReply(r.reply); }
    catch { setCopilotReply("I couldn't respond just now. Save your draft and try again."); } finally { setCopilotBusy(false); }
  };
  const setAnswer = (key: string, value: unknown) => setDraft(d => ({ ...d, answers: { ...d.answers, [key]: value } }));
  const openItem = (item: ProjectIntakeRecord) => { setId(item.id); setDraft({ category: item.category, title: item.title, contactName: item.contactName, contactEmail: item.contactEmail, company: item.company ?? "", answers: item.answers, currentSection: item.currentSection }); setNotice(undefined); setError(undefined); };

  return <Box>
    <PageBanner icon={<AutoAwesomeOutlinedIcon />} title="Start a project" description="Build a clear brief at your pace. Save a draft, return later, and submit when it represents what you need." />
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0,1fr) 290px" }, gap: 3 }}>
      <Box sx={{ bgcolor: "background.paper", border: "1px solid rgba(108,99,255,.14)" }}>
        <LinearProgress variant="determinate" value={completion} sx={{ height: 3 }} />
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          <Stack direction={{ xs: "column", sm: "row" }} sx={{ justifyContent: "space-between", gap: 2, mb: 4 }}>
            <Box><Typography sx={{ fontFamily: "monospace", color: "primary.main", fontSize: 11, letterSpacing: ".16em" }}>{section.eyebrow}</Typography><Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>{section.title}</Typography><Typography color="text.secondary" sx={{ mt: 1, maxWidth: 650 }}>{section.description}</Typography></Box>
            <Chip label={`${completion}% complete`} variant="outlined" sx={{ alignSelf: "flex-start" }} />
          </Stack>
          {draft.currentSection === 0 && <Stack spacing={2.25} sx={{ mb: 3 }}>
            <FormControl fullWidth><InputLabel>Project category</InputLabel><Select label="Project category" value={draft.category} onChange={e => setDraft(d => ({ ...d, category: e.target.value as ProjectIntakeCategory, currentSection: 0, answers: {} }))}>{PROJECT_INTAKE_CATEGORIES.map(c => <MenuItem key={c.id} value={c.id}><Box><Typography>{c.label}</Typography><Typography variant="caption" color="text.secondary">{c.description}</Typography></Box></MenuItem>)}</Select></FormControl>
            <TextField label="Project title" required value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} placeholder="e.g. Akwaaba Cleaners website and booking platform" />
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}><TextField label="Contact name" required value={draft.contactName} onChange={e => setDraft(d => ({ ...d, contactName: e.target.value }))} /><TextField label="Contact email" required type="email" value={draft.contactEmail} onChange={e => setDraft(d => ({ ...d, contactEmail: e.target.value }))} /></Box>
            <TextField label="Company or organisation" value={draft.company} onChange={e => setDraft(d => ({ ...d, company: e.target.value }))} />
            <Divider />
          </Stack>}
          <Stack spacing={2.4}>{section.fields.map(field => field.type === "select" ? <FormControl key={field.id} fullWidth required={field.required}><InputLabel>{field.label}</InputLabel><Select label={field.label} value={(draft.answers[field.id] as string) ?? ""} onChange={e => setAnswer(field.id, e.target.value)}>{field.options?.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}</Select></FormControl> : field.type === "multi" ? <Box key={field.id}><Typography sx={{ fontWeight: 600, mb: 1 }}>{field.label}{field.required ? " *" : ""}</Typography><Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>{field.options?.map(o => { const values = (draft.answers[field.id] as string[]) ?? []; const selected = values.includes(o); return <Chip key={o} label={o} clickable color={selected ? "primary" : "default"} variant={selected ? "filled" : "outlined"} onClick={() => setAnswer(field.id, selected ? values.filter(v => v !== o) : [...values, o])} />; })}</Stack></Box> : <TextField key={field.id} label={field.label} required={field.required} helperText={field.help} type={field.type === "url" ? "url" : "text"} multiline={field.type === "textarea"} minRows={field.type === "textarea" ? 3 : undefined} value={(draft.answers[field.id] as string) ?? ""} onChange={e => setAnswer(field.id, e.target.value)} />)}</Stack>
          {(error || notice) && <Alert severity={error ? "error" : "success"} sx={{ mt: 3 }} onClose={() => { setError(undefined); setNotice(undefined); }}>{error ?? notice}</Alert>}
          <Stack direction="row" sx={{ justifyContent: "space-between", mt: 4, gap: 2 }}><Button disabled={draft.currentSection === 0} onClick={() => setDraft(d => ({ ...d, currentSection: Math.max(0, d.currentSection - 1) }))}>Back</Button><Stack direction="row" sx={{ gap: 1 }}><Button startIcon={<SaveOutlinedIcon />} onClick={() => void save()} disabled={busy}>{busy ? "Saving…" : "Save draft"}</Button>{draft.currentSection < sections.length - 1 ? <Button variant="contained" onClick={() => setDraft(d => ({ ...d, currentSection: d.currentSection + 1 }))}>Continue</Button> : <Button variant="contained" onClick={() => void submit()} disabled={busy}>Submit project</Button>}</Stack></Stack>
        </Box>
      </Box>
      <Stack spacing={2}>
        <Button variant="contained" startIcon={<AutoAwesomeOutlinedIcon />} onClick={() => setCopilotOpen(true)} sx={{ py: 1.5, justifyContent: "flex-start" }}>Ask brief copilot</Button>
        <Box sx={{ borderLeft: "2px solid", borderColor: "primary.main", pl: 2, py: 1 }}><Typography sx={{ fontWeight: 700 }}>Your saved briefs</Typography><Typography variant="body2" color="text.secondary">Resume drafts from any signed-in device.</Typography></Box>
        {items.length === 0 ? <Typography variant="body2" color="text.secondary">No saved briefs yet.</Typography> : items.map(item => <Box key={item.id} onClick={() => item.status === "draft" && openItem(item)} sx={{ p: 2, bgcolor: "background.paper", border: "1px solid rgba(108,99,255,.12)", cursor: item.status === "draft" ? "pointer" : "default" }}><Stack direction="row" sx={{ justifyContent: "space-between", gap: 1 }}><Typography sx={{ fontWeight: 650 }}>{item.title || "Untitled brief"}</Typography>{item.status === "submitted" && <Chip label="Done" size="small" color="success" />}</Stack><Typography variant="caption" color="text.secondary">{item.status === "draft" ? "Draft · Continue" : "Submitted"} · {new Date(item.updatedAt).toLocaleDateString()}</Typography></Box>)}
      </Stack>
    </Box>
    <Dialog open={copilotOpen} onClose={() => setCopilotOpen(false)} fullWidth maxWidth="sm"><DialogContent sx={{ p: 3 }}><Stack direction="row" sx={{ gap: 1.5, alignItems: "center", mb: 1 }}><AutoAwesomeOutlinedIcon color="primary" /><Typography variant="h5" sx={{ fontWeight: 700 }}>Brief copilot</Typography></Stack><Typography color="text.secondary" sx={{ mb: 2 }}>Ask for help clarifying this section. Suggestions never overwrite your answers.</Typography><TextField autoFocus fullWidth multiline minRows={3} value={copilotMessage} onChange={e => setCopilotMessage(e.target.value)} placeholder={`Help me think through ${section.title.toLowerCase()}…`} />{copilotReply && <Box sx={{ mt: 2, p: 2, bgcolor: "rgba(108,99,255,.07)", whiteSpace: "pre-wrap" }}><Typography>{copilotReply}</Typography></Box>}<Stack direction="row" sx={{ justifyContent: "flex-end", mt: 2 }}><Button variant="contained" onClick={() => void askCopilot()} disabled={copilotBusy || !copilotMessage.trim()}>{copilotBusy ? <CircularProgress size={20} /> : "Refine my thinking"}</Button></Stack></DialogContent></Dialog>
  </Box>;
}
