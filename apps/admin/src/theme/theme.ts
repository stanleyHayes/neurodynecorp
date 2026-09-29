import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#3B82F6", light: "#8B5CF6", dark: "#4B44CC" },
    secondary: { main: "#06B6D4", light: "#10B981", dark: "#00A888" },
    background: { default: "#0A0F1F", paper: "#111a2e" },
    text: { primary: "#F1F5F9", secondary: "#94A3B8" },
    error: { main: "#EF4444" },
    success: { main: "#10B981" },
    warning: { main: "#F59E0B" },
  },
  typography: {
    fontFamily: "'Outfit', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: { fontFamily: "'TT Squares', 'Outfit', sans-serif" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 4 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 4, padding: "10px 24px" },

      },
      variants: [
        {
          props: { variant: "contained", color: "primary" },
          style: {
          background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
          "&:hover": { background: "linear-gradient(135deg, #5B54EE, #7A75FF)" },
        },
        },
      ],
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          background: "rgba(17, 24, 39, 0.35)",
          backdropFilter: "blur(16px) saturate(1.3)",
          WebkitBackdropFilter: "blur(16px) saturate(1.3)",
          border: "1px solid rgba(59, 130, 246, 0.08)",
          boxShadow: "none",
        },
      },
    },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 4 } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 4 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 6 } } },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "rgba(10, 15, 31, 0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(59, 130, 246, 0.1)",
        },
      },
    },
  },
});

export default theme;
