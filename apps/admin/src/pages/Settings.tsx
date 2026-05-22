import { useState, type ReactNode } from "react";
import { useSearchParams, useNavigate } from "react-router";
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Avatar,
  Stack,
  IconButton,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import AutoModeOutlinedIcon from "@mui/icons-material/AutoModeOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PageBanner from "@/components/shared/PageBanner";
import Cell from "@/components/shared/AnimatedCard";

const BORDER = "rgba(108, 99, 255, 0.12)";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "rgba(108, 99, 255, 0.04)",
    "& fieldset": { borderColor: BORDER },
    "&:hover fieldset": { borderColor: "rgba(108, 99, 255, 0.25)" },
    "&.Mui-focused fieldset": { borderColor: "#6C63FF" },
  },
  "& .MuiInputLabel-root": { fontFamily: "monospace", fontSize: "0.8rem" },
  "& .MuiOutlinedInput-input": { fontFamily: "monospace", fontSize: "0.85rem" },
};

const switchSx = {
  "& .MuiSwitch-switchBase.Mui-checked": { color: "#00D4AA" },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#00D4AA60" },
};

function Label({ children, color = "#6C63FF" }: { children: string; color?: string }) {
  return (
    <Typography
      sx={{
        fontFamily: "monospace",
        fontSize: "0.6rem",
        textTransform: "uppercase",
        letterSpacing: "0.2em",
        color,
        filter: `drop-shadow(0 0 4px ${color}40)`,
      }}
    >
      {children}
    </Typography>
  );
}

// ── Tab definitions ──────────────────────────────────────────────────────────

interface SettingsTab {
  key: string;
  label: string;
  icon: ReactNode;
  color: string;
}

const tabs: SettingsTab[] = [
  { key: "profile", label: "Profile", icon: <PersonOutlinedIcon sx={{ fontSize: 18 }} />, color: "#6C63FF" },
  { key: "security", label: "Security", icon: <LockOutlinedIcon sx={{ fontSize: 18 }} />, color: "#EF4444" },
  { key: "appearance", label: "Appearance", icon: <PaletteOutlinedIcon sx={{ fontSize: 18 }} />, color: "#8B5CF6" },
  { key: "notifications", label: "Notifications", icon: <NotificationsOutlinedIcon sx={{ fontSize: 18 }} />, color: "#F59E0B" },
];

// ── Tab panels ───────────────────────────────────────────────────────────────

function ProfileTab() {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "auto 1fr" } }}>
      <Cell color="#6C63FF" index="P0" colInRow={0} totalCols={2} minH={200}>
        <Stack alignItems="center" spacing={2} sx={{ px: { xs: 2, md: 4 } }}>
          <Box sx={{ position: "relative" }}>
            <Avatar
              sx={{
                width: 96,
                height: 96,
                fontSize: 32,
                fontWeight: 700,
                bgcolor: "#6C63FF20",
                color: "#6C63FF",
                border: "2px solid #6C63FF30",
              }}
            >
              AM
            </Avatar>
            <IconButton
              size="small"
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                bgcolor: "#6C63FF",
                color: "#fff",
                width: 28,
                height: 28,
                "&:hover": { bgcolor: "#5A52E0" },
              }}
            >
              <CameraAltOutlinedIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="subtitle2" fontWeight={600}>Ayo Adeyemi</Typography>
            <Typography
              sx={{
                fontFamily: "monospace",
                fontSize: "0.6rem",
                color: "#6C63FF",
                letterSpacing: "0.1em",
                opacity: 0.7,
              }}
            >
              ADMIN
            </Typography>
          </Box>
        </Stack>
      </Cell>

      <Cell color="#6C63FF" index="P1" colInRow={1} totalCols={2} minH={200}>
        <Stack spacing={2.5} sx={{ maxWidth: 500 }}>
          <Label>Personal Information</Label>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField label="First Name" defaultValue="Ayo" size="small" fullWidth sx={fieldSx} />
            <TextField label="Last Name" defaultValue="Adeyemi" size="small" fullWidth sx={fieldSx} />
          </Stack>
          <TextField label="Email" defaultValue="admin@neurodynecorp.com" size="small" fullWidth sx={fieldSx} />
          <TextField label="Phone" defaultValue="+1-555-0100" size="small" fullWidth sx={fieldSx} />
          <TextField label="Company" defaultValue="NeuroDyne Corp" size="small" fullWidth sx={fieldSx} />
          <Box sx={{ pt: 0.5 }}>
            <Button
              variant="contained"
              size="small"
              sx={{
                fontFamily: "monospace",
                fontSize: "0.75rem",
                letterSpacing: "0.08em",
                px: 3,
                background: "linear-gradient(135deg, #6C63FF, #8B85FF)",
                "&:hover": { background: "linear-gradient(135deg, #5A52E0, #7A73FF)" },
              }}
            >
              Save Changes
            </Button>
          </Box>
        </Stack>
      </Cell>
    </Box>
  );
}

function SecurityTab() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
      <Cell color="#EF4444" index="S0" colInRow={0} totalCols={2} minH={180}>
        <Stack spacing={2.5} sx={{ maxWidth: 400 }}>
          <Label color="#EF4444">Change Password</Label>
          <TextField
            label="Current Password"
            type={showCurrent ? "text" : "password"}
            size="small"
            fullWidth
            sx={fieldSx}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowCurrent(!showCurrent)} edge="end">
                      {showCurrent ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            label="New Password"
            type={showNew ? "text" : "password"}
            size="small"
            fullWidth
            sx={fieldSx}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowNew(!showNew)} edge="end">
                      {showNew ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            label="Confirm New Password"
            type={showNew ? "text" : "password"}
            size="small"
            fullWidth
            sx={fieldSx}
          />
          <Box sx={{ pt: 0.5 }}>
            <Button
              variant="contained"
              size="small"
              sx={{
                fontFamily: "monospace",
                fontSize: "0.75rem",
                letterSpacing: "0.08em",
                px: 3,
                background: "linear-gradient(135deg, #EF4444, #F87171)",
                "&:hover": { background: "linear-gradient(135deg, #DC2626, #EF4444)" },
              }}
            >
              Update Password
            </Button>
          </Box>
        </Stack>
      </Cell>

      <Cell color="#F59E0B" index="S1" colInRow={1} totalCols={2} minH={180}>
        <Stack spacing={3}>
          <Label color="#F59E0B">Session & Security</Label>
          <Stack spacing={1.5}>
            <FormControlLabel control={<Switch defaultChecked size="small" sx={switchSx} />} label={<Typography variant="body2">Two-factor authentication</Typography>} />
            <FormControlLabel control={<Switch defaultChecked size="small" sx={switchSx} />} label={<Typography variant="body2">Login email alerts</Typography>} />
            <FormControlLabel control={<Switch size="small" sx={switchSx} />} label={<Typography variant="body2">Remember devices for 30 days</Typography>} />
          </Stack>
          <Box>
            <Typography sx={{ fontFamily: "monospace", fontSize: "0.65rem", color: "text.secondary", opacity: 0.5, mb: 0.5 }}>
              LAST LOGIN
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Today at 2:00 PM from 192.168.1.x
            </Typography>
          </Box>
          <Box sx={{ borderTop: `1px solid ${BORDER}`, pt: 2.5 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} justifyContent="space-between">
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ color: "#EF4444", mb: 0.25 }}>Delete Account</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.5 }}>
                  Permanently remove your account and all data.
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DeleteOutlineIcon sx={{ fontSize: 14 }} />}
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.65rem",
                  letterSpacing: "0.08em",
                  color: "#EF4444",
                  borderColor: "#EF444430",
                  flexShrink: 0,
                  "&:hover": { borderColor: "#EF4444", bgcolor: "#EF444410" },
                }}
              >
                Delete
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Cell>
    </Box>
  );
}

function AppearanceTab() {
  const [theme, setTheme] = useState("dark");
  const [accent, setAccent] = useState("#6C63FF");

  const accents = [
    { value: "#6C63FF", label: "Indigo" },
    { value: "#00D4AA", label: "Teal" },
    { value: "#F59E0B", label: "Amber" },
    { value: "#EF4444", label: "Red" },
    { value: "#8B5CF6", label: "Violet" },
    { value: "#EC4899", label: "Pink" },
  ];

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
      <Cell color="#8B5CF6" index="A0" colInRow={0} totalCols={2} minH={180}>
        <Stack spacing={3}>
          <Label color="#8B5CF6">Theme</Label>
          <ToggleButtonGroup
            value={theme}
            exclusive
            onChange={(_, v) => v && setTheme(v)}
            sx={{
              "& .MuiToggleButton-root": {
                flex: 1,
                border: `1px solid ${BORDER}`,
                color: "text.secondary",
                fontFamily: "monospace",
                fontSize: "0.7rem",
                letterSpacing: "0.1em",
                py: 1.5,
                "&.Mui-selected": {
                  bgcolor: "#8B5CF615",
                  color: "#8B5CF6",
                  borderColor: "#8B5CF640",
                  "&:hover": { bgcolor: "#8B5CF620" },
                },
              },
            }}
          >
            <ToggleButton value="dark">
              <DarkModeOutlinedIcon sx={{ mr: 1, fontSize: 18 }} /> Dark
            </ToggleButton>
            <ToggleButton value="light">
              <LightModeOutlinedIcon sx={{ mr: 1, fontSize: 18 }} /> Light
            </ToggleButton>
            <ToggleButton value="system">
              <AutoModeOutlinedIcon sx={{ mr: 1, fontSize: 18 }} /> System
            </ToggleButton>
          </ToggleButtonGroup>
          <Box>
            <Typography
              sx={{
                fontFamily: "monospace",
                fontSize: "0.6rem",
                color: "text.secondary",
                opacity: 0.5,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                mb: 1.5,
              }}
            >
              Accent Color
            </Typography>
            <Stack direction="row" spacing={1.5}>
              {accents.map((a) => (
                <Box
                  key={a.value}
                  onClick={() => setAccent(a.value)}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    bgcolor: a.value,
                    cursor: "pointer",
                    border: accent === a.value ? "2px solid #fff" : "2px solid transparent",
                    boxShadow: accent === a.value ? `0 0 12px ${a.value}60` : "none",
                    transition: "all 0.2s",
                    "&:hover": { transform: "scale(1.15)" },
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Stack>
      </Cell>

      <Cell color="#00D4AA" index="A1" colInRow={1} totalCols={2} minH={180}>
        <Stack spacing={3}>
          <Label color="#00D4AA">Display Preferences</Label>
          <Stack spacing={1.5}>
            <FormControlLabel control={<Switch defaultChecked size="small" sx={switchSx} />} label={<Typography variant="body2">Compact sidebar</Typography>} />
            <FormControlLabel control={<Switch defaultChecked size="small" sx={switchSx} />} label={<Typography variant="body2">Show animations</Typography>} />
            <FormControlLabel control={<Switch defaultChecked size="small" sx={switchSx} />} label={<Typography variant="body2">Show grid indices</Typography>} />
            <FormControlLabel control={<Switch size="small" sx={switchSx} />} label={<Typography variant="body2">High contrast mode</Typography>} />
          </Stack>
        </Stack>
      </Cell>
    </Box>
  );
}

function NotificationsTab() {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" } }}>
      <Cell color="#6C63FF" index="N0" colInRow={0} totalCols={3}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <NotificationsOutlinedIcon sx={{ fontSize: 18, color: "#6C63FF" }} />
            <Label>In-App</Label>
          </Stack>
          <FormControlLabel control={<Switch defaultChecked size="small" sx={switchSx} />} label={<Typography variant="body2">Project updates</Typography>} />
          <FormControlLabel control={<Switch defaultChecked size="small" sx={switchSx} />} label={<Typography variant="body2">Task assignments</Typography>} />
          <FormControlLabel control={<Switch defaultChecked size="small" sx={switchSx} />} label={<Typography variant="body2">New messages</Typography>} />
          <FormControlLabel control={<Switch size="small" sx={switchSx} />} label={<Typography variant="body2">Invoice events</Typography>} />
        </Stack>
      </Cell>

      <Cell color="#00D4AA" index="N1" colInRow={1} totalCols={3}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <PersonOutlinedIcon sx={{ fontSize: 18, color: "#00D4AA" }} />
            <Label color="#00D4AA">Email</Label>
          </Stack>
          <FormControlLabel control={<Switch defaultChecked size="small" sx={switchSx} />} label={<Typography variant="body2">Daily summary</Typography>} />
          <FormControlLabel control={<Switch size="small" sx={switchSx} />} label={<Typography variant="body2">Weekly digest</Typography>} />
          <FormControlLabel control={<Switch defaultChecked size="small" sx={switchSx} />} label={<Typography variant="body2">Critical alerts</Typography>} />
          <FormControlLabel control={<Switch size="small" sx={switchSx} />} label={<Typography variant="body2">Marketing updates</Typography>} />
        </Stack>
      </Cell>

      <Cell color="#8B85FF" index="N2" colInRow={2} totalCols={3}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <LockOutlinedIcon sx={{ fontSize: 18, color: "#8B85FF" }} />
            <Label color="#8B85FF">Integrations</Label>
          </Stack>
          <FormControlLabel control={<Switch defaultChecked size="small" sx={switchSx} />} label={<Typography variant="body2">Slack notifications</Typography>} />
          <FormControlLabel control={<Switch size="small" sx={switchSx} />} label={<Typography variant="body2">Discord webhooks</Typography>} />
          <FormControlLabel control={<Switch size="small" sx={switchSx} />} label={<Typography variant="body2">Microsoft Teams</Typography>} />
        </Stack>
      </Cell>
    </Box>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function Settings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabKeys = tabs.map((t) => t.key);
  const urlTab = searchParams.get("tab");
  const activeTab = urlTab && tabKeys.includes(urlTab) ? urlTab : "profile";
  const setActiveTab = (key: string) => navigate(`/settings?tab=${key}`, { replace: true });

  const _current = tabs.find((t) => t.key === activeTab)!;
  void _current;

  return (
    <Box>
      <PageBanner
        icon={<SettingsOutlinedIcon />}
        title="Account Settings"
        description="Manage your profile, security, appearance, and notification preferences."
        tag="ADMIN // SETTINGS"
        accentWord="Settings"
        iconColor="#94A3B8"
        iconLabel="CONFIG"
      />

      {/* Tab bar */}
      <Box
        sx={{
          display: "flex",
          borderBottom: `1px solid ${BORDER}`,
          overflowX: "auto",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {tabs.map((tab, i) => {
          const isActive = tab.key === activeTab;
          return (
            <Box
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: { xs: 2, md: 3 },
                py: 2,
                cursor: "pointer",
                position: "relative",
                flexShrink: 0,
                borderRight: i < tabs.length - 1 ? `1px solid ${BORDER}` : "none",
                bgcolor: isActive ? `${tab.color}06` : "transparent",
                transition: "all 0.25s",
                "&:hover": { bgcolor: `${tab.color}08` },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: 0,
                  left: isActive ? "10%" : "50%",
                  right: isActive ? "10%" : "50%",
                  height: 2,
                  background: `linear-gradient(90deg, transparent, ${tab.color}, transparent)`,
                  opacity: isActive ? 1 : 0,
                  transition: "all 0.3s",
                },
              }}
            >
              <Typography
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.5rem",
                  color: isActive ? tab.color : "text.secondary",
                  opacity: isActive ? 0.7 : 0.3,
                  letterSpacing: "0.1em",
                  transition: "all 0.25s",
                }}
              >
                {String(i).padStart(2, "0")}
              </Typography>
              <Box
                sx={{
                  color: isActive ? tab.color : "text.secondary",
                  opacity: isActive ? 1 : 0.5,
                  display: "flex",
                  filter: isActive ? `drop-shadow(0 0 4px ${tab.color}50)` : "none",
                  transition: "all 0.25s",
                }}
              >
                {tab.icon}
              </Box>
              <Typography
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: "0.08em",
                  color: isActive ? tab.color : "text.secondary",
                  transition: "all 0.25s",
                  display: { xs: "none", sm: "block" },
                }}
              >
                {tab.label}
              </Typography>
            </Box>
          );
        })}

        {/* Spacer to fill remaining width */}
        <Box sx={{ flex: 1, borderBottom: "none" }} />
      </Box>

      {/* Tab content */}
      <Box>
        {activeTab === "profile" && <ProfileTab />}
        {activeTab === "security" && <SecurityTab />}
        {activeTab === "appearance" && <AppearanceTab />}
        {activeTab === "notifications" && <NotificationsTab />}
      </Box>
    </Box>
  );
}
