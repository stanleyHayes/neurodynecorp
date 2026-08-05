import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useSearchParams, useNavigate } from "react-router";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  CircularProgress,
} from "@mui/material";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import PageBanner from "@/components/shared/PageBanner";
import Cell from "@/components/shared/AnimatedCard";
import { useAuth } from "@/context/AuthContext";
import { useThemeMode } from "@/theme/ThemeContext";

const BORDER = "rgba(108, 99, 255, 0.12)";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "rgba(108, 99, 255, 0.04)",
    "& fieldset": { borderColor: BORDER },
    "&:hover fieldset": { borderColor: "rgba(108, 99, 255, 0.25)" },
    "&.Mui-focused fieldset": { borderColor: "#6C63FF" },
  },
  "& .MuiInputLabel-root": { fontFamily: "'Outfit', sans-serif", fontSize: "0.8rem" },
  "& .MuiOutlinedInput-input": { fontFamily: "'Outfit', sans-serif", fontSize: "0.85rem" },
};

function Label({ children, color = "#6C63FF" }: { children: string; color?: string }) {
  return (
    <Typography
      sx={{
        fontFamily: "'Outfit', sans-serif",
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
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ first_name: "", last_name: "", phone: "", company: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ severity: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    setForm({
      first_name: user.first_name ?? "",
      last_name: user.last_name ?? "",
      phone: user.phone ?? "",
      company: user.company ?? "",
    });
  }, [user]);

  const displayName = [form.first_name, form.last_name].filter(Boolean).join(" ") || user?.email || "Account";
  const initials = `${form.first_name[0] ?? ""}${form.last_name[0] ?? ""}`.toUpperCase() || "AC";
  const hasRequiredNames = Boolean(form.first_name.trim() && form.last_name.trim());

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!hasRequiredNames) {
      setMessage({ severity: "error", text: "First and last name are required." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await updateProfile({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim(),
        company: form.company.trim(),
      });
      setMessage({ severity: "success", text: "Profile updated successfully." });
    } catch (error) {
      setMessage({ severity: "error", text: error instanceof Error ? error.message : "Unable to update your profile." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "auto 1fr" } }}>
      <Cell color="#6C63FF" index="P0" colInRow={0} totalCols={2} minH={200}>
        <Stack spacing={2} sx={{ alignItems: "center", px: { xs: 2, md: 4 } }}>
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
              {initials}
            </Avatar>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontWeight: 600 }} variant="subtitle2">{displayName}</Typography>
            <Typography
              sx={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "0.6rem",
                color: "#6C63FF",
                letterSpacing: "0.1em",
                opacity: 0.7,
              }}
            >
              {user?.role.replaceAll("_", " ").toUpperCase()}
            </Typography>
          </Box>
        </Stack>
      </Cell>

      <Cell color="#6C63FF" index="P1" colInRow={1} totalCols={2} minH={200}>
        <Stack component="form" onSubmit={handleSubmit} spacing={2.5} sx={{ maxWidth: 500 }}>
          <Label>Personal Information</Label>
          {message && <Alert severity={message.severity} onClose={() => setMessage(null)}>{message.text}</Alert>}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField required label="First Name" value={form.first_name} onChange={(e) => setForm((current) => ({ ...current, first_name: e.target.value }))} size="small" fullWidth sx={fieldSx} slotProps={{ htmlInput: { maxLength: 100 } }} />
            <TextField required label="Last Name" value={form.last_name} onChange={(e) => setForm((current) => ({ ...current, last_name: e.target.value }))} size="small" fullWidth sx={fieldSx} slotProps={{ htmlInput: { maxLength: 100 } }} />
          </Stack>
          <TextField label="Email" value={user?.email ?? ""} size="small" fullWidth disabled helperText="Contact an administrator to change your sign-in email." sx={fieldSx} />
          <TextField label="Phone" type="tel" value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} size="small" fullWidth sx={fieldSx} slotProps={{ htmlInput: { maxLength: 30 } }} />
          <TextField label="Company" value={form.company} onChange={(e) => setForm((current) => ({ ...current, company: e.target.value }))} size="small" fullWidth sx={fieldSx} slotProps={{ htmlInput: { maxLength: 200 } }} />
          <Box sx={{ pt: 0.5 }}>
            <Button
              variant="contained"
              size="small"
              type="submit"
              disabled={saving || !hasRequiredNames}
              sx={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "0.75rem",
                letterSpacing: "0.08em",
                px: 3,
                background: "linear-gradient(135deg, #6C63FF, #8B85FF)",
                "&:hover": { background: "linear-gradient(135deg, #5A52E0, #7A73FF)" },
              }}
            >
              {saving ? <><CircularProgress size={14} color="inherit" sx={{ mr: 1 }} />Saving…</> : "Save Changes"}
            </Button>
          </Box>
        </Stack>
      </Cell>
    </Box>
  );
}

function SecurityTab() {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
      <Cell color="#EF4444" index="S0" colInRow={0} totalCols={2} minH={180}>
        <Stack spacing={2}>
          <Label color="#EF4444">Change Password</Label>
          <Alert severity="info">
            Password changes from Settings are not available yet. Use an administrator-assisted reset for now.
          </Alert>
        </Stack>
      </Cell>

      <Cell color="#F59E0B" index="S1" colInRow={1} totalCols={2} minH={180}>
        <Stack spacing={2}>
          <Label color="#F59E0B">Session & Security</Label>
          <Alert severity="info">
            Two-factor authentication, login alerts, and account deletion are not wired to the API yet.
          </Alert>
        </Stack>
      </Cell>
    </Box>
  );
}

function AppearanceTab() {
  const { mode, setMode } = useThemeMode();

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
      <Cell color="#8B5CF6" index="A0" colInRow={0} totalCols={2} minH={180}>
        <Stack spacing={3}>
          <Label color="#8B5CF6">Theme</Label>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_, v) => v && setMode(v)}
            sx={{
              "& .MuiToggleButton-root": {
                flex: 1,
                border: `1px solid ${BORDER}`,
                color: "text.secondary",
                fontFamily: "'Outfit', sans-serif",
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
          </ToggleButtonGroup>
          <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.6 }}>
            Theme preference is saved on this device and matches the header toggle.
          </Typography>
        </Stack>
      </Cell>

      <Cell color="#00D4AA" index="A1" colInRow={1} totalCols={2} minH={180}>
        <Stack spacing={2}>
          <Label color="#00D4AA">Display Preferences</Label>
          <Alert severity="info">
            Compact sidebar, animations, and contrast preferences are not persisted yet. Use the theme control above for light/dark mode.
          </Alert>
        </Stack>
      </Cell>
    </Box>
  );
}

function NotificationsTab() {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr" } }}>
      <Cell color="#F59E0B" index="N0" colInRow={0} totalCols={1}>
        <Stack spacing={2}>
          <Stack sx={{ alignItems: "center" }} direction="row" spacing={1}>
            <NotificationsOutlinedIcon sx={{ fontSize: 18, color: "#F59E0B" }} />
            <Label color="#F59E0B">Notification Preferences</Label>
          </Stack>
          <Alert severity="info">
            In-app, email, and integration notification preferences are not persisted yet. You will continue receiving the default notification set.
          </Alert>
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
                  fontFamily: "'Outfit', sans-serif",
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
                  fontFamily: "'Outfit', sans-serif",
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
