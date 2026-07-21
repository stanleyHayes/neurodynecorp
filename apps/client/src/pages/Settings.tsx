import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CardContent,
  TextField,
  Button,
  Stack,
  Grid,
  Divider,
  Switch,
  FormControlLabel,
  Avatar,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import PageBanner from "@/components/shared/PageBanner";
import AnimatedCard from "@/components/shared/AnimatedCard";
import { useAuth } from "@/context/AuthContext";

export default function Settings() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
  });
  const [notifs, setNotifs] = useState({
    email_updates: true,
    status_changes: true,
    new_messages: true,
    invoices: true,
  });

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name ?? "",
        last_name: user.last_name ?? "",
        email: user.email ?? "",
        phone: (user as any).phone ?? "",
        company: user.company ?? "",
      });
    }
  }, [user]);

  const initials = `${form.first_name.charAt(0)}${form.last_name.charAt(0)}`.toUpperCase();

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
          <Stack direction="row" spacing={3} sx={{ alignItems: "center", mb: 3 }}>
            <Avatar sx={{ width: 72, height: 72, bgcolor: "primary.main", fontSize: "1.5rem" }}>{initials || "?"}</Avatar>
            <Button variant="outlined" size="small">Change Avatar</Button>
          </Stack>
          <Grid container spacing={2}>
            <Grid size={6}>
              <TextField fullWidth label="First Name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="Last Name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth label="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </Grid>
          </Grid>
          <Button variant="contained" sx={{ mt: 3 }}>Save Changes</Button>
        </CardContent>
      </AnimatedCard>

      <AnimatedCard delay={1} sx={{ p: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Notification Preferences</Typography>
          <Stack spacing={1}>
            <FormControlLabel control={<Switch checked={notifs.email_updates} onChange={(e) => setNotifs({ ...notifs, email_updates: e.target.checked })} />} label="Email updates" />
            <FormControlLabel control={<Switch checked={notifs.status_changes} onChange={(e) => setNotifs({ ...notifs, status_changes: e.target.checked })} />} label="Project status changes" />
            <FormControlLabel control={<Switch checked={notifs.new_messages} onChange={(e) => setNotifs({ ...notifs, new_messages: e.target.checked })} />} label="New messages" />
            <FormControlLabel control={<Switch checked={notifs.invoices} onChange={(e) => setNotifs({ ...notifs, invoices: e.target.checked })} />} label="Invoice reminders" />
          </Stack>
        </CardContent>
      </AnimatedCard>

      <AnimatedCard delay={2} sx={{ p: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Security</Typography>
          <Stack spacing={2}>
            <TextField fullWidth label="Current Password" type="password" />
            <TextField fullWidth label="New Password" type="password" />
            <TextField fullWidth label="Confirm New Password" type="password" />
            <Button variant="contained" color="warning">Change Password</Button>
          </Stack>
          <Divider sx={{ my: 3 }} />
          <Button variant="outlined" color="error">Delete Account</Button>
        </CardContent>
      </AnimatedCard>
    </Box>
  );
}
