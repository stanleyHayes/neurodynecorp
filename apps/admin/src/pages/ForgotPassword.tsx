import { Link } from "react-router";
import {
  Typography,
  Alert,
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
  return (
    <AuthLayout
      brandTitle="NeuroDyne Admin"
      brandSubtitle="The command center for managing your software engineering platform."
      cards={cards}
    >
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
        Reset your password
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Self-service password reset is not available yet.
      </Typography>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 1 }}>
        Ask another administrator to reset your account, or email{" "}
        <MuiLink href="mailto:support@neurodynecorp.com" sx={{ fontWeight: 600 }}>
          support@neurodynecorp.com
        </MuiLink>
        .
      </Alert>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 3.5 }}>
        Remember your password?{" "}
        <MuiLink component={Link} to="/login" sx={{ color: "#6C63FF", fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
          Back to sign in
        </MuiLink>
      </Typography>
    </AuthLayout>
  );
}
