import { useState, useEffect, type FormEvent } from "react";
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
  CircularProgress,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import PageBanner from "@/components/shared/PageBanner";
import AnimatedCard from "@/components/shared/AnimatedCard";
import { useAuth } from "@/context/AuthContext";

export default function Settings() {
  const { user, updateProfile } = useAuth();

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
        description="Manage your profile, notification preferences, and account security."
      />

      <AnimatedCard delay={0} sx={{ p: 3, mb: 3 }}>
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
              <Grid size={6}>
                <TextField
                  required
                  fullWidth
                  label="First Name"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  slotProps={{ htmlInput: { maxLength: 100 } }}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  required
                  fullWidth
                  label="Last Name"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  slotProps={{ htmlInput: { maxLength: 100 } }}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={user?.email ?? ""}
                  disabled
                  helperText="Contact support to change your sign-in email."
                />
              </Grid>
              <Grid size={6}>
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

      <AnimatedCard delay={1} sx={{ p: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Notification Preferences</Typography>
          <Alert severity="info">
            Per-channel notification preferences are not available yet. You will continue receiving the default notification set (project updates, messages, and invoice alerts). Contact your project manager if you need delivery changes.
          </Alert>
        </CardContent>
      </AnimatedCard>

      <AnimatedCard delay={2} sx={{ p: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Security</Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Password changes and account deletion from Settings are not available yet.
          </Alert>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Contact your NeuroDyne project manager if you need a password reset or account closure.
          </Typography>
        </CardContent>
      </AnimatedCard>
    </Box>
  );
}
