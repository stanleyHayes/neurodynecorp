import { useState, useEffect, type FormEvent, type ReactElement, type ReactNode } from "react";
import {
  Box,
  Typography,
  CardContent,
  TextField,
  Button,
  Grid,
  Divider,
  Avatar,
  Alert,
  AlertTitle,
  CircularProgress,
  Stack,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import PageBanner from "@/components/shared/PageBanner";
import AnimatedCard from "@/components/shared/AnimatedCard";
import { useAuth } from "@/context/AuthContext";
import { useThemeMode } from "@/theme/ThemeContext";
import { useSoundEnabled } from "@/hooks/useSound";

/**
 * The account menu links to /settings?tab=profile, ?tab=security,
 * ?tab=appearance and ?tab=notifications. This page used to ignore the query
 * entirely, so all four items landed on the same unscrolled page — and
 * "Appearance" promised a section that did not exist anywhere in the app.
 *
 * The keys below are the contract with
 * `components/layout/DashboardLayout.tsx`. Changing one means changing both.
 */
const TAB_KEYS = ["profile", "appearance", "notifications", "security"] as const;
type TabKey = (typeof TAB_KEYS)[number];

// MUI types Tab's `icon` as ReactElement, not ReactNode.
const TABS: { key: TabKey; label: string; icon: ReactElement }[] = [
  { key: "profile", label: "Profile", icon: <PersonOutlinedIcon /> },
  { key: "appearance", label: "Appearance", icon: <PaletteOutlinedIcon /> },
  { key: "notifications", label: "Notifications", icon: <NotificationsNoneOutlinedIcon /> },
  { key: "security", label: "Security", icon: <LockOutlinedIcon /> },
];

function isTabKey(value: string | null): value is TabKey {
  return value !== null && (TAB_KEYS as readonly string[]).includes(value);
}

function Panel({ activeTab, tab, children }: { activeTab: TabKey; tab: TabKey; children: ReactNode }) {
  if (activeTab !== tab) return null;
  return (
    <Box role="tabpanel" id={`settings-panel-${tab}`} aria-labelledby={`settings-tab-${tab}`}>
      {children}
    </Box>
  );
}

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const { enabled: soundEnabled, toggle: toggleSound } = useSoundEnabled();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const urlTab = searchParams.get("tab");
  const activeTab: TabKey = isTabKey(urlTab) ? urlTab : "profile";
  // `replace` so tab changes do not stack up in history and make Back feel
  // broken on the way out of Settings.
  const setActiveTab = (key: TabKey) => navigate(`/settings?tab=${key}`, { replace: true });

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    company: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ severity: "success" | "error" | "info"; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    setForm({
      first_name: user.first_name ?? "",
      last_name: user.last_name ?? "",
      phone: user.phone ?? "",
      company: user.company ?? "",
    });
  }, [user]);

  const initials = `${form.first_name.charAt(0)}${form.last_name.charAt(0)}`.toUpperCase();
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
      setMessage({
        severity: "error",
        text: error instanceof Error ? error.message : "Unable to update your profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <PageBanner
        icon={<SettingsIcon />}
        title="Settings"
        description="Manage your profile, appearance, notification preferences, and account security."
      />

      <Tabs
        value={activeTab}
        onChange={(_, key: TabKey) => setActiveTab(key)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        aria-label="Settings sections"
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
      >
        {TABS.map((tab) => (
          <Tab
            key={tab.key}
            value={tab.key}
            label={tab.label}
            icon={tab.icon}
            iconPosition="start"
            id={`settings-tab-${tab.key}`}
            aria-controls={`settings-panel-${tab.key}`}
            sx={{ textTransform: "none", minHeight: 48 }}
          />
        ))}
      </Tabs>

      <Panel activeTab={activeTab} tab="profile">
        <AnimatedCard delay={0} sx={{ p: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>Profile</Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <Avatar sx={{ width: 72, height: 72, bgcolor: "primary.main", fontSize: "1.5rem" }}>{initials || "?"}</Avatar>
            </Box>
            {message && (
              <Alert severity={message.severity} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
                {message.text}
              </Alert>
            )}
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    required
                    fullWidth
                    label="First Name"
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    slotProps={{ htmlInput: { maxLength: 100 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    required
                    fullWidth
                    label="Last Name"
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    slotProps={{ htmlInput: { maxLength: 100 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={user?.email ?? ""}
                    disabled
                    helperText="Contact support to change your sign-in email."
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    slotProps={{ htmlInput: { maxLength: 30 } }}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Company"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    slotProps={{ htmlInput: { maxLength: 200 } }}
                  />
                </Grid>
              </Grid>
              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 3 }}
                disabled={saving || !hasRequiredNames}
              >
                {saving ? <><CircularProgress size={14} color="inherit" sx={{ mr: 1 }} />Saving…</> : "Save Changes"}
              </Button>
            </Box>
          </CardContent>
        </AnimatedCard>
      </Panel>

      <Panel activeTab={activeTab} tab="appearance">
        <AnimatedCard delay={0} sx={{ p: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 0.5 }}>Appearance</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              These preferences are stored on this device and apply to this browser only.
            </Typography>

            <Typography variant="subtitle2" sx={{ mb: 1 }}>Theme</Typography>
            <ToggleButtonGroup
              exclusive
              value={mode}
              onChange={(_, next) => {
                if (next && next !== mode) toggleMode();
              }}
              aria-label="Colour theme"
              sx={{ mb: 3 }}
            >
              <ToggleButton value="dark" aria-label="Dark theme" sx={{ textTransform: "none", px: 2.5 }}>
                <DarkModeOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
                Dark
              </ToggleButton>
              <ToggleButton value="light" aria-label="Light theme" sx={{ textTransform: "none", px: 2.5 }}>
                <LightModeOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
                Light
              </ToggleButton>
            </ToggleButtonGroup>

            <Divider sx={{ mb: 2 }} />

            <Typography variant="subtitle2" sx={{ mb: 1 }}>Interface sound</Typography>
            <FormControlLabel
              control={<Switch checked={soundEnabled} onChange={toggleSound} />}
              label={soundEnabled ? "Sound effects on" : "Sound effects off"}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Short confirmation tones on actions such as sending a message. Off by default.
            </Typography>
          </CardContent>
        </AnimatedCard>
      </Panel>

      <Panel activeTab={activeTab} tab="notifications">
        <AnimatedCard delay={0} sx={{ p: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Notification Preferences</Typography>
            <Alert severity="info">
              <AlertTitle>Not configurable yet</AlertTitle>
              Per-channel notification preferences are not available yet. You will continue receiving the
              default notification set — project updates, messages, and invoice alerts. Contact your project
              manager if you need delivery changes.
            </Alert>
          </CardContent>
        </AnimatedCard>
      </Panel>

      <Panel activeTab={activeTab} tab="security">
        <AnimatedCard delay={0} sx={{ p: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Security</Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
              <AlertTitle>Security controls live on their own page</AlertTitle>
              Active sessions, API keys and data privacy requests are managed under Security.
              <Box sx={{ mt: 1.5 }}>
                <Button
                  component={RouterLink}
                  to="/security"
                  variant="outlined"
                  size="small"
                  startIcon={<LockOutlinedIcon />}
                  sx={{ textTransform: "none" }}
                >
                  Open Security
                </Button>
              </Box>
            </Alert>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1}>
              <Typography variant="subtitle2">Password and account closure</Typography>
              <Typography variant="body2" color="text.secondary">
                Changing your password or closing your account from here is not available yet. Use the
                password reset link on the sign-in page, or contact your Neurodyne project manager for an
                account closure.
              </Typography>
            </Stack>
          </CardContent>
        </AnimatedCard>
      </Panel>
    </Box>
  );
}
