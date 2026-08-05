import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  Typography,
  Alert,
  Link as MuiLink,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { Rocket, Timeline, ChatBubbleOutlined } from "@mui/icons-material";
import AuthLayout from "@/components/auth/AuthLayout";
import { ApiClient } from "@neurodyne/shared";

const cards = [
  { icon: <Rocket sx={{ fontSize: 28 }} />, title: "Track Your Projects", desc: "Follow your project from concept through specifications to final delivery." },
  { icon: <Timeline sx={{ fontSize: 28 }} />, title: "Real-Time Updates", desc: "Get instant visibility into milestones, tasks, and sprint progress." },
  { icon: <ChatBubbleOutlined sx={{ fontSize: 28 }} />, title: "Direct Communication", desc: "Message your project team and provide feedback without leaving the portal." },
];

const api = new ApiClient(import.meta.env.VITE_API_URL || "http://localhost:4000");

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get("token") ?? "", [params]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("Reset token is missing. Use the link from your email.");
      return;
    }
    setSubmitting(true);
    try {
      await api.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      brandTitle="NeuroDyne"
      brandSubtitle="Your client portal for tracking projects, managing invoices, and collaborating with your team."
      cards={cards}
    >
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
        Choose a new password
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Enter and confirm your new password below.
      </Typography>

      {done ? (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 1 }}>
          Password updated. You can{" "}
          <MuiLink component={Link} to="/login" sx={{ fontWeight: 600 }}>
            sign in
          </MuiLink>{" "}
          with your new password.
        </Alert>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
              {error}
            </Alert>
          )}
          {!token && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 1 }}>
              This page needs a valid reset token from your email link.
            </Alert>
          )}
          <TextField
            label="New password"
            type="password"
            required
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Confirm password"
            type="password"
            required
            fullWidth
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={submitting || !token}
            sx={{ py: 1.25, fontWeight: 600 }}
          >
            {submitting ? <CircularProgress size={22} color="inherit" /> : "Update password"}
          </Button>
        </form>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 3.5 }}>
        <MuiLink component={Link} to="/login" sx={{ color: "#6C63FF", fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
          Back to sign in
        </MuiLink>
      </Typography>
    </AuthLayout>
  );
}
