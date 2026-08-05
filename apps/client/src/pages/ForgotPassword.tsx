import { Link } from "react-router";
import {
  Typography,
  Alert,
  Link as MuiLink,
} from "@mui/material";
import { Rocket, Timeline, ChatBubbleOutlined } from "@mui/icons-material";
import AuthLayout from "@/components/auth/AuthLayout";

const cards = [
  { icon: <Rocket sx={{ fontSize: 28 }} />, title: "Track Your Projects", desc: "Follow your project from concept through specifications to final delivery." },
  { icon: <Timeline sx={{ fontSize: 28 }} />, title: "Real-Time Updates", desc: "Get instant visibility into milestones, tasks, and sprint progress." },
  { icon: <ChatBubbleOutlined sx={{ fontSize: 28 }} />, title: "Direct Communication", desc: "Message your project team and provide feedback without leaving the portal." },
];

export default function ForgotPassword() {
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
        Self-service password reset is not available yet.
      </Typography>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 1 }}>
        Contact your NeuroDyne project manager or email{" "}
        <MuiLink href="mailto:support@neurodynecorp.com" sx={{ fontWeight: 600 }}>
          support@neurodynecorp.com
        </MuiLink>{" "}
        and we will help you regain access.
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
