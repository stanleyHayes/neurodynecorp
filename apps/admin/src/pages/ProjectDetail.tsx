import { useState, useEffect, useCallback } from "react";
import { Box, Typography, Chip, Avatar, AvatarGroup, Stack, Skeleton, Alert, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Snackbar } from "@mui/material";
import { useParams, useNavigate } from "react-router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import PageBanner from "@/components/shared/PageBanner";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";
import PageSkeleton from "@/components/shared/PageSkeleton";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import { useAuth } from "@/context/AuthContext";

interface ApiProject {
  id: string;
  client_id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  features: unknown[];
  progress: number;
  assigned_team: string[];
  specification_id?: string;
  created_at: string;
  updated_at: string;
}

interface ApiUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  company?: string;
  is_active: boolean;
}

interface ApiSpec {
  id: string;
  project_id: string;
  version: number;
  status: string;
  overview: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  "In Progress": "#F59E0B",
  in_progress: "#F59E0B",
  active: "#F59E0B",
  Completed: "#10B981",
  completed: "#10B981",
  "On Hold": "#EF4444",
  on_hold: "#EF4444",
  Planning: "#94A3B8",
  planning: "#94A3B8",
  draft: "#94A3B8",
  Review: "#8B5CF6",
  review: "#8B5CF6",
};

const specStatusColors: Record<string, string> = {
  Draft: "#94A3B8",
  draft: "#94A3B8",
  Generated: "#6C63FF",
  generated: "#6C63FF",
  "Under Review": "#F59E0B",
  under_review: "#F59E0B",
  Approved: "#10B981",
  approved: "#10B981",
  Rejected: "#EF4444",
  rejected: "#EF4444",
};

const AVATAR_COLORS = ["#6C63FF", "#00D4AA", "#8B85FF", "#F59E0B", "#EF4444", "#10B981", "#8B5CF6"];

const STK_AUTHORITY_LABELS: Record<string, string> = {
  decision_maker: "Decision maker",
  influencer: "Influencer",
  contributor: "Contributor",
  informed: "Informed",
};

const LATTICE_STATUS_META: Record<string, { label: string; color: string }> = {
  delivered: { label: "Delivered", color: "#10B981" },
  in_flight: { label: "In flight", color: "#6C63FF" },
  queued: { label: "Queued", color: "#F59E0B" },
  deferred: { label: "Deferred", color: "#94A3B8" },
};

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

const AVAILABILITY_META: Record<string, { label: string; color: string }> = {
  full_time: { label: "Full-time", color: "#10B981" },
  part_time: { label: "Part-time", color: "#6C63FF" },
  on_call: { label: "On-call", color: "#F59E0B" },
  unavailable: { label: "Unavailable", color: "#94A3B8" },
};

const BUDGET_CATEGORY_LABELS: Record<string, string> = {
  milestone: "Milestone",
  workstream: "Workstream",
  retainer: "Retainer",
  expense: "Expense",
};

const BUDGET_STATUS_META: Record<string, { label: string; color: string }> = {
  planned: { label: "Planned", color: "#94A3B8" },
  in_progress: { label: "In progress", color: "#6C63FF" },
  invoiced: { label: "Invoiced", color: "#F59E0B" },
  paid: { label: "Paid", color: "#10B981" },
  overdue: { label: "Overdue", color: "#EF4444" },
};

function fmtMoney(amount: number, currency: string): string {
  const n = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  } catch {
    return `${currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

function formatStatus(status: string): string {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  const [project, setProject] = useState<ApiProject | null>(null);
  const [client, setClient] = useState<ApiUser | null>(null);
  const [specs, setSpecs] = useState<ApiSpec[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Decision Log state
  const [decisions, setDecisions] = useState<any[]>([]);
  const [dlgOpen, setDlgOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const emptyForm = { title: "", rationale: "", alternatives: "", decisionMaker: "", status: "accepted", decidedAt: "" };
  const [form, setForm] = useState(emptyForm);

  const loadDecisions = useCallback(async () => {
    if (!id) return;
    try {
      const r = await api.listDecisions(id);
      setDecisions(r.items ?? []);
    } catch {
      setDecisions([]);
    }
  }, [api, id]);

  const saveDecision = async () => {
    if (!id || !form.title.trim() || !form.rationale.trim() || !form.decisionMaker.trim()) return;
    setSaving(true);
    try {
      await api.createDecision({
        projectId: id,
        title: form.title.trim(),
        rationale: form.rationale.trim(),
        alternatives: form.alternatives.split(",").map((s) => s.trim()).filter(Boolean),
        decisionMaker: form.decisionMaker.trim(),
        status: form.status,
        decidedAt: form.decidedAt || undefined,
      });
      setDlgOpen(false);
      setForm(emptyForm);
      setToast("Decision logged");
      await loadDecisions();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Failed to log decision");
    } finally {
      setSaving(false);
    }
  };

  const removeDecision = async (decisionId: string) => {
    try {
      await api.deleteDecision(decisionId);
      setToast("Decision removed");
      await loadDecisions();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Failed to remove decision");
    }
  };

  // Risk Register state
  const [risks, setRisks] = useState<any[]>([]);
  const [riskDlg, setRiskDlg] = useState(false);
  const [riskSaving, setRiskSaving] = useState(false);
  const emptyRisk = { title: "", description: "", owner: "", severity: "medium", mitigation: "", residualRating: "medium", escalation: "", status: "open" };
  const [riskForm, setRiskForm] = useState(emptyRisk);

  const loadRisks = useCallback(async () => {
    if (!id) return;
    try {
      const r = await api.listRisks(id);
      setRisks(r.items ?? []);
    } catch {
      setRisks([]);
    }
  }, [api, id]);

  const saveRisk = async () => {
    if (!id || !riskForm.title.trim() || !riskForm.description.trim() || !riskForm.owner.trim()) return;
    setRiskSaving(true);
    try {
      await api.createRisk({
        projectId: id,
        title: riskForm.title.trim(),
        description: riskForm.description.trim(),
        owner: riskForm.owner.trim(),
        severity: riskForm.severity,
        mitigation: riskForm.mitigation.trim(),
        residualRating: riskForm.residualRating,
        escalation: riskForm.escalation.trim(),
        status: riskForm.status,
      });
      setRiskDlg(false);
      setRiskForm(emptyRisk);
      setToast("Risk registered");
      await loadRisks();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Failed to register risk");
    } finally {
      setRiskSaving(false);
    }
  };

  const removeRisk = async (riskId: string) => {
    try {
      await api.deleteRisk(riskId);
      setToast("Risk removed");
      await loadRisks();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Failed to remove risk");
    }
  };

  // Approval (sign-off) state
  const [approvals, setApprovals] = useState<any[]>([]);
  const [signoffDlg, setSignoffDlg] = useState(false);
  const [signoffSaving, setSignoffSaving] = useState(false);
  const emptySignoff = { title: "", description: "", deliverableRef: "" };
  const [signoffForm, setSignoffForm] = useState(emptySignoff);

  const loadApprovals = useCallback(async () => {
    if (!id) return;
    try {
      const r = await api.listApprovals(id);
      setApprovals(r.items ?? []);
    } catch {
      setApprovals([]);
    }
  }, [api, id]);

  const requestSignoff = async () => {
    if (!id || !signoffForm.title.trim()) return;
    setSignoffSaving(true);
    try {
      await api.createApproval({
        projectId: id,
        title: signoffForm.title.trim(),
        description: signoffForm.description.trim() || undefined,
        deliverableRef: signoffForm.deliverableRef.trim() || undefined,
      });
      setSignoffDlg(false);
      setSignoffForm(emptySignoff);
      setToast("Sign-off requested");
      await loadApprovals();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Failed to request sign-off");
    } finally {
      setSignoffSaving(false);
    }
  };

  const withdrawApproval = async (approvalId: string) => {
    try {
      await api.deleteApproval(approvalId);
      setToast("Sign-off withdrawn");
      await loadApprovals();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Failed to withdraw");
    }
  };

  // Stakeholder Map state
  const [stakeholders, setStakeholders] = useState<any[]>([]);
  const [stkDlg, setStkDlg] = useState(false);
  const [stkSaving, setStkSaving] = useState(false);
  const emptyStakeholder = { name: "", role: "", side: "client", authority: "informed", briefed: false, email: "", notes: "" };
  const [stkForm, setStkForm] = useState(emptyStakeholder);

  const loadStakeholders = useCallback(async () => {
    if (!id) return;
    try {
      const r = await api.listStakeholders(id);
      setStakeholders(r.items ?? []);
    } catch {
      setStakeholders([]);
    }
  }, [api, id]);

  const saveStakeholder = async () => {
    if (!id || !stkForm.name.trim() || !stkForm.role.trim()) return;
    setStkSaving(true);
    try {
      await api.createStakeholder({
        projectId: id,
        name: stkForm.name.trim(),
        role: stkForm.role.trim(),
        side: stkForm.side as "client" | "firm",
        authority: stkForm.authority as "decision_maker" | "influencer" | "contributor" | "informed",
        briefed: stkForm.briefed,
        email: stkForm.email.trim() || undefined,
        notes: stkForm.notes.trim() || undefined,
      });
      setStkDlg(false);
      setStkForm(emptyStakeholder);
      setToast("Stakeholder added");
      await loadStakeholders();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Failed to add stakeholder");
    } finally {
      setStkSaving(false);
    }
  };

  const removeStakeholder = async (stakeholderId: string) => {
    try {
      await api.deleteStakeholder(stakeholderId);
      setToast("Stakeholder removed");
      await loadStakeholders();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Failed to remove stakeholder");
    }
  };

  // Capability Lattice state
  const [lattice, setLattice] = useState<any[]>([]);
  const [latDlg, setLatDlg] = useState(false);
  const [latSaving, setLatSaving] = useState(false);
  const emptyLattice = { capability: "", category: "", status: "queued", description: "", owner: "", targetDate: "" };
  const [latForm, setLatForm] = useState(emptyLattice);

  const loadLattice = useCallback(async () => {
    if (!id) return;
    try {
      const r = await api.listLattice(id);
      setLattice(r.items ?? []);
    } catch {
      setLattice([]);
    }
  }, [api, id]);

  const saveLatticeItem = async () => {
    if (!id || !latForm.capability.trim() || !latForm.category.trim()) return;
    setLatSaving(true);
    try {
      await api.createLatticeItem({
        projectId: id,
        capability: latForm.capability.trim(),
        category: latForm.category.trim(),
        status: latForm.status as "delivered" | "in_flight" | "queued" | "deferred",
        description: latForm.description.trim() || undefined,
        owner: latForm.owner.trim() || undefined,
        targetDate: latForm.targetDate || undefined,
      });
      setLatDlg(false);
      setLatForm(emptyLattice);
      setToast("Capability added");
      await loadLattice();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Failed to add capability");
    } finally {
      setLatSaving(false);
    }
  };

  const removeLatticeItem = async (itemId: string) => {
    try {
      await api.deleteLatticeItem(itemId);
      setToast("Capability removed");
      await loadLattice();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Failed to remove capability");
    }
  };

  // Reports Library state
  const [reports, setReports] = useState<any[]>([]);
  const [repDlg, setRepDlg] = useState(false);
  const [repSaving, setRepSaving] = useState(false);
  const emptyReport = { title: "", type: "status_memo", period: "", summary: "", url: "", status: "draft" };
  const [repForm, setRepForm] = useState(emptyReport);

  const loadReports = useCallback(async () => {
    if (!id) return;
    try {
      const r = await api.listReports(id);
      setReports(r.items ?? []);
    } catch {
      setReports([]);
    }
  }, [api, id]);

  const saveReport = async () => {
    if (!id || !repForm.title.trim()) return;
    setRepSaving(true);
    try {
      await api.createReport({
        projectId: id,
        title: repForm.title.trim(),
        type: repForm.type as "quarterly_review" | "status_memo" | "board_pack" | "handover" | "post_engagement" | "other",
        period: repForm.period.trim() || undefined,
        summary: repForm.summary.trim() || undefined,
        url: repForm.url.trim() || undefined,
        status: repForm.status as "draft" | "published",
      });
      setRepDlg(false);
      setRepForm(emptyReport);
      setToast(repForm.status === "published" ? "Report published" : "Report saved as draft");
      await loadReports();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Failed to save report");
    } finally {
      setRepSaving(false);
    }
  };

  const publishReport = async (reportId: string) => {
    try {
      await api.updateReport(reportId, { status: "published" });
      setToast("Report published");
      await loadReports();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Failed to publish report");
    }
  };

  const unpublishReport = async (reportId: string) => {
    try {
      await api.updateReport(reportId, { status: "draft" });
      setToast("Report unpublished");
      await loadReports();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Failed to unpublish report");
    }
  };

  const removeReport = async (reportId: string) => {
    try {
      await api.deleteReport(reportId);
      setToast("Report removed");
      await loadReports();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Failed to remove report");
    }
  };

  // Team Directory state
  const [directory, setDirectory] = useState<any[]>([]);
  const [memDlg, setMemDlg] = useState(false);
  const [memSaving, setMemSaving] = useState(false);
  const emptyMember = { name: "", role: "", email: "", availability: "full_time", focus: "", bio: "" };
  const [memForm, setMemForm] = useState(emptyMember);

  const loadDirectory = useCallback(async () => {
    if (!id) return;
    try {
      const r = await api.listTeam(id);
      setDirectory(r.items ?? []);
    } catch {
      setDirectory([]);
    }
  }, [api, id]);

  const saveMember = async () => {
    if (!id || !memForm.name.trim() || !memForm.role.trim()) return;
    setMemSaving(true);
    try {
      await api.createTeamMember({
        projectId: id,
        name: memForm.name.trim(),
        role: memForm.role.trim(),
        email: memForm.email.trim() || undefined,
        availability: memForm.availability as "full_time" | "part_time" | "on_call" | "unavailable",
        focus: memForm.focus.trim() || undefined,
        bio: memForm.bio.trim() || undefined,
      });
      setMemDlg(false);
      setMemForm(emptyMember);
      setToast("Team member added");
      await loadDirectory();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Failed to add team member");
    } finally {
      setMemSaving(false);
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      await api.deleteTeamMember(memberId);
      setToast("Team member removed");
      await loadDirectory();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Failed to remove team member");
    }
  };

  // Budget & Milestone state
  const [budget, setBudget] = useState<any[]>([]);
  const [budDlg, setBudDlg] = useState(false);
  const [budSaving, setBudSaving] = useState(false);
  const emptyBudget = { label: "", category: "milestone", currency: "USD", budgetAmount: "", invoicedAmount: "", paidAmount: "", status: "planned", dueDate: "", notes: "" };
  const [budForm, setBudForm] = useState(emptyBudget);

  const loadBudget = useCallback(async () => {
    if (!id) return;
    try {
      const r = await api.listBudget(id);
      setBudget(r.items ?? []);
    } catch {
      setBudget([]);
    }
  }, [api, id]);

  const saveBudgetItem = async () => {
    const budgetAmount = Number(budForm.budgetAmount);
    if (!id || !budForm.label.trim() || !Number.isFinite(budgetAmount) || budgetAmount < 0) return;
    const invoiced = budForm.invoicedAmount === "" ? undefined : Number(budForm.invoicedAmount);
    const paid = budForm.paidAmount === "" ? undefined : Number(budForm.paidAmount);
    // Mirror the server's nonnegative rule client-side for a clear message (HTML min:0 is only a hint).
    if ((invoiced != null && (!Number.isFinite(invoiced) || invoiced < 0)) || (paid != null && (!Number.isFinite(paid) || paid < 0))) {
      setToast("Invoiced and paid amounts cannot be negative");
      return;
    }
    setBudSaving(true);
    try {
      await api.createBudgetItem({
        projectId: id,
        label: budForm.label.trim(),
        category: budForm.category as "milestone" | "workstream" | "retainer" | "expense",
        currency: budForm.currency as "USD" | "GHS" | "EUR" | "GBP",
        budgetAmount,
        invoicedAmount: invoiced != null && Number.isFinite(invoiced) ? invoiced : undefined,
        paidAmount: paid != null && Number.isFinite(paid) ? paid : undefined,
        status: budForm.status as "planned" | "in_progress" | "invoiced" | "paid" | "overdue",
        dueDate: budForm.dueDate || undefined,
        notes: budForm.notes.trim() || undefined,
      });
      setBudDlg(false);
      setBudForm(emptyBudget);
      setToast("Budget line added");
      await loadBudget();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Failed to add budget line");
    } finally {
      setBudSaving(false);
    }
  };

  const removeBudgetItem = async (itemId: string) => {
    try {
      await api.deleteBudgetItem(itemId);
      setToast("Budget line removed");
      await loadBudget();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Failed to remove budget line");
    }
  };

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const projectData = (await api.getProject(id)) as unknown as ApiProject;
      setProject(projectData);

      // Fetch client and spec in parallel
      const promises: Promise<void>[] = [];

      if (projectData.client_id) {
        promises.push(
          api.getUser(projectData.client_id)
            .then((u: any) => setClient(u as unknown as ApiUser))
            .catch(() => setClient(null))
        );
      }

      if (projectData.specification_id) {
        promises.push(
          api.getSpec(projectData.specification_id)
            .then((s: any) => setSpecs([s as unknown as ApiSpec]))
            .catch(() => setSpecs([]))
        );
      }

      await Promise.all(promises);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [api, id]);

  useEffect(() => {
    fetchData();
    loadDecisions();
    loadRisks();
    loadApprovals();
    loadStakeholders();
    loadLattice();
    loadReports();
    loadDirectory();
    loadBudget();
  }, [fetchData, loadDecisions, loadRisks, loadApprovals, loadStakeholders, loadLattice, loadReports, loadDirectory, loadBudget]);

  if (loading) {
    return <PageSkeleton stats={4} rows={4} />;
  }

  if (error || !project) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Typography variant="h5" color="text.secondary">Project not found</Typography>
        )}
      </Box>
    );
  }

  const color = statusColors[project.status] ?? "#94A3B8";
  const displayStatus = formatStatus(project.status);
  const clientName = client ? `${client.first_name} ${client.last_name}` : project.client_id;
  const clientCompany = client?.company ?? "";
  const clientAvatarColor = AVATAR_COLORS[(clientName?.length ?? 0) % AVATAR_COLORS.length];
  const team = project.assigned_team ?? [];
  const teamInitials = team.map((t) => t.slice(0, 2).toUpperCase());

  const stats = [
    { label: "Progress", value: `${project.progress}%`, icon: <TrendingUpOutlinedIcon />, color },
    { label: "Type", value: project.type || "General", icon: <AttachMoneyOutlinedIcon />, color: "#10B981" },
    { label: "Team Size", value: String(team.length), icon: <GroupOutlinedIcon />, color: "#6C63FF" },
    { label: "Created", value: project.created_at?.slice(0, 10) ?? "—", icon: <CalendarTodayOutlinedIcon />, color: "#8B85FF" },
  ];

  return (
    <Box>
      <Box
        onClick={() => navigate("/projects")}
        sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 3, py: 1.5, cursor: "pointer", color: "text.secondary", "&:hover": { color: "#6C63FF" }, transition: "color 0.2s" }}
      >
        <ArrowBackIcon sx={{ fontSize: 18 }} />
        <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.7rem", letterSpacing: "0.1em" }}>BACK TO PROJECTS</Typography>
      </Box>

      <PageBanner
        icon={<FolderOutlinedIcon />}
        title={project.title}
        description={`${project.type} for ${clientName}`}
        tag={`PROJECT // ${(project.type || "GENERAL").toUpperCase()}`}
        accentWord={project.title.split(" ")[0]}
        iconColor={color}
        iconLabel={displayStatus.toUpperCase()}
      />

      {/* Stats */}
      <SectionLabel>Overview</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" } }}>
        {stats.map((stat, i) => (
          <Cell key={stat.label} color={stat.color} index={String(i).padStart(2, "0")} colInRow={i} totalCols={4} animDelay={i * 0.1} minH={120}>
            <Box sx={{ "& .MuiSvgIcon-root": { fontSize: 28 }, color: stat.color, filter: `drop-shadow(0 0 12px ${stat.color}40)`, mb: 1 }}>
              {stat.icon}
            </Box>
            <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "text.secondary", opacity: 0.6, mb: 0.5 }}>
              {stat.label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{stat.value}</Typography>
          </Cell>
        ))}
      </Box>

      {/* Progress bar */}
      <Cell color={color} index="04" animDelay={0.4}>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", color: "text.secondary", opacity: 0.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Progress
          </Typography>
          <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.8rem", color, fontWeight: 700 }}>
            {project.progress}%
          </Typography>
        </Stack>
        <Box sx={{ width: "100%", bgcolor: "rgba(108,99,255,0.08)", borderRadius: 1, height: 8 }}>
          <Skeleton variant="rectangular" width={`${project.progress}%`} height={8} sx={{ borderRadius: 1, bgcolor: color, "&::after": { display: "none" } }} animation={false} />
        </Box>
      </Cell>

      {/* Details grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "7fr 5fr" } }}>
        {/* Left column */}
        <Box>
          {/* Timeline */}
          <SectionLabel>Timeline</SectionLabel>
          <Cell color="#6C63FF" index="05" animDelay={0.5}>
            <Stack spacing={2}>
              <Box>
                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem", color: "text.secondary", opacity: 0.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>Created</Typography>
                <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>{project.created_at?.slice(0, 10) ?? "—"}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem", color: "text.secondary", opacity: 0.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>Updated</Typography>
                <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>{project.updated_at?.slice(0, 10) ?? "—"}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem", color: "text.secondary", opacity: 0.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>Status</Typography>
                <Chip label={displayStatus} size="small" sx={{ mt: 0.5, fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", bgcolor: `${color}18`, color, border: `1px solid ${color}30` }} />
              </Box>
            </Stack>
          </Cell>

          {/* Specifications */}
          <SectionLabel>Specifications</SectionLabel>
          {specs.length === 0 ? (
            <Cell color="#94A3B8" index="--">
              <Typography color="text.secondary" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.8rem", opacity: 0.5 }}>No specifications yet</Typography>
            </Cell>
          ) : (
            specs.map((spec, i) => {
              const sColor = specStatusColors[spec.status] ?? "#94A3B8";
              const sDisplayStatus = formatStatus(spec.status);
              return (
                <Cell key={spec.id} color={sColor} index={String(i + 6).padStart(2, "0")} animDelay={0.6 + i * 0.1}>
                  <Stack sx={{ justifyContent: "space-between", alignItems: "center" }} direction="row">
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{project.title}</Typography>
                      <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", color: "text.secondary", opacity: 0.6 }}>v{spec.version} &middot; {spec.created_at?.slice(0, 10) ?? ""}</Typography>
                    </Box>
                    <Chip label={sDisplayStatus} size="small" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", bgcolor: `${sColor}18`, color: sColor, border: `1px solid ${sColor}30` }} />
                  </Stack>
                </Cell>
              );
            })
          )}
        </Box>

        {/* Right column */}
        <Box>
          {/* Client info */}
          <SectionLabel>Client</SectionLabel>
          <Cell color={clientAvatarColor} index="C0" animDelay={0.5}>
            {client ? (
              <Stack
                spacing={2}
                sx={{ alignItems: "center", textAlign: "center", cursor: "pointer" }}
                onClick={() => navigate(`/clients/${client.id}`)}
              >
                <Avatar sx={{ width: 64, height: 64, fontSize: 22, fontWeight: 700, bgcolor: `${clientAvatarColor}20`, color: clientAvatarColor, border: `2px solid ${clientAvatarColor}30` }}>
                  {clientName.split(" ").map((n) => n[0]).join("")}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{clientName}</Typography>
                  <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.7rem", color: "text.secondary" }}>{clientCompany}</Typography>
                  <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", color: "text.secondary", opacity: 0.5 }}>{client.email}</Typography>
                </Box>
                <Chip label={client.is_active ? "Active" : "Inactive"} size="small" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", bgcolor: `${clientAvatarColor}18`, color: clientAvatarColor, border: `1px solid ${clientAvatarColor}30` }} />
              </Stack>
            ) : (
              <Typography color="text.secondary" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.8rem", opacity: 0.5 }}>Unknown client</Typography>
            )}
          </Cell>

          {/* Team */}
          <SectionLabel>Team</SectionLabel>
          <Cell color="#00D4AA" index="T0" animDelay={0.6}>
            <Stack spacing={1.5}>
              <AvatarGroup max={6} sx={{ justifyContent: "center", "& .MuiAvatar-root": { width: 36, height: 36, fontSize: 12, bgcolor: "rgba(108,99,255,0.2)", color: "#6C63FF" } }}>
                {teamInitials.map((t) => <Avatar key={t}>{t}</Avatar>)}
              </AvatarGroup>
              <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", color: "text.secondary", opacity: 0.6, textAlign: "center" }}>
                {team.length} member{team.length !== 1 ? "s" : ""} assigned
              </Typography>
            </Stack>
          </Cell>

          {/* Description */}
          {project.description && (
            <>
              <SectionLabel>Description</SectionLabel>
              <Cell color="#10B981" index="B0" animDelay={0.7}>
                <MarkdownRenderer content={project.description} color="#10B981" />
              </Cell>
            </>
          )}
        </Box>
      </Box>

      {/* Decision Log */}
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", px: 3, pt: 1 }}>
        <SectionLabel>Decision Log</SectionLabel>
        <Button size="small" variant="outlined" startIcon={<AddOutlinedIcon />} onClick={() => setDlgOpen(true)} sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", letterSpacing: "0.1em", borderColor: "#6C63FF40", color: "#6C63FF", "&:hover": { borderColor: "#6C63FF" } }}>
          Log a decision
        </Button>
      </Stack>
      {decisions.length === 0 ? (
        <Cell color="#94A3B8" index="--">
          <Typography color="text.secondary" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.8rem", opacity: 0.5 }}>No decisions logged yet</Typography>
        </Cell>
      ) : (
        decisions.map((d, i) => (
          <Cell key={d.id} color="#6C63FF" index={String(i + 1).padStart(2, "0")} animDelay={i * 0.05}>
            <Stack sx={{ justifyContent: "space-between", alignItems: "flex-start" }} direction="row" spacing={1}>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5, flexWrap: "wrap" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{d.title}</Typography>
                  <Chip label={d.status} size="small" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem", textTransform: "capitalize", bgcolor: "rgba(108,99,255,0.12)", color: "#8B85FF" }} />
                </Stack>
                <Typography variant="body2" color="text.secondary">{d.rationale}</Typography>
                {Array.isArray(d.alternatives) && d.alternatives.length > 0 && (
                  <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", color: "text.secondary", opacity: 0.6, mt: 0.5 }}>
                    Alternatives: {d.alternatives.join(", ")}
                  </Typography>
                )}
                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", color: "text.secondary", opacity: 0.5, mt: 0.5 }}>
                  {d.decisionMaker}{d.decidedAt ? ` · ${String(d.decidedAt).slice(0, 10)}` : ""}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => removeDecision(d.id)} sx={{ color: "#EF4444" }}>
                <DeleteOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Cell>
        ))
      )}

      {/* Risk Register */}
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", px: 3, pt: 1 }}>
        <SectionLabel>Risk Register</SectionLabel>
        <Button size="small" variant="outlined" startIcon={<AddOutlinedIcon />} onClick={() => setRiskDlg(true)} sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", letterSpacing: "0.1em", borderColor: "#F59E0B40", color: "#F59E0B", "&:hover": { borderColor: "#F59E0B" } }}>
          Register a risk
        </Button>
      </Stack>
      {risks.length === 0 ? (
        <Cell color="#94A3B8" index="--">
          <Typography color="text.secondary" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.8rem", opacity: 0.5 }}>No risks recorded yet</Typography>
        </Cell>
      ) : (
        risks.map((r, i) => {
          const sevColor = r.severity === "low" ? "#10B981" : r.severity === "medium" ? "#F59E0B" : "#EF4444";
          return (
            <Cell key={r.id} color={sevColor} index={String(i + 1).padStart(2, "0")} animDelay={i * 0.05}>
              <Stack sx={{ justifyContent: "space-between", alignItems: "flex-start" }} direction="row" spacing={1}>
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5, flexWrap: "wrap" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{r.title}</Typography>
                    <Chip label={r.severity} size="small" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem", textTransform: "capitalize", bgcolor: `${sevColor}18`, color: sevColor, border: `1px solid ${sevColor}40` }} />
                    <Chip label={r.status} size="small" variant="outlined" sx={{ fontSize: "0.55rem", textTransform: "capitalize" }} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">{r.description}</Typography>
                  {r.mitigation && (
                    <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", opacity: 0.75, mt: 0.5 }}>
                      Mitigation: {r.mitigation} · Residual: {r.residualRating ?? r.severity}
                    </Typography>
                  )}
                  <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", color: "text.secondary", opacity: 0.5, mt: 0.5 }}>
                    Owner: {r.owner || "—"}{r.escalation ? ` · Escalation: ${r.escalation}` : ""}
                  </Typography>
                </Box>
                <IconButton size="small" onClick={() => removeRisk(r.id)} sx={{ color: "#EF4444" }}>
                  <DeleteOutlineOutlinedIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Cell>
          );
        })
      )}

      {/* Sign-offs (Approvals) */}
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", px: 3, pt: 1 }}>
        <SectionLabel>Sign-offs</SectionLabel>
        <Button size="small" variant="outlined" startIcon={<AddOutlinedIcon />} onClick={() => setSignoffDlg(true)} sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", letterSpacing: "0.1em", borderColor: "#00D4AA40", color: "#00D4AA", "&:hover": { borderColor: "#00D4AA" } }}>
          Request sign-off
        </Button>
      </Stack>
      {approvals.length === 0 ? (
        <Cell color="#94A3B8" index="--">
          <Typography color="text.secondary" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.8rem", opacity: 0.5 }}>No sign-offs requested yet</Typography>
        </Cell>
      ) : (
        approvals.map((a, i) => {
          const aColor = a.status === "approved" ? "#10B981" : a.status === "rejected" ? "#EF4444" : a.status === "approved_with_conditions" ? "#F59E0B" : "#8B85FF";
          return (
            <Cell key={a.id} color={aColor} index={String(i + 1).padStart(2, "0")} animDelay={i * 0.05}>
              <Stack sx={{ justifyContent: "space-between", alignItems: "flex-start" }} direction="row" spacing={1}>
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5, flexWrap: "wrap" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{a.title}</Typography>
                    <Chip label={(a.status ?? "pending").replace(/_/g, " ")} size="small" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem", textTransform: "capitalize", bgcolor: `${aColor}18`, color: aColor, border: `1px solid ${aColor}40` }} />
                  </Stack>
                  {a.deliverableRef && <Typography variant="body2" color="text.secondary">Deliverable: {a.deliverableRef}</Typography>}
                  {a.description && <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.85 }}>{a.description}</Typography>}
                  {a.decisionComment && (
                    <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", opacity: 0.8, mt: 0.5 }}>
                      Client note: {a.decisionComment}
                    </Typography>
                  )}
                  {a.decidedAt && (
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", color: "text.secondary", opacity: 0.5, mt: 0.5 }}>
                      Decided {String(a.decidedAt).slice(0, 10)}
                    </Typography>
                  )}
                </Box>
                {a.status === "pending" && (
                  <IconButton size="small" onClick={() => withdrawApproval(a.id)} sx={{ color: "#EF4444" }}>
                    <DeleteOutlineOutlinedIcon fontSize="small" />
                  </IconButton>
                )}
              </Stack>
            </Cell>
          );
        })
      )}

      {/* Stakeholder Map */}
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", px: 3, pt: 1 }}>
        <SectionLabel>Stakeholder Map</SectionLabel>
        <Button size="small" variant="outlined" startIcon={<AddOutlinedIcon />} onClick={() => setStkDlg(true)} sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", letterSpacing: "0.1em", borderColor: "#8B85FF40", color: "#8B85FF", "&:hover": { borderColor: "#8B85FF" } }}>
          Add stakeholder
        </Button>
      </Stack>
      {stakeholders.length === 0 ? (
        <Cell color="#94A3B8" index="--">
          <Typography color="text.secondary" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.8rem", opacity: 0.5 }}>No stakeholders recorded yet</Typography>
        </Cell>
      ) : (
        stakeholders.map((s, i) => {
          const sideColor = s.side === "client" ? "#00D4AA" : "#6C63FF";
          const authLabel = STK_AUTHORITY_LABELS[s.authority] ?? s.authority;
          return (
            <Cell key={s.id} color={sideColor} index={String(i + 1).padStart(2, "0")} animDelay={i * 0.05}>
              <Stack sx={{ justifyContent: "space-between", alignItems: "flex-start" }} direction="row" spacing={1}>
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5, flexWrap: "wrap" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{s.name}</Typography>
                    <Chip label={s.side === "client" ? "Client" : "NeuroDyne"} size="small" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem", bgcolor: `${sideColor}18`, color: sideColor, border: `1px solid ${sideColor}40` }} />
                    <Chip label={authLabel} size="small" variant="outlined" sx={{ fontSize: "0.55rem" }} />
                    <Chip label={s.briefed ? "Briefed" : "Not briefed"} size="small" variant="outlined" color={s.briefed ? "success" : "default"} sx={{ fontSize: "0.55rem" }} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">{s.role}</Typography>
                  {s.email && (
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.62rem", color: "text.secondary", opacity: 0.6, mt: 0.5 }}>{s.email}</Typography>
                  )}
                  {s.notes && (
                    <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", opacity: 0.75, mt: 0.5, whiteSpace: "pre-wrap" }}>{s.notes}</Typography>
                  )}
                </Box>
                <IconButton size="small" onClick={() => removeStakeholder(s.id)} sx={{ color: "#EF4444" }}>
                  <DeleteOutlineOutlinedIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Cell>
          );
        })
      )}

      {/* Add-stakeholder dialog */}
      <Dialog open={stkDlg} onClose={() => setStkDlg(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add a stakeholder</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField slotProps={{ htmlInput: { maxLength: 200 } }} label="Name" value={stkForm.name} onChange={(e) => setStkForm({ ...stkForm, name: e.target.value })} fullWidth />
            <TextField slotProps={{ htmlInput: { maxLength: 200 } }} label="Role / title" value={stkForm.role} onChange={(e) => setStkForm({ ...stkForm, role: e.target.value })} fullWidth />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField select label="Side" value={stkForm.side} onChange={(e) => setStkForm({ ...stkForm, side: e.target.value })} fullWidth>
                <MenuItem value="client">Client</MenuItem>
                <MenuItem value="firm">NeuroDyne</MenuItem>
              </TextField>
              <TextField select label="Decision authority" value={stkForm.authority} onChange={(e) => setStkForm({ ...stkForm, authority: e.target.value })} fullWidth>
                {Object.entries(STK_AUTHORITY_LABELS).map(([v, label]) => <MenuItem key={v} value={v}>{label}</MenuItem>)}
              </TextField>
            </Stack>
            <TextField slotProps={{ htmlInput: { maxLength: 320 } }} label="Email (optional)" value={stkForm.email} onChange={(e) => setStkForm({ ...stkForm, email: e.target.value })} fullWidth />
            <TextField slotProps={{ htmlInput: { maxLength: 2000 } }} label="Notes (optional)" value={stkForm.notes} onChange={(e) => setStkForm({ ...stkForm, notes: e.target.value })} fullWidth multiline minRows={2} />
            <TextField select label="Briefed?" value={stkForm.briefed ? "yes" : "no"} onChange={(e) => setStkForm({ ...stkForm, briefed: e.target.value === "yes" })} fullWidth>
              <MenuItem value="no">Not briefed</MenuItem>
              <MenuItem value="yes">Briefed</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStkDlg(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveStakeholder} disabled={stkSaving || !stkForm.name.trim() || !stkForm.role.trim()}>
            {stkSaving ? "Saving…" : "Add stakeholder"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Capability Lattice */}
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", px: 3, pt: 1 }}>
        <SectionLabel>Capability Lattice</SectionLabel>
        <Button size="small" variant="outlined" startIcon={<AddOutlinedIcon />} onClick={() => setLatDlg(true)} sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", letterSpacing: "0.1em", borderColor: "#10B98140", color: "#10B981", "&:hover": { borderColor: "#10B981" } }}>
          Add capability
        </Button>
      </Stack>
      {lattice.length === 0 ? (
        <Cell color="#94A3B8" index="--">
          <Typography color="text.secondary" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.8rem", opacity: 0.5 }}>No capabilities tracked yet</Typography>
        </Cell>
      ) : (
        lattice.map((l, i) => {
          const lc = LATTICE_STATUS_META[l.status] ?? { label: l.status, color: "#94A3B8" };
          return (
            <Cell key={l.id} color={lc.color} index={String(i + 1).padStart(2, "0")} animDelay={i * 0.05}>
              <Stack sx={{ justifyContent: "space-between", alignItems: "flex-start" }} direction="row" spacing={1}>
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5, flexWrap: "wrap" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{l.capability}</Typography>
                    <Chip label={lc.label} size="small" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem", bgcolor: `${lc.color}18`, color: lc.color, border: `1px solid ${lc.color}40` }} />
                    <Chip label={l.category} size="small" variant="outlined" sx={{ fontSize: "0.55rem" }} />
                  </Stack>
                  {l.description && <Typography variant="body2" color="text.secondary">{l.description}</Typography>}
                  {(l.owner || l.targetDate) && (
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", color: "text.secondary", opacity: 0.5, mt: 0.5 }}>
                      {l.owner ? `Owner: ${l.owner}` : ""}{l.owner && l.targetDate ? " · " : ""}{l.targetDate ? `Target: ${String(l.targetDate).slice(0, 10)}` : ""}
                    </Typography>
                  )}
                </Box>
                <IconButton size="small" onClick={() => removeLatticeItem(l.id)} sx={{ color: "#EF4444" }}>
                  <DeleteOutlineOutlinedIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Cell>
          );
        })
      )}

      {/* Add-capability dialog */}
      <Dialog open={latDlg} onClose={() => setLatDlg(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add a capability</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField slotProps={{ htmlInput: { maxLength: 200 } }} label="Capability" value={latForm.capability} onChange={(e) => setLatForm({ ...latForm, capability: e.target.value })} fullWidth />
            <TextField slotProps={{ htmlInput: { maxLength: 200 } }} label="Capability-map category" value={latForm.category} onChange={(e) => setLatForm({ ...latForm, category: e.target.value })} fullWidth />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField select label="Delivery state" value={latForm.status} onChange={(e) => setLatForm({ ...latForm, status: e.target.value })} fullWidth>
                {Object.entries(LATTICE_STATUS_META).map(([v, m]) => <MenuItem key={v} value={v}>{m.label}</MenuItem>)}
              </TextField>
              <TextField slotProps={{ inputLabel: { shrink: true } }} label="Target date" type="date" value={latForm.targetDate} onChange={(e) => setLatForm({ ...latForm, targetDate: e.target.value })} fullWidth />
            </Stack>
            <TextField slotProps={{ htmlInput: { maxLength: 200 } }} label="Owner (optional)" value={latForm.owner} onChange={(e) => setLatForm({ ...latForm, owner: e.target.value })} fullWidth />
            <TextField slotProps={{ htmlInput: { maxLength: 4000 } }} label="Description (optional)" value={latForm.description} onChange={(e) => setLatForm({ ...latForm, description: e.target.value })} fullWidth multiline minRows={2} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLatDlg(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveLatticeItem} disabled={latSaving || !latForm.capability.trim() || !latForm.category.trim()}>
            {latSaving ? "Saving…" : "Add capability"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reports Library */}
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", px: 3, pt: 1 }}>
        <SectionLabel>Reports Library</SectionLabel>
        <Button size="small" variant="outlined" startIcon={<AddOutlinedIcon />} onClick={() => setRepDlg(true)} sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", letterSpacing: "0.1em", borderColor: "#8B5CF640", color: "#8B5CF6", "&:hover": { borderColor: "#8B5CF6" } }}>
          Add report
        </Button>
      </Stack>
      {reports.length === 0 ? (
        <Cell color="#94A3B8" index="--">
          <Typography color="text.secondary" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.8rem", opacity: 0.5 }}>No reports yet</Typography>
        </Cell>
      ) : (
        reports.map((r, i) => {
          const published = r.status === "published";
          const rColor = published ? "#10B981" : "#94A3B8";
          return (
            <Cell key={r.id} color={rColor} index={String(i + 1).padStart(2, "0")} animDelay={i * 0.05}>
              <Stack sx={{ justifyContent: "space-between", alignItems: "flex-start" }} direction="row" spacing={1}>
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5, flexWrap: "wrap" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{r.title}</Typography>
                    <Chip label={REPORT_TYPE_LABELS[r.type] ?? r.type} size="small" variant="outlined" sx={{ fontSize: "0.55rem" }} />
                    {r.period && <Chip label={r.period} size="small" variant="outlined" sx={{ fontSize: "0.55rem" }} />}
                    <Chip label={published ? "Published" : "Draft"} size="small" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem", bgcolor: `${rColor}18`, color: rColor, border: `1px solid ${rColor}40` }} />
                  </Stack>
                  {r.summary && <Typography variant="body2" color="text.secondary">{r.summary}</Typography>}
                  {safeHref(r.url) && (
                    <Typography component="a" href={safeHref(r.url)!} target="_blank" rel="noopener noreferrer" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.62rem", color: "#6C63FF", mt: 0.5, display: "inline-block", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                      {r.url}
                    </Typography>
                  )}
                  {published && r.publishedAt && (
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", color: "text.secondary", opacity: 0.5, mt: 0.5 }}>
                      Published {String(r.publishedAt).slice(0, 10)}
                    </Typography>
                  )}
                </Box>
                <Stack sx={{ alignItems: "center" }} direction="row" spacing={0.5}>
                  {published ? (
                    <Button size="small" onClick={() => unpublishReport(r.id)} sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", color: "#94A3B8" }}>Unpublish</Button>
                  ) : (
                    <Button size="small" onClick={() => publishReport(r.id)} sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", color: "#10B981" }}>Publish</Button>
                  )}
                  <IconButton size="small" onClick={() => removeReport(r.id)} sx={{ color: "#EF4444" }}>
                    <DeleteOutlineOutlinedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            </Cell>
          );
        })
      )}

      {/* Add-report dialog */}
      <Dialog open={repDlg} onClose={() => setRepDlg(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add a report</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField slotProps={{ htmlInput: { maxLength: 300 } }} label="Title" value={repForm.title} onChange={(e) => setRepForm({ ...repForm, title: e.target.value })} fullWidth />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField select label="Type" value={repForm.type} onChange={(e) => setRepForm({ ...repForm, type: e.target.value })} fullWidth>
                {Object.entries(REPORT_TYPE_LABELS).map(([v, label]) => <MenuItem key={v} value={v}>{label}</MenuItem>)}
              </TextField>
              <TextField slotProps={{ htmlInput: { maxLength: 60 } }} label="Period (e.g. Q2 2026)" value={repForm.period} onChange={(e) => setRepForm({ ...repForm, period: e.target.value })} fullWidth />
            </Stack>
            <TextField slotProps={{ htmlInput: { maxLength: 2000 } }} label="Document link / export URL" value={repForm.url} onChange={(e) => setRepForm({ ...repForm, url: e.target.value })} fullWidth />
            <TextField slotProps={{ htmlInput: { maxLength: 8000 } }} label="Summary" value={repForm.summary} onChange={(e) => setRepForm({ ...repForm, summary: e.target.value })} fullWidth multiline minRows={3} />
            <TextField select label="Visibility" value={repForm.status} onChange={(e) => setRepForm({ ...repForm, status: e.target.value })} fullWidth helperText="Drafts are not visible to the client until published.">
              <MenuItem value="draft">Draft (internal)</MenuItem>
              <MenuItem value="published">Published (client-visible)</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRepDlg(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveReport} disabled={repSaving || !repForm.title.trim()}>
            {repSaving ? "Saving…" : "Save report"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Team Directory */}
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", px: 3, pt: 1 }}>
        <SectionLabel>Team Directory</SectionLabel>
        <Button size="small" variant="outlined" startIcon={<AddOutlinedIcon />} onClick={() => setMemDlg(true)} sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", letterSpacing: "0.1em", borderColor: "#00D4AA40", color: "#00D4AA", "&:hover": { borderColor: "#00D4AA" } }}>
          Add member
        </Button>
      </Stack>
      {directory.length === 0 ? (
        <Cell color="#94A3B8" index="--">
          <Typography color="text.secondary" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.8rem", opacity: 0.5 }}>No team members listed yet</Typography>
        </Cell>
      ) : (
        directory.map((m, i) => {
          const av = AVAILABILITY_META[m.availability] ?? { label: m.availability, color: "#94A3B8" };
          return (
            <Cell key={m.id} color={av.color} index={String(i + 1).padStart(2, "0")} animDelay={i * 0.05}>
              <Stack sx={{ justifyContent: "space-between", alignItems: "flex-start" }} direction="row" spacing={1}>
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5, flexWrap: "wrap" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{m.name}</Typography>
                    <Chip label={av.label} size="small" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem", bgcolor: `${av.color}18`, color: av.color, border: `1px solid ${av.color}40` }} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">{m.role}</Typography>
                  {m.focus && <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", opacity: 0.8, mt: 0.5 }}>Focus: {m.focus}</Typography>}
                  {m.bio && <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", opacity: 0.75, mt: 0.5 }}>{m.bio}</Typography>}
                  {m.email && (
                    <Typography component="a" href={`mailto:${m.email}`} sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.62rem", color: "#6C63FF", mt: 0.5, display: "inline-block", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                      {m.email}
                    </Typography>
                  )}
                </Box>
                <IconButton size="small" onClick={() => removeMember(m.id)} sx={{ color: "#EF4444" }}>
                  <DeleteOutlineOutlinedIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Cell>
          );
        })
      )}

      {/* Add-member dialog */}
      <Dialog open={memDlg} onClose={() => setMemDlg(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add a team member</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField slotProps={{ htmlInput: { maxLength: 200 } }} label="Name" value={memForm.name} onChange={(e) => setMemForm({ ...memForm, name: e.target.value })} fullWidth />
            <TextField slotProps={{ htmlInput: { maxLength: 200 } }} label="Role / title" value={memForm.role} onChange={(e) => setMemForm({ ...memForm, role: e.target.value })} fullWidth />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField slotProps={{ htmlInput: { maxLength: 320 } }} label="Email (optional)" value={memForm.email} onChange={(e) => setMemForm({ ...memForm, email: e.target.value })} fullWidth />
              <TextField select label="Availability" value={memForm.availability} onChange={(e) => setMemForm({ ...memForm, availability: e.target.value })} fullWidth>
                {Object.entries(AVAILABILITY_META).map(([v, m]) => <MenuItem key={v} value={v}>{m.label}</MenuItem>)}
              </TextField>
            </Stack>
            <TextField slotProps={{ htmlInput: { maxLength: 300 } }} label="Focus (optional)" value={memForm.focus} onChange={(e) => setMemForm({ ...memForm, focus: e.target.value })} fullWidth />
            <TextField slotProps={{ htmlInput: { maxLength: 2000 } }} label="Bio (optional)" value={memForm.bio} onChange={(e) => setMemForm({ ...memForm, bio: e.target.value })} fullWidth multiline minRows={2} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMemDlg(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveMember} disabled={memSaving || !memForm.name.trim() || !memForm.role.trim()}>
            {memSaving ? "Saving…" : "Add member"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Budget & Milestones */}
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", px: 3, pt: 1 }}>
        <SectionLabel>Budget &amp; Milestones</SectionLabel>
        <Button size="small" variant="outlined" startIcon={<AddOutlinedIcon />} onClick={() => setBudDlg(true)} sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", letterSpacing: "0.1em", borderColor: "#F59E0B40", color: "#F59E0B", "&:hover": { borderColor: "#F59E0B" } }}>
          Add budget line
        </Button>
      </Stack>
      {budget.length === 0 ? (
        <Cell color="#94A3B8" index="--">
          <Typography color="text.secondary" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.8rem", opacity: 0.5 }}>No budget lines tracked yet</Typography>
        </Cell>
      ) : (
        budget.map((b, i) => {
          const st = BUDGET_STATUS_META[b.status] ?? { label: b.status, color: "#94A3B8" };
          const invoiced = Number(b.invoicedAmount) || 0;
          const paid = Number(b.paidAmount) || 0;
          const outstanding = Math.max(0, invoiced - paid);
          return (
            <Cell key={b.id} color={st.color} index={String(i + 1).padStart(2, "0")} animDelay={i * 0.05}>
              <Stack sx={{ justifyContent: "space-between", alignItems: "flex-start" }} direction="row" spacing={1}>
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5, flexWrap: "wrap" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{b.label}</Typography>
                    <Chip label={BUDGET_CATEGORY_LABELS[b.category] ?? b.category} size="small" variant="outlined" sx={{ fontSize: "0.55rem" }} />
                    <Chip label={st.label} size="small" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem", bgcolor: `${st.color}18`, color: st.color, border: `1px solid ${st.color}40` }} />
                  </Stack>
                  <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.7rem", color: "text.secondary" }}>
                    Budget {fmtMoney(Number(b.budgetAmount) || 0, b.currency)} · Invoiced {fmtMoney(invoiced, b.currency)} · Outstanding {fmtMoney(outstanding, b.currency)}
                  </Typography>
                  {b.dueDate && (
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", color: "text.secondary", opacity: 0.5, mt: 0.5 }}>
                      Due {String(b.dueDate).slice(0, 10)}
                    </Typography>
                  )}
                  {b.notes && <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", opacity: 0.75, mt: 0.5 }}>{b.notes}</Typography>}
                </Box>
                <IconButton size="small" onClick={() => removeBudgetItem(b.id)} sx={{ color: "#EF4444" }}>
                  <DeleteOutlineOutlinedIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Cell>
          );
        })
      )}

      {/* Add-budget-line dialog */}
      <Dialog open={budDlg} onClose={() => setBudDlg(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add a budget line</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField slotProps={{ htmlInput: { maxLength: 300 } }} label="Label (milestone / workstream)" value={budForm.label} onChange={(e) => setBudForm({ ...budForm, label: e.target.value })} fullWidth />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField select label="Category" value={budForm.category} onChange={(e) => setBudForm({ ...budForm, category: e.target.value })} fullWidth>
                {Object.entries(BUDGET_CATEGORY_LABELS).map(([v, label]) => <MenuItem key={v} value={v}>{label}</MenuItem>)}
              </TextField>
              <TextField select label="Currency" value={budForm.currency} onChange={(e) => setBudForm({ ...budForm, currency: e.target.value })} fullWidth>
                {["USD", "GHS", "EUR", "GBP"].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField slotProps={{ htmlInput: { min: 0, step: "any" } }} label="Budget" type="number" value={budForm.budgetAmount} onChange={(e) => setBudForm({ ...budForm, budgetAmount: e.target.value })} fullWidth />
              <TextField slotProps={{ htmlInput: { min: 0, step: "any" } }} label="Invoiced" type="number" value={budForm.invoicedAmount} onChange={(e) => setBudForm({ ...budForm, invoicedAmount: e.target.value })} fullWidth />
              <TextField slotProps={{ htmlInput: { min: 0, step: "any" } }} label="Paid" type="number" value={budForm.paidAmount} onChange={(e) => setBudForm({ ...budForm, paidAmount: e.target.value })} fullWidth />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField select label="Status" value={budForm.status} onChange={(e) => setBudForm({ ...budForm, status: e.target.value })} fullWidth>
                {Object.entries(BUDGET_STATUS_META).map(([v, m]) => <MenuItem key={v} value={v}>{m.label}</MenuItem>)}
              </TextField>
              <TextField slotProps={{ inputLabel: { shrink: true } }} label="Due date" type="date" value={budForm.dueDate} onChange={(e) => setBudForm({ ...budForm, dueDate: e.target.value })} fullWidth />
            </Stack>
            <TextField slotProps={{ htmlInput: { maxLength: 2000 } }} label="Notes (optional)" value={budForm.notes} onChange={(e) => setBudForm({ ...budForm, notes: e.target.value })} fullWidth multiline minRows={2} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBudDlg(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveBudgetItem} disabled={budSaving || !budForm.label.trim() || budForm.budgetAmount === "" || Number(budForm.budgetAmount) < 0}>
            {budSaving ? "Saving…" : "Add line"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Request-sign-off dialog */}
      <Dialog open={signoffDlg} onClose={() => setSignoffDlg(false)} fullWidth maxWidth="sm">
        <DialogTitle>Request a sign-off</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField slotProps={{ htmlInput: { maxLength: 300 } }} label="What needs sign-off" value={signoffForm.title} onChange={(e) => setSignoffForm({ ...signoffForm, title: e.target.value })} fullWidth />
            <TextField slotProps={{ htmlInput: { maxLength: 2000 } }} label="Deliverable reference (name or link)" value={signoffForm.deliverableRef} onChange={(e) => setSignoffForm({ ...signoffForm, deliverableRef: e.target.value })} fullWidth />
            <TextField slotProps={{ htmlInput: { maxLength: 8000 } }} label="Context for the client" value={signoffForm.description} onChange={(e) => setSignoffForm({ ...signoffForm, description: e.target.value })} fullWidth multiline minRows={3} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSignoffDlg(false)}>Cancel</Button>
          <Button variant="contained" onClick={requestSignoff} disabled={signoffSaving || !signoffForm.title.trim()}>
            {signoffSaving ? "Sending…" : "Send for sign-off"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Register-a-risk dialog */}
      <Dialog open={riskDlg} onClose={() => setRiskDlg(false)} fullWidth maxWidth="sm">
        <DialogTitle>Register a risk</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField slotProps={{ htmlInput: { maxLength: 300 } }} label="Title" value={riskForm.title} onChange={(e) => setRiskForm({ ...riskForm, title: e.target.value })} fullWidth />
            <TextField slotProps={{ htmlInput: { maxLength: 8000 } }} label="Description" value={riskForm.description} onChange={(e) => setRiskForm({ ...riskForm, description: e.target.value })} fullWidth multiline minRows={2} />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField slotProps={{ htmlInput: { maxLength: 200 } }} label="Owner" value={riskForm.owner} onChange={(e) => setRiskForm({ ...riskForm, owner: e.target.value })} fullWidth />
              <TextField select label="Severity" value={riskForm.severity} onChange={(e) => setRiskForm({ ...riskForm, severity: e.target.value })} fullWidth>
                {["low", "medium", "high", "critical"].map((s) => <MenuItem key={s} value={s} sx={{ textTransform: "capitalize" }}>{s}</MenuItem>)}
              </TextField>
            </Stack>
            <TextField slotProps={{ htmlInput: { maxLength: 8000 } }} label="Mitigation plan" value={riskForm.mitigation} onChange={(e) => setRiskForm({ ...riskForm, mitigation: e.target.value })} fullWidth multiline minRows={2} />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField select label="Residual rating" value={riskForm.residualRating} onChange={(e) => setRiskForm({ ...riskForm, residualRating: e.target.value })} fullWidth>
                {["low", "medium", "high", "critical"].map((s) => <MenuItem key={s} value={s} sx={{ textTransform: "capitalize" }}>{s}</MenuItem>)}
              </TextField>
              <TextField select label="Status" value={riskForm.status} onChange={(e) => setRiskForm({ ...riskForm, status: e.target.value })} fullWidth>
                {["open", "mitigating", "monitoring", "accepted", "closed"].map((s) => <MenuItem key={s} value={s} sx={{ textTransform: "capitalize" }}>{s}</MenuItem>)}
              </TextField>
            </Stack>
            <TextField slotProps={{ htmlInput: { maxLength: 2000 } }} label="Escalation status / path" value={riskForm.escalation} onChange={(e) => setRiskForm({ ...riskForm, escalation: e.target.value })} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRiskDlg(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveRisk} disabled={riskSaving || !riskForm.title.trim() || !riskForm.description.trim() || !riskForm.owner.trim()}>
            {riskSaving ? "Saving…" : "Register risk"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Log-a-decision dialog */}
      <Dialog open={dlgOpen} onClose={() => setDlgOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Log a decision</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField slotProps={{ htmlInput: { maxLength: 300 } }} label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} fullWidth />
            <TextField slotProps={{ htmlInput: { maxLength: 8000 } }} label="Rationale" value={form.rationale} onChange={(e) => setForm({ ...form, rationale: e.target.value })} fullWidth multiline minRows={3} />
            <TextField label="Alternatives considered (comma-separated)" value={form.alternatives} onChange={(e) => setForm({ ...form, alternatives: e.target.value })} fullWidth />
            <TextField slotProps={{ htmlInput: { maxLength: 200 } }} label="Decision-maker" value={form.decisionMaker} onChange={(e) => setForm({ ...form, decisionMaker: e.target.value })} fullWidth />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} fullWidth>
                {["proposed", "accepted", "superseded", "rejected"].map((s) => (
                  <MenuItem key={s} value={s} sx={{ textTransform: "capitalize" }}>{s}</MenuItem>
                ))}
              </TextField>
              <TextField slotProps={{ inputLabel: { shrink: true } }} label="Decided on" type="date" value={form.decidedAt} onChange={(e) => setForm({ ...form, decidedAt: e.target.value })} fullWidth />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDlgOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveDecision} disabled={saving || !form.title.trim() || !form.rationale.trim() || !form.decisionMaker.trim()}>
            {saving ? "Saving…" : "Log decision"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast("")} message={toast} />
    </Box>
  );
}
