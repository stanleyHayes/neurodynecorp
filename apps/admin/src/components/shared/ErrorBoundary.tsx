import { Component, type ReactNode } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";

interface State {
  hasError: boolean;
  error?: Error;
}

interface Props {
  children: ReactNode;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // In production, ship to your observability tool here
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: 3,
          textAlign: "center",
          background:
            "radial-gradient(ellipse at 30% 30%, rgba(108,99,255,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(0,212,170,0.06) 0%, transparent 50%), #0A0E1A",
        }}
      >
        <Box sx={{ maxWidth: 540 }}>
          <RocketLaunchOutlinedIcon sx={{ fontSize: 64, color: "#6C63FF", filter: "drop-shadow(0 0 20px rgba(108,99,255,0.5))", mb: 3 }} />
          <Typography
            sx={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "0.65rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#EF4444",
              opacity: 0.8,
              mb: 1.5,
            }}
          >
            // SYSTEM EXCEPTION
          </Typography>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.8rem", md: "2.4rem" },
              letterSpacing: "-0.02em",
              mb: 2,
              background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Something hit an unexpected branch.
          </Typography>
          <Typography sx={{ color: "text.secondary", opacity: 0.75, mb: 4, lineHeight: 1.7 }}>
            The page crashed mid-render. We've logged it. You can reload, or head back home and try a different route.
          </Typography>
          {this.state.error?.message && (
            <Box
              sx={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "0.75rem",
                bgcolor: "rgba(10,14,26,0.6)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 2,
                p: 2,
                mb: 4,
                textAlign: "left",
                color: "#fca5a5",
                maxHeight: 160,
                overflow: "auto",
              }}
            >
              {this.state.error.message}
            </Box>
          )}
          <Stack direction="row" spacing={2} sx={{ justifyContent: "center", flexWrap: "wrap", gap: 2 }}>
            <Button
              onClick={this.handleReset}
              startIcon={<RefreshIcon />}
              variant="contained"
              sx={{
                background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
                fontWeight: 700,
                px: 3,
              }}
            >
              Try again
            </Button>
            <Button
              href="/"
              variant="outlined"
              sx={{
                borderColor: "rgba(108,99,255,0.3)",
                color: "text.primary",
                "&:hover": { borderColor: "#6C63FF", bgcolor: "rgba(108,99,255,0.06)" },
              }}
            >
              Back to Home
            </Button>
          </Stack>
        </Box>
      </Box>
    );
  }
}
