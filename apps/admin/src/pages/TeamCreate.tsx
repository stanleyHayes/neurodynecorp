import { useState } from "react";
import { Box, Typography, TextField, MenuItem, Stack, Button, Avatar, Slider } from "@mui/material";
import { useNavigate } from "react-router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import PageBanner from "@/components/shared/PageBanner";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";

const BORDER = "rgba(108, 99, 255, 0.12)";

const ROLES = ["Admin", "Project Manager", "Developer", "QA"];

const roleColors: Record<string, string> = {
  Admin: "#6C63FF",
  "Project Manager": "#8B5CF6",
  Developer: "#00D4AA",
  QA: "#F59E0B",
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

export default function TeamCreate() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Developer");
  const [utilization, setUtilization] = useState(50);

  const canSubmit = name.trim() && email.trim();

  const initials = name
    .trim()
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const color = roleColors[role] ?? "#00D4AA";

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

      {/* Action bar */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", px: 3, py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" onClick={() => navigate("/team")} sx={{ ...btnSx, borderColor: "rgba(108,99,255,0.2)", color: "text.secondary", "&:hover": { borderColor: "rgba(108,99,255,0.4)" } }}>
            Cancel
          </Button>
          <Button variant="outlined" size="small" startIcon={<SaveOutlinedIcon />} disabled={!canSubmit} sx={{ ...btnSx, borderColor: "#10B98140", color: "#10B981", "&:hover": { borderColor: "#10B981", bgcolor: "#10B98108" }, "&.Mui-disabled": { borderColor: "rgba(108,99,255,0.1)", color: "text.secondary", opacity: 0.3 } }}>
            Add Member
          </Button>
        </Stack>
      </Box>

      {/* Form */}
      <SectionLabel>Member Details</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        <Cell color="#00D4AA" index="00" colInRow={0} totalCols={2} animDelay={0}>
          <Stack spacing={2}>
            <TextField fullWidth size="small" label="Full Name" value={name} onChange={(e) => setName(e.target.value)} sx={inputSx} />
            <TextField fullWidth size="small" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} sx={inputSx} />
          </Stack>
        </Cell>
        <Cell color="#6C63FF" index="01" colInRow={1} totalCols={2} animDelay={0.1}>
          <Stack spacing={2}>
            <TextField select fullWidth size="small" label="Role" value={role} onChange={(e) => setRole(e.target.value)} sx={inputSx}>
              {ROLES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
            <Box>
              <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "text.secondary", opacity: 0.5, mb: 1 }}>
                Initial Utilization — {utilization}%
              </Typography>
              <Slider
                value={utilization}
                onChange={(_, v) => setUtilization(v as number)}
                min={0}
                max={100}
                sx={{
                  color,
                  "& .MuiSlider-track": { bgcolor: color },
                  "& .MuiSlider-thumb": { bgcolor: color, border: `2px solid ${color}` },
                  "& .MuiSlider-rail": { bgcolor: "rgba(108,99,255,0.15)" },
                }}
              />
            </Box>
          </Stack>
        </Cell>
      </Box>

      {/* Preview */}
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
                  <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", color: "text.secondary", opacity: 0.6 }}>{role}</Typography>
                  <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", color: "text.secondary", opacity: 0.5 }}>{email}</Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
                <Box>
                  <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem", color: "text.secondary", opacity: 0.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>Projects</Typography>
                  <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>0</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem", color: "text.secondary", opacity: 0.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>Utilization</Typography>
                  <Typography variant="body2" sx={{ fontSize: "0.8rem", color }}>{utilization}%</Typography>
                </Box>
              </Stack>
            </Cell>
          </Box>
        </>
      )}
    </Box>
  );
}
