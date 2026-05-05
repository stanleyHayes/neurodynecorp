import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  Link as MuiLink,
} from "@mui/material";
import { Speed, Shield, BarChart } from "@mui/icons-material";
import AuthLayout from "@/components/auth/AuthLayout";

const cards = [
  { icon: <Speed sx={{ fontSize: 28 }} />, title: "Project Oversight", desc: "Monitor every project from intake to delivery in real time." },
  { icon: <Shield sx={{ fontSize: 28 }} />, title: "Role-Based Access", desc: "Control who sees what with granular permission management." },
  { icon: <BarChart sx={{ fontSize: 28 }} />, title: "Billing & Analytics", desc: "Track revenue, invoices, and client engagement from one dashboard." },
];

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      // TODO: integrate real password reset API
      await new Promise((r) => setTimeout(r, 1500));
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      brandTitle="NeuroDyne Admin"
      brandSubtitle="The command center for managing your software engineering platform."
      cards={cards}
    >
      <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
        Reset your password
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Enter your email and we'll send you a link to reset your password.
      </Typography>

      {sent ? (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          If an account exists with that email, you'll receive a password reset link shortly.
        </Alert>
      ) : (
        <>
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField label="Email address" type="email" fullWidth required autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 700,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #6C63FF, #8B85FF)",
                  boxShadow: "0 4px 16px rgba(108, 99, 255, 0.3)",
                  "&:hover": { background: "linear-gradient(135deg, #5B54EE, #7A75FF)", boxShadow: "0 6px 24px rgba(108, 99, 255, 0.4)" },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Send Reset Link"}
              </Button>
            </Stack>
          </Box>
        </>
      )}

      <Typography variant="body2" textAlign="center" color="text.secondary" sx={{ mt: 3.5 }}>
        Remember your password?{" "}
        <MuiLink component={Link} to="/login" sx={{ color: "#6C63FF", fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
          Back to sign in
        </MuiLink>
      </Typography>
    </AuthLayout>
  );
}
