import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Avatar,
  Skeleton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useParams, useNavigate } from "react-router";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import DownloadIcon from "@mui/icons-material/Download";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PageBanner from "@/components/shared/PageBanner";
import AnimatedCard from "@/components/shared/AnimatedCard";
import { useAuth } from "@/context/AuthContext";

const statusColors: Record<string, "primary" | "warning" | "success" | "info"> = {
  in_development: "warning",
  lead: "info",
  under_review: "info",
  approved: "info",
  qa: "success",
  delivered: "success",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function severityColor(severity: string): "success" | "warning" | "error" | "default" {
  if (severity === "low") return "success";
  if (severity === "medium") return "warning";
  if (severity === "high" || severity === "critical") return "error";
  return "default";
}

const AUTHORITY_LABELS: Record<string, string> = {
  decision_maker: "Decision maker",
  influencer: "Influencer",
  contributor: "Contributor",
  informed: "Informed",
};

function authorityColor(authority: string): "primary" | "secondary" | "info" | "default" {
  if (authority === "decision_maker") return "primary";
  if (authority === "influencer") return "secondary";
  if (authority === "contributor") return "info";
  return "default";
}

const LATTICE_STATES: { status: string; label: string; color: string }[] = [
  { status: "delivered", label: "Delivered", color: "#10B981" },
  { status: "in_flight", label: "In flight", color: "#6C63FF" },
  { status: "queued", label: "Queued", color: "#F59E0B" },
  { status: "deferred", label: "Deferred", color: "#94A3B8" },
];

const REPORT_TYPE_LABELS: Record<string, string> = {
  quarterly_review: "Quarterly review",
  status_memo: "Status memo",
  board_pack: "Board pack",
  handover: "Handover",
  post_engagement: "Post-engagement",
  other: "Report",
};

// Only render external links that are http(s) — never javascript:/data: etc.
function safeHref(url?: string): string | null {
  return url && /^https?:\/\//i.test(url) ? url : null;
}

const AVAILABILITY_META: Record<string, { label: string; color: "success" | "info" | "warning" | "default" }> = {
  full_time: { label: "Full-time", color: "success" },
  part_time: { label: "Part-time", color: "info" },
  on_call: { label: "On-call", color: "warning" },
  unavailable: { label: "Unavailable", color: "default" },
};

const BUDGET_STATUS_LABELS: Record<string, string> = {
  planned: "Planned",
  in_progress: "In progress",
  invoiced: "Invoiced",
  paid: "Paid",
  overdue: "Overdue",
};

function fmtMoney(amount: number, currency: string): string {
  const n = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  } catch {
    return `${currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [risks, setRisks] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [stakeholders, setStakeholders] = useState<any[]>([]);
  const [lattice, setLattice] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [directory, setDirectory] = useState<any[]>([]);
  const [budget, setBudget] = useState<any[]>([]);
  const [error, setError] = useState(false);
  const [spec, setSpec] = useState<any | null>(null);
  const [specActing, setSpecActing] = useState(false);
  const [specError, setSpecError] = useState("");
  const [documents, setDocuments] = useState<any[]>([]);

  // Approval (sign-off) UI state
  const [activeApproval, setActiveApproval] = useState<any | null>(null);
  const [decisionComment, setDecisionComment] = useState("");
  const [deciding, setDeciding] = useState(false);

  const reloadApprovals = async () => {
    if (!id) return;
    try {
      const a = await api.listApprovals(id);
      setApprovals(a.items ?? []);
    } catch {
      /* leave empty */
    }
  };

  const decide = async (decision: string) => {
    if (!activeApproval) return;
    setDeciding(true);
    try {
      await api.decideApproval(activeApproval.id, decision, decisionComment.trim() || undefined);
      setActiveApproval(null);
      setDecisionComment("");
      await reloadApprovals();
    } catch {
      /* keep dialog open */
    } finally {
      setDeciding(false);
    }
  };

  const handleSpecDecision = async (action: "approve" | "reject") => {
    if (!spec?.id) return;
    setSpecActing(true);
    setSpecError("");
    try {
      const updated =
        action === "approve"
          ? await api.approveSpec(spec.id)
          : await api.rejectSpec(spec.id);
      setSpec({ ...spec, ...updated, status: (updated as any).status ?? (action === "approve" ? "approved" : "rejected") });
    } catch (err: any) {
      setSpecError(err?.message ?? `Failed to ${action} specification`);
    } finally {
      setSpecActing(false);
    }
  };

  // Support ticket UI state
  const [raiseOpen, setRaiseOpen] = useState(false);
  const [raiseForm, setRaiseForm] = useState({ subject: "", body: "", category: "question", priority: "normal" });
  const [raising, setRaising] = useState(false);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  const reloadTickets = async () => {
    if (!id) return;
    try {
      const t = await api.listProjectTickets(id);
      setTickets(t.items ?? []);
      return t.items ?? [];
    } catch {
      return [];
    }
  };

  const raiseTicket = async () => {
    if (!id || !raiseForm.subject.trim() || !raiseForm.body.trim()) return;
    setRaising(true);
    try {
      await api.createTicket({
        projectId: id,
        subject: raiseForm.subject.trim(),
        body: raiseForm.body.trim(),
        category: raiseForm.category,
        priority: raiseForm.priority,
      });
      setRaiseOpen(false);
      setRaiseForm({ subject: "", body: "", category: "question", priority: "normal" });
      await reloadTickets();
    } catch {
      /* surfaced via disabled/loading; keep dialog open */
    } finally {
      setRaising(false);
    }
  };

  const sendReply = async () => {
    if (!activeTicket || !replyText.trim()) return;
    setReplying(true);
    try {
      const updated = await api.replyTicket(activeTicket.id, replyText.trim());
      setActiveTicket(updated);
      setReplyText("");
      await reloadTickets();
    } catch {
      /* keep dialog open */
    } finally {
      setReplying(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      try {
        const data = await api.getProject(id!);
        if (cancelled) return;
        setProject(data);

        // Files API is the source of truth for uploads; fall back to project.attachments.
        try {
          const filesRes = await api.listFiles(id!);
          const files = Array.isArray(filesRes) ? filesRes : (filesRes.items ?? []);
          if (!cancelled) {
            setDocuments(
              files.length > 0
                ? files
                : (data.attachments ?? []),
            );
          }
        } catch {
          if (!cancelled) setDocuments(data.attachments ?? []);
        }

        // Resolve team from project payload (includes display profiles for clients)
        const embedded = data.assigned_team_members ?? [];
        if (embedded.length > 0) {
          if (!cancelled) {
            setTeamMembers(
              embedded.map((u: any) => ({
                id: u.id,
                name: `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || "Unknown",
                email: u.email ?? "",
                role: u.role?.replace(/_/g, " ") ?? "Member",
                avatar: u.avatar,
              })),
            );
          }
        } else {
          const teamIds: string[] = data.assigned_team ?? [];
          if (teamIds.length > 0) {
            const members = await Promise.all(
              teamIds.map(async (uid: string) => {
                try {
                  const u = await api.getUser(uid);
                  return {
                    id: u.id,
                    name: `${u.first_name} ${u.last_name}`,
                    email: u.email,
                    role: u.role?.replace(/_/g, " ") ?? "Member",
                    avatar: u.avatar,
                  } as TeamMember;
                } catch {
                  return { id: uid, name: "Unknown", email: "", role: "Member" } as TeamMember;
                }
              })
            );
            if (!cancelled) setTeamMembers(members);
          }
        }

        // Decision Log (sovereign-grade audit trail) — best-effort, never blocks the page.
        try {
          const dec = await api.listDecisions(id!);
          if (!cancelled) setDecisions(dec.items ?? []);
        } catch {
          /* no decisions / not accessible — leave empty */
        }

        // Risk Register — best-effort.
        try {
          const rk = await api.listRisks(id!);
          if (!cancelled) setRisks(rk.items ?? []);
        } catch {
          /* no risks / not accessible — leave empty */
        }

        // Support tickets — best-effort.
        try {
          const tk = await api.listProjectTickets(id!);
          if (!cancelled) setTickets(tk.items ?? []);
        } catch {
          /* no tickets / not accessible — leave empty */
        }

        // Approvals / sign-offs — best-effort.
        try {
          const ap = await api.listApprovals(id!);
          if (!cancelled) setApprovals(ap.items ?? []);
        } catch {
          /* no approvals / not accessible — leave empty */
        }

        // Project specification — best-effort.
        try {
          const sp = await api.getSpecByProject(id!);
          if (!cancelled) setSpec(sp);
        } catch {
          if (!cancelled) setSpec(null);
        }

        // Stakeholder map — best-effort.
        try {
          const sk = await api.listStakeholders(id!);
          if (!cancelled) setStakeholders(sk.items ?? []);
        } catch {
          /* no stakeholders / not accessible — leave empty */
        }

        // Capability lattice — best-effort.
        try {
          const lt = await api.listLattice(id!);
          if (!cancelled) setLattice(lt.items ?? []);
        } catch {
          /* no lattice / not accessible — leave empty */
        }

        // Reports library (published only, server-filtered) — best-effort.
        try {
          const rp = await api.listReports(id!);
          if (!cancelled) setReports(rp.items ?? []);
        } catch {
          /* no reports / not accessible — leave empty */
        }

        // Team directory — best-effort.
        try {
          const tm = await api.listTeam(id!);
          if (!cancelled) setDirectory(tm.items ?? []);
        } catch {
          /* no directory / not accessible — leave empty */
        }

        // Budget & milestones — best-effort.
        try {
          const bg = await api.listBudget(id!);
          if (!cancelled) setBudget(bg.items ?? []);
        } catch {
          /* no budget / not accessible — leave empty */
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [api, id]);

  if (loading) {
    return (
      <Box>
        <Box sx={{ px: 3, py: 1.5 }}>
          <Skeleton variant="text" width={150} />
        </Box>
        <Box sx={{ px: 3 }}>
          <Skeleton variant="text" width="40%" height={48} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="70%" sx={{ mb: 3 }} />
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2, mb: 3 }} />
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
        </Box>
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
          Project not found
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/projects")}>
          Back to Projects
        </Button>
      </Box>
    );
  }

  const milestones = project.milestones ?? [];
  const attachments = documents;
  const completedMilestones = milestones.filter(
    (m: any) => m.status === "completed" || m.completed_at
  ).length;

  return (
    <Box>
      <Box
        onClick={() => navigate("/projects")}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          px: 3,
          py: 1.5,
          cursor: "pointer",
          color: "text.secondary",
          "&:hover": { color: "primary.main" },
          transition: "color 0.2s",
        }}
      >
        <ArrowBackIcon sx={{ fontSize: 18 }} />
        <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.1em" }}>
          BACK TO PROJECTS
        </Typography>
      </Box>

      <PageBanner
        icon={<AssignmentIcon />}
        title={project.title}
        description={project.description}
        action={
          <Stack direction="row" spacing={1}>
            <Chip label={project.type?.replace(/_/g, " ") ?? "Project"} size="small" variant="outlined" />
            <Chip label={project.status?.replace(/_/g, " ") ?? "Unknown"} size="small" color={statusColors[project.status] ?? "primary"} />
          </Stack>
        }
      />

      <AnimatedCard delay={0} sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" sx={{ justifyContent: "space-between", mb: 1 }}>
            <Typography variant="subtitle2">Overall Progress</Typography>
            <Typography sx={{ fontWeight: 700 }} variant="subtitle2">
              {project.progress}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={project.progress}
            sx={{ height: 10, borderRadius: 5 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            {completedMilestones} of {milestones.length} milestones completed
          </Typography>
        </CardContent>
      </AnimatedCard>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Overview" />
          <Tab label="Milestones" />
          <Tab label="Documents" />
          <Tab label="Team" />
          <Tab label="Decisions" />
          <Tab label="Risks" />
          <Tab label="Support" />
          <Tab label="Approvals" />
          <Tab label="Stakeholders" />
          <Tab label="Capabilities" />
          <Tab label="Reports" />
          <Tab label="Directory" />
          <Tab label="Budget" />
        </Tabs>
      </Box>

      {tab === 0 && (
        <Stack spacing={2}>
          <AnimatedCard delay={1} sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Description
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {project.description}
              </Typography>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={2} sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Specification
              </Typography>
              {!spec ? (
                <Typography variant="body2" color="text.secondary">
                  No specification has been generated for this project yet.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                    <Chip
                      label={(spec.status ?? "draft").toString().replace(/_/g, " ")}
                      size="small"
                      color={
                        spec.status === "approved"
                          ? "success"
                          : spec.status === "rejected"
                            ? "error"
                            : "warning"
                      }
                    />
                    <Typography variant="caption" color="text.secondary">
                      v{spec.version ?? 1}
                    </Typography>
                  </Stack>
                  {spec.overview && (
                    <Typography variant="body2" color="text.secondary">
                      {spec.overview}
                    </Typography>
                  )}
                  {["generated", "under_review", "reviewed", "draft"].includes(
                    String(spec.status ?? "").toLowerCase(),
                  ) && (
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        disabled={specActing}
                        onClick={() => void handleSpecDecision("approve")}
                      >
                        {specActing ? <CircularProgress size={14} /> : "Approve Spec"}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        disabled={specActing}
                        onClick={() => void handleSpecDecision("reject")}
                      >
                        Reject Spec
                      </Button>
                    </Stack>
                  )}
                  {specError && (
                    <Typography variant="caption" color="error">
                      {specError}
                    </Typography>
                  )}
                </Stack>
              )}
            </CardContent>
          </AnimatedCard>
        </Stack>
      )}

      {tab === 1 && (
        <AnimatedCard delay={1} sx={{ p: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Milestones
            </Typography>
            {milestones.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No milestones defined yet.
              </Typography>
            ) : (
              <List>
                {milestones.map((milestone: any) => {
                  const isCompleted = milestone.status === "completed" || !!milestone.completed_at;
                  return (
                    <ListItem key={milestone.id ?? milestone.name}>
                      <ListItemIcon>
                        {isCompleted ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <RadioButtonUncheckedIcon color="disabled" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={milestone.name ?? milestone.title}
                        secondary={milestone.due_date ? formatDate(milestone.due_date) : undefined}
                        sx={{
                          textDecoration: isCompleted ? "line-through" : "none",
                          opacity: isCompleted ? 0.7 : 1,
                        }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </CardContent>
        </AnimatedCard>
      )}

      {tab === 2 && (
        <AnimatedCard delay={1} sx={{ p: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Documents
            </Typography>
            {attachments.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No documents uploaded yet.
              </Typography>
            ) : (
              <List>
                {attachments.map((doc: any) => (
                  <ListItem
                    key={doc.id ?? doc.file_name ?? doc.fileName ?? doc.filename}
                    secondaryAction={
                      (doc.file_url ?? doc.fileURL ?? doc.url) ? (
                        <Button size="small" startIcon={<DownloadIcon />} href={doc.file_url ?? doc.fileURL ?? doc.url} target="_blank">
                          Download
                        </Button>
                      ) : (
                        <Button size="small" startIcon={<DownloadIcon />} disabled>
                          Download
                        </Button>
                      )
                    }
                  >
                    <ListItemText
                      primary={doc.file_name ?? doc.fileName ?? doc.filename ?? doc.name}
                      secondary={
                        (doc.uploaded_at ?? doc.uploadedAt ?? doc.created_at ?? doc.createdAt)
                          ? formatDate(doc.uploaded_at ?? doc.uploadedAt ?? doc.created_at ?? doc.createdAt)
                          : undefined
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </AnimatedCard>
      )}

      {tab === 3 && (
        <AnimatedCard animDelay={0.1} sx={{ p: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Assigned Team
            </Typography>
            {teamMembers.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No team members assigned yet.
              </Typography>
            ) : (
              <Stack spacing={2}>
                {teamMembers.map((member) => {
                  const initials = member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  return (
                    <Stack sx={{ alignItems: "center" }} key={member.id} direction="row" spacing={2}>
                      <Avatar
                        src={member.avatar}
                        sx={{ width: 40, height: 40, fontSize: 14, fontWeight: 700, bgcolor: "primary.dark" }}
                      >
                        {initials}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {member.name}
                        </Typography>
                        <Stack sx={{ alignItems: "center" }} direction="row" spacing={1}>
                          <Chip
                            label={member.role}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: "0.65rem", height: 20, textTransform: "capitalize" }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {member.email}
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                  );
                })}
              </Stack>
            )}
          </CardContent>
        </AnimatedCard>
      )}

      {tab === 4 && (
        <AnimatedCard delay={1} sx={{ p: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              Decision Log
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Every material decision in this engagement — time-stamped, with rationale and alternatives. Your sovereign audit trail.
            </Typography>
            {decisions.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No decisions logged yet.
              </Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Decision</TableCell>
                    <TableCell>Rationale</TableCell>
                    <TableCell>Decided by</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {decisions.map((d: any) => (
                    <TableRow key={d.id} hover>
                      <TableCell sx={{ whiteSpace: "nowrap", fontFamily: "monospace", fontSize: "0.72rem", color: "text.secondary" }}>
                        {d.decidedAt ? formatDate(d.decidedAt) : "—"}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, minWidth: 160 }}>
                        {d.title}
                        {Array.isArray(d.alternatives) && d.alternatives.length > 0 && (
                          <Typography component="span" sx={{ display: "block", fontSize: "0.68rem", color: "text.secondary", opacity: 0.7 }}>
                            Alternatives: {d.alternatives.join(", ")}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 360, color: "text.secondary", fontSize: "0.82rem" }}>{d.rationale}</TableCell>
                      <TableCell sx={{ fontSize: "0.8rem" }}>{d.decisionMaker}</TableCell>
                      <TableCell>
                        <Chip label={(d.status ?? "accepted").replace(/_/g, " ")} size="small" variant="outlined" sx={{ textTransform: "capitalize", fontSize: "0.65rem" }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </AnimatedCard>
      )}

      {tab === 5 && (
        <AnimatedCard delay={1} sx={{ p: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              Risk Register
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Open risks, their owner, mitigation, residual rating after mitigation, and escalation status.
            </Typography>
            {risks.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No risks recorded yet.
              </Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Risk</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Mitigation</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Residual</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {risks.map((r: any) => (
                    <TableRow key={r.id} hover>
                      <TableCell sx={{ fontWeight: 600, minWidth: 160 }}>
                        {r.title}
                        {r.description && (
                          <Typography component="span" sx={{ display: "block", fontSize: "0.7rem", color: "text.secondary", opacity: 0.7 }}>
                            {r.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip label={r.severity} size="small" color={severityColor(r.severity)} sx={{ textTransform: "capitalize", fontSize: "0.65rem" }} />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 280, color: "text.secondary", fontSize: "0.82rem" }}>{r.mitigation || "—"}</TableCell>
                      <TableCell sx={{ fontSize: "0.8rem" }}>{r.owner || "—"}</TableCell>
                      <TableCell>
                        <Chip label={r.residualRating ?? r.severity} size="small" variant="outlined" color={severityColor(r.residualRating ?? r.severity)} sx={{ textTransform: "capitalize", fontSize: "0.65rem" }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={(r.status ?? "open").replace(/_/g, " ")} size="small" variant="outlined" sx={{ textTransform: "capitalize", fontSize: "0.65rem" }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </AnimatedCard>
      )}

      {tab === 6 && (
        <AnimatedCard delay={1} sx={{ p: 2 }}>
          <CardContent>
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="h6">Support</Typography>
              <Button variant="contained" size="small" onClick={() => setRaiseOpen(true)}>
                Raise a ticket
              </Button>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Raise issues, request changes, or ask questions. We respond within an SLA based on priority.
            </Typography>
            {tickets.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No tickets yet. Raise one and we'll get on it.
              </Typography>
            ) : (
              <List>
                {tickets.map((t: any) => (
                  <ListItem
                    key={t.id}
                    onClick={() => { setActiveTicket(t); setReplyText(""); }}
                    sx={{ cursor: "pointer", borderRadius: 1, "&:hover": { bgcolor: "rgba(108,99,255,0.06)" } }}
                    secondaryAction={
                      <Stack sx={{ alignItems: "center" }} direction="row" spacing={1}>
                        <Chip label={t.priority} size="small" variant="outlined" sx={{ textTransform: "capitalize", fontSize: "0.6rem" }} />
                        <Chip label={(t.status ?? "open").replace(/_/g, " ")} size="small" sx={{ textTransform: "capitalize", fontSize: "0.6rem" }} />
                      </Stack>
                    }
                  >
                    <ListItemText
                      primary={t.subject}
                      secondary={`${(t.replies?.length ?? 0)} repl${(t.replies?.length ?? 0) === 1 ? "y" : "ies"} · ${t.createdAt ? formatDate(t.createdAt) : ""}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </AnimatedCard>
      )}

      {tab === 7 && (
        <AnimatedCard delay={1} sx={{ p: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              Approvals
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Deliverables sent to you for sign-off. Approve, approve with conditions, or reject with comments.
            </Typography>
            {approvals.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nothing awaiting your sign-off.
              </Typography>
            ) : (
              <List>
                {approvals.map((a: any) => {
                  const pending = a.status === "pending";
                  return (
                    <ListItem
                      key={a.id}
                      secondaryAction={
                        pending ? (
                          <Button size="small" variant="contained" onClick={() => { setActiveApproval(a); setDecisionComment(""); }}>
                            Respond
                          </Button>
                        ) : (
                          <Chip label={(a.status ?? "").replace(/_/g, " ")} size="small" color={a.status === "rejected" ? "error" : "success"} sx={{ textTransform: "capitalize", fontSize: "0.65rem" }} />
                        )
                      }
                    >
                      <ListItemText slotProps={{ secondary: { component: "div" } }}
                        primary={a.title}
                        secondary={
                          <Box sx={{ mt: 0.25 }}>
                            {a.deliverableRef && <Box sx={{ fontSize: "0.78rem" }}>Deliverable: {a.deliverableRef}</Box>}
                            {!a.deliverableRef && a.description && <Box sx={{ fontSize: "0.78rem" }}>{a.description}</Box>}
                            {a.decisionComment && <Box sx={{ fontSize: "0.72rem", opacity: 0.8 }}>Note: {a.decisionComment}</Box>}
                          </Box>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </CardContent>
        </AnimatedCard>
      )}

      {tab === 8 && (
        <AnimatedCard delay={1} sx={{ p: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              Stakeholder Map
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Who is involved on both sides, who decides what, and who has been briefed.
            </Typography>
            {stakeholders.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No stakeholders recorded yet.
              </Typography>
            ) : (
              <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
                {([
                  { side: "client", label: "Client side" },
                  { side: "firm", label: "NeuroDyne side" },
                ] as const).map(({ side, label }) => {
                  const group = stakeholders.filter((s: any) => s.side === side);
                  return (
                    <Box key={side}>
                      <Typography variant="subtitle2" sx={{ mb: 1, textTransform: "uppercase", letterSpacing: 0.5, color: "text.secondary" }}>
                        {label} ({group.length})
                      </Typography>
                      {group.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                          None recorded.
                        </Typography>
                      ) : (
                        <List dense disablePadding>
                          {group.map((s: any) => (
                            <ListItem key={s.id} sx={{ alignItems: "flex-start", px: 0, borderBottom: 1, borderColor: "divider" }}>
                              <ListItemText slotProps={{ secondary: { component: "div" } }}
                                primary={
                                  <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                                    <span>{s.name}</span>
                                    <Chip
                                      label={AUTHORITY_LABELS[s.authority] ?? s.authority}
                                      size="small"
                                      color={authorityColor(s.authority)}
                                      sx={{ fontSize: "0.65rem" }}
                                    />
                                    <Chip
                                      label={s.briefed ? "Briefed" : "Not briefed"}
                                      size="small"
                                      variant="outlined"
                                      color={s.briefed ? "success" : "default"}
                                      sx={{ fontSize: "0.65rem" }}
                                    />
                                  </Box>
                                }
                                secondary={
                                  <Box sx={{ mt: 0.25 }}>
                                    <Box sx={{ fontSize: "0.78rem" }}>{s.role}</Box>
                                    {s.notes && <Box sx={{ fontSize: "0.72rem", opacity: 0.8, whiteSpace: "pre-wrap" }}>{s.notes}</Box>}
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}
          </CardContent>
        </AnimatedCard>
      )}

      {tab === 9 && (
        <AnimatedCard delay={1} sx={{ p: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              Capability Lattice
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Where each capability sits in delivery — delivered, in flight, queued, or deferred.
            </Typography>
            {lattice.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No capabilities tracked yet.
              </Typography>
            ) : (
              <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" } }}>
                {LATTICE_STATES.map(({ status, label, color }) => {
                  const group = lattice.filter((l: any) => l.status === status);
                  return (
                    <Box key={status} sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 1.5, borderTop: 3, borderTopColor: color }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.7rem", color }}>
                        {label} ({group.length})
                      </Typography>
                      {group.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", fontSize: "0.78rem" }}>
                          None.
                        </Typography>
                      ) : (
                        <Stack spacing={1}>
                          {group.map((l: any) => (
                            <Box key={l.id} sx={{ p: 1, borderRadius: 1, bgcolor: "action.hover" }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.82rem" }}>{l.capability}</Typography>
                              <Chip label={l.category} size="small" variant="outlined" sx={{ mt: 0.5, fontSize: "0.62rem" }} />
                              {l.description && <Box sx={{ fontSize: "0.72rem", opacity: 0.8, mt: 0.5, whiteSpace: "pre-wrap" }}>{l.description}</Box>}
                              {(l.owner || l.targetDate) && (
                                <Box sx={{ fontSize: "0.66rem", opacity: 0.6, mt: 0.5 }}>
                                  {l.owner ? `Owner: ${l.owner}` : ""}{l.owner && l.targetDate ? " · " : ""}{l.targetDate ? `Target: ${String(l.targetDate).slice(0, 10)}` : ""}
                                </Box>
                              )}
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}
          </CardContent>
        </AnimatedCard>
      )}

      {tab === 10 && (
        <AnimatedCard delay={1} sx={{ p: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              Reports Library
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Quarterly reviews, status memos, board packs, handover and post-engagement reports.
            </Typography>
            {reports.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No reports published yet.
              </Typography>
            ) : (
              <List>
                {reports.map((r: any) => (
                  <ListItem
                    key={r.id}
                    secondaryAction={
                      safeHref(r.url) ? (
                        <Button size="small" variant="outlined" component="a" href={safeHref(r.url)!} target="_blank" rel="noopener noreferrer">
                          Open
                        </Button>
                      ) : null
                    }
                  >
                    <ListItemText slotProps={{ secondary: { component: "div" } }}
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                          <span>{r.title}</span>
                          <Chip label={REPORT_TYPE_LABELS[r.type] ?? r.type} size="small" color="primary" variant="outlined" sx={{ fontSize: "0.65rem" }} />
                          {r.period && <Chip label={r.period} size="small" variant="outlined" sx={{ fontSize: "0.65rem" }} />}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.25 }}>
                          {r.summary && <Box sx={{ fontSize: "0.78rem", whiteSpace: "pre-wrap" }}>{r.summary}</Box>}
                          {r.publishedAt && <Box sx={{ fontSize: "0.7rem", opacity: 0.6 }}>Published {String(r.publishedAt).slice(0, 10)}</Box>}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </AnimatedCard>
      )}

      {tab === 11 && (
        <AnimatedCard delay={1} sx={{ p: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              Team Directory
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              The NeuroDyne team on your engagement — their role, focus, availability, and how to reach them.
            </Typography>
            {directory.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No team members listed yet.
              </Typography>
            ) : (
              <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
                {directory.map((m: any) => {
                  const av = AVAILABILITY_META[m.availability] ?? { label: m.availability, color: "default" as const };
                  return (
                    <Box key={m.id} sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 1.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{m.name}</Typography>
                        <Chip label={av.label} size="small" color={av.color} variant="outlined" sx={{ fontSize: "0.62rem" }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary">{m.role}</Typography>
                      {m.focus && <Box sx={{ fontSize: "0.74rem", opacity: 0.85, mt: 0.5 }}>Focus: {m.focus}</Box>}
                      {m.bio && <Box sx={{ fontSize: "0.72rem", opacity: 0.8, mt: 0.5, whiteSpace: "pre-wrap" }}>{m.bio}</Box>}
                      {m.email && (
                        <Typography component="a" href={`mailto:${m.email}`} sx={{ fontSize: "0.72rem", color: "primary.main", mt: 0.5, display: "inline-block", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                          {m.email}
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}
          </CardContent>
        </AnimatedCard>
      )}

      {tab === 12 && (
        <AnimatedCard delay={1} sx={{ p: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              Budget &amp; Milestones
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Burn vs budget, milestones invoiced and outstanding, and your forward forecast — reported per currency.
            </Typography>
            {budget.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No budget lines tracked yet.
              </Typography>
            ) : (
              (() => {
                // Aggregate per currency — never mix currencies in a single total.
                const byCurrency: Record<string, { budget: number; invoiced: number; paid: number }> = {};
                for (const b of budget) {
                  const c = b.currency || "USD";
                  const acc = byCurrency[c] ?? (byCurrency[c] = { budget: 0, invoiced: 0, paid: 0 });
                  acc.budget += Number(b.budgetAmount) || 0;
                  acc.invoiced += Number(b.invoicedAmount) || 0;
                  acc.paid += Number(b.paidAmount) || 0;
                }
                return (
                  <>
                    <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, mb: 3 }}>
                      {Object.entries(byCurrency).map(([currency, t]) => {
                        const burn = t.budget > 0 ? Math.min(100, Math.round((t.invoiced / t.budget) * 100)) : 0;
                        const outstanding = Math.max(0, t.invoiced - t.paid);
                        const remaining = t.budget - t.invoiced;
                        return (
                          <Box key={currency} sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, letterSpacing: 0.5 }}>{currency} exposure</Typography>
                            <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", mb: 0.5 }}>
                              <span>Budget</span><strong>{fmtMoney(t.budget, currency)}</strong>
                            </Box>
                            <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", mb: 0.5 }}>
                              <span>Invoiced</span><strong>{fmtMoney(t.invoiced, currency)}</strong>
                            </Box>
                            <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", mb: 0.5 }}>
                              <span>Paid</span><strong>{fmtMoney(t.paid, currency)}</strong>
                            </Box>
                            <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", mb: 0.5 }}>
                              <span>Outstanding</span><strong>{fmtMoney(outstanding, currency)}</strong>
                            </Box>
                            <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", mb: 1, color: remaining < 0 ? "error.main" : "text.primary" }}>
                              <span>Remaining (forecast)</span><strong>{fmtMoney(remaining, currency)}</strong>
                            </Box>
                            <LinearProgress variant="determinate" value={burn} sx={{ height: 8, borderRadius: 4 }} color={burn >= 100 ? "error" : burn >= 80 ? "warning" : "primary"} />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                              {burn}% of budget invoiced
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Line</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Budget</TableCell>
                          <TableCell align="right">Invoiced</TableCell>
                          <TableCell align="right">Outstanding</TableCell>
                          <TableCell>Due</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {budget.map((b: any) => {
                          const outstanding = Math.max(0, (Number(b.invoicedAmount) || 0) - (Number(b.paidAmount) || 0));
                          return (
                            <TableRow key={b.id}>
                              <TableCell>{b.label}</TableCell>
                              <TableCell>
                                <Chip label={BUDGET_STATUS_LABELS[b.status] ?? b.status} size="small" variant="outlined" sx={{ fontSize: "0.62rem" }} />
                              </TableCell>
                              <TableCell align="right">{fmtMoney(Number(b.budgetAmount) || 0, b.currency)}</TableCell>
                              <TableCell align="right">{fmtMoney(Number(b.invoicedAmount) || 0, b.currency)}</TableCell>
                              <TableCell align="right">{fmtMoney(outstanding, b.currency)}</TableCell>
                              <TableCell>{b.dueDate ? String(b.dueDate).slice(0, 10) : "—"}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </>
                );
              })()
            )}
          </CardContent>
        </AnimatedCard>
      )}

      {/* Sign-off decision dialog */}
      <Dialog open={!!activeApproval} onClose={() => setActiveApproval(null)} fullWidth maxWidth="sm">
        {activeApproval && (
          <>
            <DialogTitle sx={{ pb: 0.5 }}>{activeApproval.title}</DialogTitle>
            <DialogContent dividers>
              {activeApproval.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, whiteSpace: "pre-wrap" }}>{activeApproval.description}</Typography>
              )}
              {activeApproval.deliverableRef && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Deliverable:</strong> {activeApproval.deliverableRef}
                </Typography>
              )}
              <Divider sx={{ mb: 2 }} />
              <TextField slotProps={{ htmlInput: { maxLength: 8000 } }}
                label="Comments / conditions (optional, required if rejecting)"
                value={decisionComment}
                onChange={(e) => setDecisionComment(e.target.value)}
                fullWidth
                multiline
                minRows={2}
              />
            </DialogContent>
            <DialogActions sx={{ flexWrap: "wrap", gap: 1, p: 2 }}>
              <Button onClick={() => setActiveApproval(null)} sx={{ mr: "auto" }}>Cancel</Button>
              <Button color="error" variant="outlined" disabled={deciding || !decisionComment.trim()} onClick={() => decide("rejected")}>
                Reject
              </Button>
              <Button color="warning" variant="outlined" disabled={deciding || !decisionComment.trim()} onClick={() => decide("approved_with_conditions")}>
                Approve w/ conditions
              </Button>
              <Button color="success" variant="contained" disabled={deciding} onClick={() => decide("approved")}>
                {deciding ? "…" : "Approve"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Raise-a-ticket dialog */}
      <Dialog open={raiseOpen} onClose={() => setRaiseOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Raise a ticket</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField slotProps={{ htmlInput: { maxLength: 300 } }} label="Subject" value={raiseForm.subject} onChange={(e) => setRaiseForm({ ...raiseForm, subject: e.target.value })} fullWidth />
            <TextField slotProps={{ htmlInput: { maxLength: 8000 } }} label="Describe it" value={raiseForm.body} onChange={(e) => setRaiseForm({ ...raiseForm, body: e.target.value })} fullWidth multiline minRows={4} />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField select label="Category" value={raiseForm.category} onChange={(e) => setRaiseForm({ ...raiseForm, category: e.target.value })} fullWidth>
                {["question", "issue", "change_request", "other"].map((c) => <MenuItem key={c} value={c} sx={{ textTransform: "capitalize" }}>{c.replace(/_/g, " ")}</MenuItem>)}
              </TextField>
              <TextField select label="Priority" value={raiseForm.priority} onChange={(e) => setRaiseForm({ ...raiseForm, priority: e.target.value })} fullWidth>
                {["low", "normal", "high", "urgent"].map((p) => <MenuItem key={p} value={p} sx={{ textTransform: "capitalize" }}>{p}</MenuItem>)}
              </TextField>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRaiseOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={raiseTicket} disabled={raising || !raiseForm.subject.trim() || !raiseForm.body.trim()}>
            {raising ? "Submitting…" : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Ticket thread dialog */}
      <Dialog open={!!activeTicket} onClose={() => setActiveTicket(null)} fullWidth maxWidth="sm">
        {activeTicket && (
          <>
            <DialogTitle sx={{ pb: 0.5 }}>
              {activeTicket.subject}
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip label={activeTicket.priority} size="small" variant="outlined" sx={{ textTransform: "capitalize", fontSize: "0.6rem" }} />
                <Chip label={(activeTicket.status ?? "open").replace(/_/g, " ")} size="small" sx={{ textTransform: "capitalize", fontSize: "0.6rem" }} />
              </Stack>
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="body2" sx={{ mb: 2, whiteSpace: "pre-wrap" }}>{activeTicket.body}</Typography>
              <Divider sx={{ mb: 2 }} />
              {(activeTicket.replies ?? []).length === 0 ? (
                <Typography variant="body2" color="text.secondary">No replies yet.</Typography>
              ) : (
                <Stack spacing={1.5}>
                  {(activeTicket.replies ?? []).map((rep: any) => (
                    <Box key={rep.id} sx={{ p: 1.25, borderRadius: 1.5, bgcolor: rep.staff ? "rgba(0,212,170,0.08)" : "rgba(108,99,255,0.06)", border: "1px solid", borderColor: rep.staff ? "rgba(0,212,170,0.25)" : "rgba(108,99,255,0.15)" }}>
                      <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.08em", color: rep.staff ? "#00D4AA" : "text.secondary", textTransform: "uppercase", mb: 0.5 }}>
                        {rep.staff ? "NeuroDyne" : "You"}{rep.createdAt ? ` · ${formatDate(rep.createdAt)}` : ""}
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{rep.body}</Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </DialogContent>
            <DialogActions sx={{ flexDirection: "column", alignItems: "stretch", gap: 1, p: 2 }}>
              <TextField slotProps={{ htmlInput: { maxLength: 8000 } }} placeholder="Write a reply…" value={replyText} onChange={(e) => setReplyText(e.target.value)} fullWidth multiline minRows={2} size="small" />
              <Stack sx={{ justifyContent: "flex-end" }} direction="row" spacing={1}>
                <Button onClick={() => setActiveTicket(null)}>Close</Button>
                <Button variant="contained" onClick={sendReply} disabled={replying || !replyText.trim()} startIcon={replying ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : undefined}>
                  {replying ? "Sending…" : "Reply"}
                </Button>
              </Stack>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
