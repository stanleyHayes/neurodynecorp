import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Box, Button, Chip, CircularProgress, Container, Dialog, DialogContent, FormControl, InputLabel, LinearProgress, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { getProjectIntakeSections, PROJECT_INTAKE_CATEGORIES, type ProjectIntakeCategory, type ProjectIntakeRecord } from "@neurodyne/shared";
import { api } from "@/api/client";
import SEO from "@/components/seo/SEO";

type Draft = Pick<ProjectIntakeRecord, "category" | "title" | "contactName" | "contactEmail" | "company" | "answers" | "currentSection">;
const KEY = "neurodyne_project_discovery";
const initial: Draft = { category: "general", title: "", contactName: "", contactEmail: "", company: "", answers: {}, currentSection: 0 };
interface Saved { id?: string; resumeToken?: string; draft: Draft }
const load = (): Saved => { try { return JSON.parse(localStorage.getItem(KEY) || "null") || { draft: initial }; } catch { return { draft: initial }; } };

export default function ProjectDiscovery() {
  const saved = useRef(load());
  const [draft, setDraft] = useState<Draft>(saved.current.draft);
  const [id, setId] = useState(saved.current.id);
  const [resumeToken, setResumeToken] = useState(saved.current.resumeToken);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const [submitted, setSubmitted] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotPrompt, setCopilotPrompt] = useState("");
  const [copilotReply, setCopilotReply] = useState("");
  const [copilotBusy, setCopilotBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const sections = useMemo(() => getProjectIntakeSections(draft.category), [draft.category]);
  const section = sections[Math.min(draft.currentSection, sections.length - 1)]!;
  const fieldCount = sections.flatMap(s => s.fields).length;
  const completed = Object.values(draft.answers).filter(v => v !== "" && (!Array.isArray(v) || v.length)).length;
  const progress = Math.round((completed / fieldCount) * 100);

  const persist = (nextDraft = draft, nextId = id, nextToken = resumeToken) => localStorage.setItem(KEY, JSON.stringify({ id: nextId, resumeToken: nextToken, draft: nextDraft }));
  useEffect(() => { persist(); }, [draft, id, resumeToken]);
  useEffect(() => {
    if (!id || !resumeToken || submitted) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void save(false), 1200);
    return () => clearTimeout(timer.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const save = async (notify = true) => {
    setBusy(true); setError(undefined);
    try {
      const payload = { ...draft, ...(resumeToken ? { resumeToken } : {}) } as unknown as Record<string, unknown>;
      const record = id ? await api.updateProjectIntake(id, payload) : await api.createProjectIntake(payload);
      const token = resumeToken || record.resumeToken;
      setId(record.id); setResumeToken(token); persist(draft, record.id, token);
      if (notify) setMessage("Draft saved on this device. Return to this browser to continue.");
      return { record, token };
    } catch (e) { setError(e instanceof Error ? e.message : "We could not save this draft."); }
    finally { setBusy(false); }
  };
  const submit = async () => {
    if (!draft.title.trim() || !draft.contactName.trim() || !/^\S+@\S+\.\S+$/.test(draft.contactEmail)) { setError("Add a project title, contact name, and valid email before submitting."); return; }
    const missing = sections.flatMap((s, sectionIndex) => s.fields.filter(f => f.required && (draft.answers[f.id] === undefined || draft.answers[f.id] === "" || (Array.isArray(draft.answers[f.id]) && !(draft.answers[f.id] as unknown[]).length))).map(f => ({ sectionIndex, label: f.label })));
    if (missing.length) { setDraft(d => ({ ...d, currentSection: missing[0]!.sectionIndex })); setError(`Complete the required field: ${missing[0]!.label}`); return; }
    setBusy(true);
    try { const current = await save(false); if (!current) return; await api.submitProjectIntake(current.record.id, current.token); localStorage.removeItem(KEY); setSubmitted(true); }
    catch (e) { setError(e instanceof Error ? e.message : "We could not submit your project brief."); } finally { setBusy(false); }
  };
  const ask = async () => {
    if (!copilotPrompt.trim()) return;
    setCopilotBusy(true);
    try { const r = await api.askProjectCopilot({ category: draft.category, section: section.title, message: copilotPrompt, answers: draft.answers }); setCopilotReply(r.reply); }
    catch { setCopilotReply("I couldn't respond just now. Your draft is safe—please try again."); } finally { setCopilotBusy(false); }
  };
  const answer = (key: string, value: unknown) => setDraft(d => ({ ...d, answers: { ...d.answers, [key]: value } }));

  if (submitted) return <Box component="main" sx={{ minHeight: "100dvh", display: "grid", placeItems: "center", bgcolor: "background.default", px: 2 }}><SEO title="Project brief submitted" /><Box sx={{ maxWidth: 680, textAlign: "center" }}><Typography sx={{ fontFamily: "monospace", color: "primary.main", letterSpacing: ".18em", mb: 2 }}>BRIEF RECEIVED</Typography><Typography variant="h2" sx={{ fontWeight: 750, letterSpacing: "-.04em" }}>Your thinking is now a working brief.</Typography><Typography color="text.secondary" sx={{ mt: 2, fontSize: 18 }}>We’ll review the context, decisions, and open questions, then contact you with the right next step.</Typography><Button href="/" variant="contained" sx={{ mt: 4 }}>Return home</Button></Box></Box>;

  return <Box component="main" sx={{ minHeight: "100dvh", bgcolor: "background.default", pt: { xs: 12, md: 15 }, pb: 10 }}>
    <SEO
      title="Start a software or website project"
      description="Plan your website, platform, mobile app, e-commerce, public-service, or digital product with NeuroDyne. Save your discovery brief, refine it with the brief copilot, and continue later."
      keywords="start software project, website project brief, app development Ghana, web development Ghana, software discovery, digital product agency Africa"
      canonical="https://neurodyne.dev/start-project"
      ogUrl="https://neurodyne.dev/start-project"
      structuredData={{
        "@context": "https://schema.org",
        "@type": "Service",
        name: "NeuroDyne project discovery",
        provider: { "@type": "Organization", name: "NeuroDyne Corp", url: "https://neurodyne.dev" },
        serviceType: "Software and website project discovery",
        areaServed: ["Ghana", "Africa", "Worldwide"],
        url: "https://neurodyne.dev/start-project",
      }}
    />
    <Container maxWidth="xl">
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "280px minmax(0,1fr)" }, gap: { xs: 3, lg: 5 } }}>
        <Box component="aside" sx={{ position: { lg: "sticky" }, top: 110, alignSelf: "start", minWidth: 0 }}>
          <Typography sx={{ fontFamily: "monospace", color: "primary.main", fontSize: 11, letterSpacing: ".18em" }}>PROJECT DISCOVERY</Typography>
          <Typography component="h1" variant="h3" sx={{ mt: 2, fontWeight: 750, letterSpacing: "-.04em", lineHeight: 1 }}>A serious brief, built at your pace.</Typography>
          <Typography color="text.secondary" sx={{ mt: 2 }}>The questions adapt to the kind of website you need. Save anytime; submit only when it feels complete.</Typography>
          <Stack spacing={1} sx={{ mt: 4 }}>{sections.map((s, i) => <Button key={s.id} onClick={() => setDraft(d => ({ ...d, currentSection: i }))} sx={{ justifyContent: "flex-start", color: i === draft.currentSection ? "primary.main" : "text.secondary", borderLeft: "2px solid", borderColor: i === draft.currentSection ? "primary.main" : "divider", borderRadius: 0, pl: 2, whiteSpace: "normal", textAlign: "left" }}>{String(i + 1).padStart(2, "0")} · {s.title}</Button>)}</Stack>
          <Button fullWidth variant="contained" startIcon={<AutoAwesomeOutlinedIcon />} onClick={() => setCopilotOpen(true)} sx={{ mt: 4, justifyContent: "flex-start", py: 1.4 }}>Ask brief copilot</Button>
        </Box>
        <Box sx={{ minWidth: 0, bgcolor: "background.paper", border: "1px solid rgba(108,99,255,.14)", boxShadow: "0 24px 80px rgba(18,18,35,.12)" }}>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 3 }} />
          <Box sx={{ p: { xs: 2.5, sm: 4, md: 6 } }}>
            <Stack direction={{ xs: "column", sm: "row" }} sx={{ justifyContent: "space-between", gap: 2, mb: 5 }}><Box><Typography sx={{ fontFamily: "monospace", color: "primary.main", fontSize: 11, letterSpacing: ".16em" }}>{section.eyebrow}</Typography><Typography variant="h3" sx={{ mt: 1, fontWeight: 720, letterSpacing: "-.035em" }}>{section.title}</Typography><Typography color="text.secondary" sx={{ mt: 1, maxWidth: 700 }}>{section.description}</Typography></Box><Chip label={`${progress}% mapped`} variant="outlined" sx={{ alignSelf: "flex-start" }} /></Stack>
            {draft.currentSection === 0 && <Stack spacing={2.5} sx={{ mb: 4 }}>
              <FormControl fullWidth><InputLabel>What are you planning?</InputLabel><Select label="What are you planning?" value={draft.category} onChange={e => setDraft(d => ({ ...d, category: e.target.value as ProjectIntakeCategory, currentSection: 0, answers: {} }))}>{PROJECT_INTAKE_CATEGORIES.map(c => <MenuItem value={c.id} key={c.id}><Box><Typography sx={{ fontWeight: 600 }}>{c.label}</Typography><Typography variant="caption" color="text.secondary">{c.description}</Typography></Box></MenuItem>)}</Select></FormControl>
              <TextField required label="Project title" value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} placeholder="Give the initiative a clear working name" />
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}><TextField required label="Your name" value={draft.contactName} onChange={e => setDraft(d => ({ ...d, contactName: e.target.value }))} /><TextField required type="email" label="Email" value={draft.contactEmail} onChange={e => setDraft(d => ({ ...d, contactEmail: e.target.value }))} /></Box>
              <TextField label="Company or organisation" value={draft.company} onChange={e => setDraft(d => ({ ...d, company: e.target.value }))} />
            </Stack>}
            <Stack spacing={3}>{section.fields.map(field => field.type === "select" ? <FormControl fullWidth key={field.id} required={field.required}><InputLabel>{field.label}</InputLabel><Select label={field.label} value={(draft.answers[field.id] as string) ?? ""} onChange={e => answer(field.id, e.target.value)}>{field.options?.map(o => <MenuItem value={o} key={o}>{o}</MenuItem>)}</Select></FormControl> : field.type === "multi" ? <Box key={field.id}><Typography sx={{ fontWeight: 650, mb: 1.25 }}>{field.label}{field.required && " *"}</Typography><Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>{field.options?.map(o => { const values = (draft.answers[field.id] as string[]) || []; const selected = values.includes(o); return <Chip key={o} label={o} clickable variant={selected ? "filled" : "outlined"} color={selected ? "primary" : "default"} onClick={() => answer(field.id, selected ? values.filter(v => v !== o) : [...values, o])} />; })}</Stack></Box> : <TextField key={field.id} label={field.label} required={field.required} helperText={field.help} type={field.type === "url" ? "url" : "text"} multiline={field.type === "textarea"} minRows={field.type === "textarea" ? 3 : undefined} value={(draft.answers[field.id] as string) || ""} onChange={e => answer(field.id, e.target.value)} />)}</Stack>
            {(error || message) && <Alert severity={error ? "error" : "success"} sx={{ mt: 3 }} onClose={() => { setError(undefined); setMessage(undefined); }}>{error || message}</Alert>}
            <Stack direction={{ xs: "column-reverse", sm: "row" }} sx={{ justifyContent: "space-between", mt: 5, gap: 2 }}><Button disabled={draft.currentSection === 0} onClick={() => setDraft(d => ({ ...d, currentSection: Math.max(0, d.currentSection - 1) }))}>Back</Button><Stack direction={{ xs: "column", sm: "row" }} sx={{ gap: 1 }}><Button startIcon={<SaveOutlinedIcon />} onClick={() => void save()} disabled={busy}>{busy ? "Saving…" : "Save and continue later"}</Button>{draft.currentSection < sections.length - 1 ? <Button variant="contained" onClick={() => setDraft(d => ({ ...d, currentSection: d.currentSection + 1 }))}>Continue</Button> : <Button variant="contained" onClick={() => void submit()} disabled={busy}>Submit project brief</Button>}</Stack></Stack>
          </Box>
        </Box>
      </Box>
    </Container>
    <Dialog open={copilotOpen} onClose={() => setCopilotOpen(false)} fullWidth maxWidth="sm"><DialogContent sx={{ p: { xs: 2.5, sm: 4 } }}><Stack direction="row" sx={{ alignItems: "center", gap: 1.5 }}><AutoAwesomeOutlinedIcon color="primary" /><Box><Typography variant="h5" sx={{ fontWeight: 720 }}>Brief copilot</Typography><Typography variant="body2" color="text.secondary">For {section.title.toLowerCase()}</Typography></Box></Stack><Typography color="text.secondary" sx={{ my: 2 }}>Share a rough thought or ask what you may be missing. The copilot suggests; you decide what belongs in the brief.</Typography><TextField autoFocus fullWidth multiline minRows={4} value={copilotPrompt} onChange={e => setCopilotPrompt(e.target.value)} placeholder="My idea is still rough, but…" />{copilotReply && <Box sx={{ mt: 2, p: 2.5, bgcolor: "rgba(108,99,255,.07)", borderLeft: "2px solid", borderColor: "primary.main", whiteSpace: "pre-wrap" }}><Typography>{copilotReply}</Typography></Box>}<Stack direction="row" sx={{ justifyContent: "flex-end", mt: 2 }}><Button variant="contained" onClick={() => void ask()} disabled={copilotBusy || !copilotPrompt.trim()}>{copilotBusy ? <CircularProgress size={20} /> : "Refine my thinking"}</Button></Stack></DialogContent></Dialog>
  </Box>;
}
