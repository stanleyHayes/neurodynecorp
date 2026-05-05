import { useState } from "react";
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
import { useNavigate } from "react-router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";
import PageBanner from "@/components/shared/PageBanner";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";
import { useAuth } from "@/context/AuthContext";

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

export default function RoleCreate() {
  const navigate = useNavigate();
  const { api } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = name.trim() && permissions.size > 0;

  const togglePermission = (perm: string) => {
    setPermissions((prev) => {
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
    setPermissions((prev) => {
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
    if (!canSubmit) return;
    setSaving(true);
    setError("");
    try {
      await api.createRole({
        name,
        description,
        permissions: Array.from(permissions),
      });
      navigate("/roles");
    } catch (err: any) {
      setError(err.message ?? "Failed to create role");
    } finally {
      setSaving(false);
    }
  };

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
        icon={<SecurityOutlinedIcon />}
        title="New Role"
        description="Create a new role with custom permissions for access control."
        tag="ADMIN // NEW ROLE"
        accentWord="New"
        iconColor="#6C63FF"
        iconLabel="RBAC"
      />

      {/* Action bar */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", px: 3, py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" onClick={() => navigate("/roles")} sx={{ ...btnSx, borderColor: "rgba(108,99,255,0.2)", color: "text.secondary", "&:hover": { borderColor: "rgba(108,99,255,0.4)" } }}>
            Cancel
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={saving ? <CircularProgress size={14} /> : <SaveOutlinedIcon />}
            disabled={!canSubmit || saving}
            onClick={handleSave}
            sx={{ ...btnSx, borderColor: "#10B98140", color: "#10B981", "&:hover": { borderColor: "#10B981", bgcolor: "#10B98108" }, "&.Mui-disabled": { borderColor: "rgba(108,99,255,0.1)", color: "text.secondary", opacity: 0.3 } }}
          >
            Create Role
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mx: 3, mt: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Form */}
      <SectionLabel>Role Details</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        <Cell color="#6C63FF" index="00" colInRow={0} totalCols={2} animDelay={0}>
          <Stack spacing={2}>
            <TextField fullWidth size="small" label="Role Name" value={name} onChange={(e) => setName(e.target.value)} sx={inputSx} />
            <TextField fullWidth size="small" label="Description" value={description} onChange={(e) => setDescription(e.target.value)} multiline rows={2} sx={inputSx} />
          </Stack>
        </Cell>
        <Cell color="#8B5CF6" index="01" colInRow={1} totalCols={2} animDelay={0.1}>
          <Box sx={{ "& .MuiSvgIcon-root": { fontSize: 28 }, color: "#8B5CF6", filter: "drop-shadow(0 0 12px rgba(139,92,246,0.25))", mb: 1 }}>
            <VpnKeyOutlinedIcon />
          </Box>
          <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "text.secondary", opacity: 0.6, mb: 0.5 }}>
            Selected Permissions
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>{permissions.size}</Typography>
          <Typography variant="caption" sx={{ color: "#8B5CF6", opacity: 0.8 }}>
            across {new Set(Array.from(permissions).map((p) => p.split(":")[0])).size} resources
          </Typography>
        </Cell>
      </Box>

      {/* Permissions */}
      <SectionLabel>Permissions</SectionLabel>
      <Cell color="#6C63FF" index="02" animDelay={0.2}>
        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
          Higher actions automatically include lower ones (delete includes update, create, and read)
        </Typography>
        {RESOURCES.map((resource) => {
          const resourcePerms = ACTIONS.map((a) => `${resource}:${a}`);
          const allChecked = resourcePerms.every((p) => permissions.has(p));
          const someChecked = resourcePerms.some((p) => permissions.has(p));

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
                            checked={permissions.has(perm)}
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

      {/* Preview */}
      {canSubmit && (
        <>
          <SectionLabel>Preview</SectionLabel>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" } }}>
            <Cell color="#6C63FF" index="P0" colInRow={0} totalCols={3} animDelay={0.3}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ "& .MuiSvgIcon-root": { fontSize: 32 }, color: "#6C63FF", filter: "drop-shadow(0 0 10px rgba(108,99,255,0.25))" }}>
                  <SecurityOutlinedIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{name}</Typography>
                  <Typography sx={{ fontFamily: "monospace", fontSize: "0.65rem", color: "text.secondary", opacity: 0.6 }}>{description || "No description"}</Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
                <Box>
                  <Typography sx={{ fontFamily: "monospace", fontSize: "0.55rem", color: "text.secondary", opacity: 0.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>Permissions</Typography>
                  <Typography variant="body2" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>{permissions.size}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: "monospace", fontSize: "0.55rem", color: "text.secondary", opacity: 0.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>Type</Typography>
                  <Chip label="Custom" size="small" sx={{ fontFamily: "monospace", fontSize: "0.6rem", bgcolor: "rgba(108,99,255,0.1)", color: "#6C63FF", border: "1px solid rgba(108,99,255,0.2)" }} />
                </Box>
              </Stack>
            </Cell>
          </Box>
        </>
      )}
    </Box>
  );
}
