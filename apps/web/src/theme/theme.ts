import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#6C63FF",
      light: "#8B85FF",
      dark: "#4B44CC",
    },
    secondary: {
      main: "#00D4AA",
      light: "#33DDBB",
      dark: "#00A888",
    },
    background: {
      default: "#0A0E1A",
      paper: "#111827",
    },
    text: {
      primary: "#F1F5F9",
      secondary: "#94A3B8",
    },
    error: {
      main: "#EF4444",
    },
    success: {
      main: "#10B981",
    },
    warning: {
      main: "#F59E0B",
    },
  },
  typography: {
    fontFamily: "'TT Squares', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontSize: "3.5rem",
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontSize: "2.5rem",
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontSize: "2rem",
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.7,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.6,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "10px 24px",
          fontSize: "0.95rem",
        },

      },
      variants: [
        {
          props: { variant: "contained", color: "primary" },
          style: {
          background: "linear-gradient(135deg, #6C63FF 0%, #8B85FF 100%)",
          "&:hover": {
            background: "linear-gradient(135deg, #5B54EE 0%, #7A75FF 100%)",
          },
        },
        },
      ],
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: "rgba(17, 24, 39, 0.35)",
          backdropFilter: "blur(16px) saturate(1.3)",
          WebkitBackdropFilter: "blur(16px) saturate(1.3)",
          border: "1px solid rgba(108, 99, 255, 0.08)",
          boxShadow: "none",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "rgba(10, 14, 26, 0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(108, 99, 255, 0.1)",
        },
      },
    },
  },
});

export default theme;
