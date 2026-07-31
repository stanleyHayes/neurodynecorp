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
  Link as MuiLink,
} from "@mui/material";
import { Visibility, VisibilityOff, Speed, Shield, BarChart } from "@mui/icons-material";
import { useAuth } from "@/context/AuthContext";
import AuthLayout from "@/components/auth/AuthLayout";

const cards = [
  { icon: <Speed sx={{ fontSize: 28 }} />, title: "Project Oversight", desc: "Monitor every project from intake to delivery in real time." },
  { icon: <Shield sx={{ fontSize: 28 }} />, title: "Role-Based Access", desc: "Control who sees what with granular permission management." },
  { icon: <BarChart sx={{ fontSize: 28 }} />, title: "Billing & Analytics", desc: "Track revenue, invoices, and client engagement from one dashboard." },
];

export default function Login() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    }
  };

  return (
    <AuthLayout
      brandTitle="NeuroDyne Admin"
      brandSubtitle="The command center for managing your software engineering platform."
      cards={cards}
    >
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
        Welcome back
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Sign in to the management dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>{error}</Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          <TextField label="Email" type="email" fullWidth required autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <MuiLink component={Link} to="/forgot-password" sx={{ color: "#6C63FF", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
              Forgot password?
            </MuiLink>
          </Box>

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
              borderRadius: 1,
              background: "linear-gradient(135deg, #6C63FF, #8B85FF)",
              boxShadow: "0 4px 16px rgba(108, 99, 255, 0.3)",
              "&:hover": { background: "linear-gradient(135deg, #5B54EE, #7A75FF)", boxShadow: "0 6px 24px rgba(108, 99, 255, 0.4)" },
            }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
          </Button>
        </Stack>
      </Box>
    </AuthLayout>
  );
}
