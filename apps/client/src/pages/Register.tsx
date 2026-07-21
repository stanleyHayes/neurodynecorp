import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Stack,
  Grid,
  Link as MuiLink,
} from "@mui/material";
import { Visibility, VisibilityOff, CheckCircleOutlined } from "@mui/icons-material";
import { useAuth } from "@/context/AuthContext";
import AuthLayout from "@/components/auth/AuthLayout";

const cards = [
  { icon: <CheckCircleOutlined sx={{ fontSize: 28, color: "#00D4AA" }} />, title: "Full Project Visibility", desc: "Track your project lifecycle from concept to delivery." },
  { icon: <CheckCircleOutlined sx={{ fontSize: 28, color: "#00D4AA" }} />, title: "Documents & Deliverables", desc: "Download specifications, documents, and final assets." },
  { icon: <CheckCircleOutlined sx={{ fontSize: 28, color: "#00D4AA" }} />, title: "Billing & Payments", desc: "Manage invoices and view your complete payment history." },
];

export default function Register() {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const update = (fields: Partial<typeof form>) =>
    setForm((prev) => ({ ...prev, ...fields }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    try {
      await register({
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        company: form.company,
        phone: form.phone,
      });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    }
  };

  return (
    <AuthLayout
      brandTitle="NeuroDyne"
      brandSubtitle="Join hundreds of clients who trust NeuroDyne Corp to turn their ideas into production-ready software."
      cards={cards}
    >
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
        Create your account
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Get started with your client portal
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <TextField fullWidth label="First Name" required autoFocus value={form.first_name} onChange={(e) => update({ first_name: e.target.value })} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="Last Name" required value={form.last_name} onChange={(e) => update({ last_name: e.target.value })} />
            </Grid>
          </Grid>

          <TextField fullWidth label="Email" type="email" required autoComplete="email" value={form.email} onChange={(e) => update({ email: e.target.value })} />

          <Grid container spacing={2}>
            <Grid size={6}>
              <TextField fullWidth label="Company" value={form.company} onChange={(e) => update({ company: e.target.value })} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="Phone" value={form.phone} onChange={(e) => update({ phone: e.target.value })} />
            </Grid>
          </Grid>

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => update({ password: e.target.value })}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" size="small" sx={{ color: "text.secondary" }}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField fullWidth label="Confirm Password" type={showPassword ? "text" : "password"} required autoComplete="new-password" value={form.confirmPassword} onChange={(e) => update({ confirmPassword: e.target.value })} />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={isLoading}
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
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Create Account"}
          </Button>
        </Stack>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 3.5 }}>
        Already have an account?{" "}
        <MuiLink component={Link} to="/login" sx={{ color: "#6C63FF", fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
          Sign in
        </MuiLink>
      </Typography>
    </AuthLayout>
  );
}
