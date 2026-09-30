import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#3B82F6",
      light: "#8B5CF6",
      dark: "#4B44CC",
    },
    secondary: {
      main: "#06B6D4",
      light: "#10B981",
      dark: "#00A888",
    },
    background: {
      default: "#0A0F1F",
      paper: "rgba(17, 26, 46, 0.35)",
    },
    text: {
      primary: "#F1F5F9",
      secondary: "#94A3B8",
    },
  },
  typography: {
    fontFamily: "'TT Squares', 'Roboto', sans-serif",
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
          background: "rgba(17, 26, 46, 0.35)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(59, 130, 246, 0.1)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        },
      },
    },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 4 } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 4 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 6 } } },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

export default theme;
