import { useState } from "react";
import { Box, Typography, TextField, MenuItem, Stack, Button, Avatar, Alert, CircularProgress, IconButton, InputAdornment, Tooltip } from "@mui/material";
import { useNavigate } from "react-router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CasinoOutlinedIcon from "@mui/icons-material/CasinoOutlined";
import PageBanner from "@/components/shared/PageBanner";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";
import { useAuth } from "@/context/AuthContext";

const BORDER = "rgba(108, 99, 255, 0.12)";

const ROLES = [
  { label: "Admin", value: "admin" },
  { label: "Project Manager", value: "project_manager" },
  { label: "Developer", value: "developer" },
  { label: "QA", value: "qa" },
];

const roleColors: Record<string, string> = {
  admin: "#6C63FF",
  project_manager: "#8B5CF6",
  developer: "#00D4AA",
  qa: "#F59E0B",
};

const inputSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "rgba(108, 99, 255, 0.04)",
    "& fieldset": { borderColor: "rgba(108,99,255,0.15)" },
    "&:hover fieldset": { borderColor: "rgba(108,99,255,0.3)" },
    "&.Mui-focused fieldset": { borderColor: "#00D4AA" },
  },
};

const btnSx = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "0.65rem",
  letterSpacing: "0.1em",
};

function generatePassword(length = 16): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((b) => chars[b % chars.length])
    .join("");
}

function splitName(fullName: string): { first_name: string; last_name: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first_name: "", last_name: "" };
  if (parts.length === 1) return { first_name: parts[0], last_name: parts[0] };
  return { first_name: parts[0], last_name: parts.slice(1).join(" ") };
}

export default function TeamCreate() {
  const navigate = useNavigate();
  const { api } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("developer");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = Boolean(name.trim() && email.trim() && password.trim().length >= 8);

  const initials = name
    .trim()
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const color = roleColors[role] ?? "#00D4AA";
  const roleLabel = ROLES.find((r) => r.value === role)?.label ?? role;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const { first_name, last_name } = splitName(name);
      const created = await api.register({
        first_name,
        last_name,
        email: email.trim(),
        password,
      });

      const rolesRes = await api.listRoles();
      const targetRole = (rolesRes.roles ?? []).find((r) => r.name === role);
      if (!targetRole) {
        throw new Error(`Role "${roleLabel}" was not found. The account was created as a client — assign a role from Roles.`);
      }

      await api.assignRole(created.user.id, targetRole.id);
      navigate("/team");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add team member.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Box
        onClick={() => navigate("/team")}
        sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 3, py: 1.5, cursor: "pointer", color: "text.secondary", "&:hover": { color: "#00D4AA" }, transition: "color 0.2s" }}
      >
        <ArrowBackIcon sx={{ fontSize: 18 }} />
        <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.7rem", letterSpacing: "0.1em" }}>BACK TO TEAM</Typography>
      </Box>

      <PageBanner
        icon={<GroupsOutlinedIcon />}
        title="New Team Member"
        description="Add a new member to the NeuroDyne team."
        tag="ADMIN // NEW MEMBER"
        accentWord="New"
        iconColor="#00D4AA"
        iconLabel="TEAM"
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", px: 3, py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" onClick={() => navigate("/team")} sx={{ ...btnSx, borderColor: "rgba(108,99,255,0.2)", color: "text.secondary", "&:hover": { borderColor: "rgba(108,99,255,0.4)" } }}>
            Cancel
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={submitting ? <CircularProgress size={14} sx={{ color: "#10B981" }} /> : <SaveOutlinedIcon />}
            disabled={!canSubmit || submitting}
            onClick={handleSubmit}
            sx={{ ...btnSx, borderColor: "#10B98140", color: "#10B981", "&:hover": { borderColor: "#10B981", bgcolor: "#10B98108" }, "&.Mui-disabled": { borderColor: "rgba(108,99,255,0.1)", color: "text.secondary", opacity: 0.3 } }}
          >
            {submitting ? "Saving…" : "Add Member"}
          </Button>
        </Stack>
      </Box>

      {error && (
        <Box sx={{ px: 3, pt: 2 }}>
          <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
        </Box>
      )}

      <SectionLabel>Member Details</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        <Cell color="#00D4AA" index="00" colInRow={0} totalCols={2} animDelay={0}>
          <Stack spacing={2}>
            <TextField fullWidth size="small" label="Full Name" value={name} onChange={(e) => setName(e.target.value)} sx={inputSx} />
            <TextField fullWidth size="small" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} sx={inputSx} />
            <TextField
              fullWidth
              size="small"
              label="Temporary Password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Minimum 8 characters. Share this with the teammate securely."
              sx={inputSx}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Generate password">
                        <IconButton size="small" onClick={() => setPassword(generatePassword())} edge="end">
                          <CasinoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Stack>
        </Cell>
        <Cell color="#6C63FF" index="01" colInRow={1} totalCols={2} animDelay={0.1}>
          <Stack spacing={2}>
            <TextField select fullWidth size="small" label="Role" value={role} onChange={(e) => setRole(e.target.value)} sx={inputSx}>
              {ROLES.map((r) => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
            </TextField>
            <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7 }}>
              The account is created first, then the selected staff role and its default permissions are assigned.
            </Typography>
          </Stack>
        </Cell>
      </Box>

      {canSubmit && (
        <>
          <SectionLabel>Preview</SectionLabel>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" } }}>
            <Cell color={color} index="P0" colInRow={0} totalCols={3} animDelay={0.2}>
              <Stack sx={{ alignItems: "center" }} direction="row" spacing={2}>
                <Avatar sx={{ bgcolor: `${color}20`, color, width: 48, height: 48, fontSize: 16, fontWeight: 700, border: `2px solid ${color}30` }}>
                  {initials || "?"}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{name}</Typography>
                  <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", color: "text.secondary", opacity: 0.6 }}>{roleLabel}</Typography>
                  <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", color: "text.secondary", opacity: 0.5 }}>{email}</Typography>
                </Box>
              </Stack>
            </Cell>
          </Box>
        </>
      )}
    </Box>
  );
}
