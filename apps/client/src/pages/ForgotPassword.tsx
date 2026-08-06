import { useState } from "react";
import { Link } from "react-router";
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

const api = new ApiClient({
  baseUrl: import.meta.env.VITE_API_URL || "http://localhost:4000",
  getToken: () => null,
});

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.forgotPassword(email.trim());
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
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
        Reset your password
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Enter your account email and we will send a reset link if it exists.
      </Typography>

      {done ? (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 1 }}>
          If an account exists for that email, a reset link has been sent. Check your inbox
          (and spam) for a message from NeuroDyne.
        </Alert>
      ) : (
        <BoxForm onSubmit={onSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
              {error}
            </Alert>
          )}
          <TextField
            label="Email"
            type="email"
            required
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={submitting || !email.trim()}
            sx={{ py: 1.25, fontWeight: 600 }}
          >
            {submitting ? <CircularProgress size={22} color="inherit" /> : "Send reset link"}
          </Button>
        </BoxForm>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 3.5 }}>
        Remember your password?{" "}
        <MuiLink component={Link} to="/login" sx={{ color: "#6C63FF", fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
          Back to sign in
        </MuiLink>
      </Typography>
    </AuthLayout>
  );
}

function BoxForm({ children, onSubmit }: { children: React.ReactNode; onSubmit: (e: React.FormEvent) => void }) {
  return (
    <form onSubmit={onSubmit} noValidate>
      {children}
    </form>
  );
}
