import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Stack,
  Button,
  Chip,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { useNavigate, useParams } from "react-router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import PageBanner from "@/components/shared/PageBanner";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";
import PageSkeleton from "@/components/shared/PageSkeleton";
import { useAuth } from "@/context/AuthContext";
import PermissionGate from "@/components/PermissionGate";

interface RBACRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

const BORDER = "rgba(108, 99, 255, 0.12)";

const RESOURCES = [
  "dashboard", "pipeline", "analytics", "clients", "projects",
  "specifications", "tasks", "blog", "portfolio", "testimonials",
  "services", "contact_submissions", "team", "messages", "finance",
  "billing", "notifications", "documents", "settings", "roles",
];

const ACTIONS = ["read", "create", "update", "delete"];

const ACTION_WEIGHT: Record<string, number> = {
  read: 1,
  create: 2,
  update: 3,
  delete: 4,
};

function normalizePermissions(perms: string[]): string[] {
  const result = new Set(perms);
  for (const p of perms) {
    const [resource, action] = p.split(":");
    const weight = ACTION_WEIGHT[action] ?? 0;
    for (const a of ACTIONS) {
      if (ACTION_WEIGHT[a] < weight) {
        result.add(`${resource}:${a}`);
      }
    }
  }
  return Array.from(result);
}

function formatResource(r: string): string {
  return r.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const inputSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "rgba(108, 99, 255, 0.04)",
    "& fieldset": { borderColor: "rgba(108,99,255,0.15)" },
    "&:hover fieldset": { borderColor: "rgba(108,99,255,0.3)" },
    "&.Mui-focused fieldset": { borderColor: "#6C63FF" },
  },
};

const btnSx = {
  fontFamily: "monospace",
  fontSize: "0.65rem",
  letterSpacing: "0.1em",
};

export default function RoleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();

  const [role, setRole] = useState<RBACRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPermissions, setFormPermissions] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const loadRole = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.listRoles();
      const found = (res.roles ?? []).find((r: RBACRole) => r.id === id);
      if (found) {
        setRole(found);
        setFormName(found.name);
        setFormDescription(found.description);
        setFormPermissions(new Set(found.permissions));
      } else {
        setError("Role not found");
      }
    } catch (err: any) {
      setError(err.message ?? "Failed to load role");
    } finally {
      setLoading(false);
    }
  }, [api, id]);

  useEffect(() => {
    loadRole();
  }, [loadRole]);

  const togglePermission = (perm: string) => {
    setFormPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(perm)) {
        const [resource, action] = perm.split(":");
        const weight = ACTION_WEIGHT[action];
        for (const a of ACTIONS) {
          if (ACTION_WEIGHT[a] >= weight) {
            next.delete(`${resource}:${a}`);
          }
        }
      } else {
        next.add(perm);
        const normalized = normalizePermissions(Array.from(next));
        normalized.forEach((p) => next.add(p));
      }
      return next;
    });
  };

  const toggleAllForResource = (resource: string) => {
    setFormPermissions((prev) => {
      const next = new Set(prev);
      const allPerms = ACTIONS.map((a) => `${resource}:${a}`);
      const allPresent = allPerms.every((p) => next.has(p));
      if (allPresent) {
        allPerms.forEach((p) => next.delete(p));
      } else {
        allPerms.forEach((p) => next.add(p));
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!role || !formName.trim()) return;
    setSaving(true);
    setError("");
    try {
      await api.updateRole(role.id, {
        name: formName,
        description: formDescription,
        permissions: Array.from(formPermissions),
      });
      setEditing(false);
      await loadRole();
    } catch (err: any) {
      setError(err.message ?? "Failed to update role");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (role) {
      setFormName(role.name);
      setFormDescription(role.description);
      setFormPermissions(new Set(role.permissions));
    }
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!role || role.is_system) return;
    if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;
    try {
      await api.deleteRole(role.id);
      navigate("/roles");
    } catch (err: any) {
      setError(err.message ?? "Failed to delete role");
    }
  };

  if (loading) {
    return <PageSkeleton stats={3} rows={4} />;
  }

  if (error && !role) {
    return (
      <Box>
        <Box
          onClick={() => navigate("/roles")}
          sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 3, py: 1.5, cursor: "pointer", color: "text.secondary", "&:hover": { color: "#6C63FF" }, transition: "color 0.2s" }}
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} />
          <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.1em" }}>BACK TO ROLES</Typography>
        </Box>
        <Alert severity="error" sx={{ mx: 3, mt: 2 }}>{error}</Alert>
      </Box>
    );
  }

  if (!role) return null;

  const color = role.is_system ? "#F59E0B" : "#6C63FF";
  const resourceCount = new Set(role.permissions.map((p) => p.split(":")[0])).size;

  return (
    <Box>
      <Box
        onClick={() => navigate("/roles")}
        sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 3, py: 1.5, cursor: "pointer", color: "text.secondary", "&:hover": { color: "#6C63FF" }, transition: "color 0.2s" }}
      >
        <ArrowBackIcon sx={{ fontSize: 18 }} />
        <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.1em" }}>BACK TO ROLES</Typography>
      </Box>

      <PageBanner
        icon={role.is_system ? <AdminPanelSettingsOutlinedIcon /> : <SecurityOutlinedIcon />}
        title={editing ? `Editing: ${role.name}` : role.name}
        description={editing ? "Update the role details and permissions below." : (role.description || "No description provided.")}
        tag={`ADMIN // ROLE ${role.is_system ? "// SYSTEM" : ""}`}
        accentWord={role.name.split(" ")[0]}
        iconColor={color}
        iconLabel={role.is_system ? "SYSTEM ROLE" : "CUSTOM ROLE"}
      />

      {/* Action bar */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", px: 3, py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
        <Stack direction="row" spacing={1}>
          {editing ? (
            <>
              <Button variant="outlined" size="small" onClick={handleCancel} sx={{ ...btnSx, borderColor: "rgba(108,99,255,0.2)", color: "text.secondary", "&:hover": { borderColor: "rgba(108,99,255,0.4)" } }}>
                Cancel
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={saving ? <CircularProgress size={14} /> : <SaveOutlinedIcon />}
                disabled={!formName.trim() || formPermissions.size === 0 || saving}
                onClick={handleSave}
                sx={{ ...btnSx, borderColor: "#10B98140", color: "#10B981", "&:hover": { borderColor: "#10B981", bgcolor: "#10B98108" }, "&.Mui-disabled": { borderColor: "rgba(108,99,255,0.1)", color: "text.secondary", opacity: 0.3 } }}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <>
              {!role.is_system && (
                <PermissionGate permission="roles:delete">
                  <Button variant="outlined" size="small" onClick={handleDelete} sx={{ ...btnSx, borderColor: "rgba(239,68,68,0.3)", color: "#EF4444", "&:hover": { borderColor: "#EF4444", bgcolor: "rgba(239,68,68,0.05)" } }}>
                    Delete
                  </Button>
                </PermissionGate>
              )}
              <PermissionGate permission="roles:update">
                <Button variant="outlined" size="small" onClick={() => setEditing(true)} sx={{ ...btnSx, borderColor: "#6C63FF40", color: "#6C63FF", "&:hover": { borderColor: "#6C63FF", bgcolor: "rgba(108,99,255,0.05)" } }}>
                  Edit Role
                </Button>
              </PermissionGate>
            </>
          )}
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mx: 3, mt: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Stats */}
      <SectionLabel>Overview</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" } }}>
        <Cell color={color} index="00" colInRow={0} totalCols={4} animDelay={0} minH={120}>
          <Box sx={{ "& .MuiSvgIcon-root": { fontSize: 28 }, color, filter: `drop-shadow(0 0 12px ${color}40)`, mb: 1 }}>
            {role.is_system ? <LockOutlinedIcon /> : <TuneOutlinedIcon />}
          </Box>
          <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "text.secondary", opacity: 0.6, mb: 0.5 }}>
            Type
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>{role.is_system ? "System" : "Custom"}</Typography>
          <Typography variant="caption" sx={{ color, opacity: 0.8 }}>{role.is_system ? "built-in role" : "user-created"}</Typography>
        </Cell>
        <Cell color="#8B5CF6" index="01" colInRow={1} totalCols={4} animDelay={0.1} minH={120}>
          <Box sx={{ "& .MuiSvgIcon-root": { fontSize: 28 }, color: "#8B5CF6", filter: "drop-shadow(0 0 12px rgba(139,92,246,0.25))", mb: 1 }}>
            <VpnKeyOutlinedIcon />
          </Box>
          <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "text.secondary", opacity: 0.6, mb: 0.5 }}>
            Permissions
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>{role.permissions.length}</Typography>
          <Typography variant="caption" sx={{ color: "#8B5CF6", opacity: 0.8 }}>total assigned</Typography>
        </Cell>
        <Cell color="#00D4AA" index="02" colInRow={2} totalCols={4} animDelay={0.2} minH={120}>
          <Box sx={{ "& .MuiSvgIcon-root": { fontSize: 28 }, color: "#00D4AA", filter: "drop-shadow(0 0 12px rgba(0,212,170,0.25))", mb: 1 }}>
            <SecurityOutlinedIcon />
          </Box>
          <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "text.secondary", opacity: 0.6, mb: 0.5 }}>
            Resources
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>{resourceCount}</Typography>
          <Typography variant="caption" sx={{ color: "#00D4AA", opacity: 0.8 }}>with access</Typography>
        </Cell>
        <Cell color="#F59E0B" index="03" colInRow={3} totalCols={4} animDelay={0.3} minH={120}>
          <Box sx={{ "& .MuiSvgIcon-root": { fontSize: 28 }, color: "#F59E0B", filter: "drop-shadow(0 0 12px rgba(245,158,11,0.25))", mb: 1 }}>
            <CalendarTodayOutlinedIcon />
          </Box>
          <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "text.secondary", opacity: 0.6, mb: 0.5 }}>
            Created
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, fontSize: "1.4rem" }}>{role.created_at?.slice(0, 10) ?? "—"}</Typography>
          <Typography variant="caption" sx={{ color: "#F59E0B", opacity: 0.8 }}>updated {role.updated_at?.slice(0, 10) ?? "—"}</Typography>
        </Cell>
      </Box>

      {editing ? (
        <>
          {/* Editable form */}
          <SectionLabel>Role Details</SectionLabel>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
            <Cell color="#6C63FF" index="04" colInRow={0} totalCols={2} animDelay={0.35}>
              <Stack spacing={2}>
                <TextField fullWidth size="small" label="Role Name" value={formName} onChange={(e) => setFormName(e.target.value)} sx={inputSx} />
                <TextField fullWidth size="small" label="Description" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} multiline rows={2} sx={inputSx} />
              </Stack>
            </Cell>
            <Cell color="#8B5CF6" index="05" colInRow={1} totalCols={2} animDelay={0.4}>
              <Box sx={{ "& .MuiSvgIcon-root": { fontSize: 28 }, color: "#8B5CF6", filter: "drop-shadow(0 0 12px rgba(139,92,246,0.25))", mb: 1 }}>
                <VpnKeyOutlinedIcon />
              </Box>
              <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "text.secondary", opacity: 0.6, mb: 0.5 }}>
                Selected Permissions
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>{formPermissions.size}</Typography>
              <Typography variant="caption" sx={{ color: "#8B5CF6", opacity: 0.8 }}>
                across {new Set(Array.from(formPermissions).map((p) => p.split(":")[0])).size} resources
              </Typography>
            </Cell>
          </Box>

          <SectionLabel>Permissions</SectionLabel>
          <Cell color="#6C63FF" index="06" animDelay={0.45}>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
              Higher actions automatically include lower ones (delete includes update, create, and read)
            </Typography>
            {RESOURCES.map((resource) => {
              const resourcePerms = ACTIONS.map((a) => `${resource}:${a}`);
              const allChecked = resourcePerms.every((p) => formPermissions.has(p));
              const someChecked = resourcePerms.some((p) => formPermissions.has(p));

              return (
                <Accordion
                  key={resource}
                  disableGutters
                  sx={{ bgcolor: "background.default", "&:before": { display: "none" } }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={allChecked}
                          indeterminate={someChecked && !allChecked}
                          onChange={() => toggleAllForResource(resource)}
                          onClick={(e) => e.stopPropagation()}
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatResource(resource)}
                        </Typography>
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                  </AccordionSummary>
                  <AccordionDetails sx={{ pl: 6 }}>
                    <FormGroup row>
                      {ACTIONS.map((action) => {
                        const perm = `${resource}:${action}`;
                        return (
                          <FormControlLabel
                            key={perm}
                            control={
                              <Checkbox
                                checked={formPermissions.has(perm)}
                                onChange={() => togglePermission(perm)}
                                size="small"
                              />
                            }
                            label={
                              <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                                {action}
                              </Typography>
                            }
                          />
                        );
                      })}
                    </FormGroup>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Cell>
        </>
      ) : (
        <>
          {/* Read-only permission view */}
          <SectionLabel>Permissions by Resource</SectionLabel>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" } }}>
            {RESOURCES.filter((resource) => ACTIONS.some((a) => role.permissions.includes(`${resource}:${a}`))).map((resource, i) => {
              const activeActions = ACTIONS.filter((a) => role.permissions.includes(`${resource}:${a}`));
              return (
                <Cell
                  key={resource}
                  color={color}
                  index={String(i + 4).padStart(2, "0")}
                  colInRow={i % 3}
                  totalCols={3}
                  animDelay={0.35 + i * 0.05}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>{formatResource(resource)}</Typography>
                  <Stack sx={{ flexWrap: "wrap" }} direction="row" spacing={0.5} useFlexGap>
                    {activeActions.map((action) => (
                      <Chip
                        key={action}
                        label={action}
                        size="small"
                        sx={{
                          fontFamily: "monospace",
                          fontSize: "0.6rem",
                          textTransform: "capitalize",
                          bgcolor: `${color}18`,
                          color,
                          border: `1px solid ${color}30`,
                        }}
                      />
                    ))}
                  </Stack>
                </Cell>
              );
            })}
          </Box>
        </>
      )}
    </Box>
  );
}
