import { useState } from "react";
import { Box, Typography, TextField, Stack, Button, Alert, CircularProgress, IconButton, InputAdornment, Tooltip } from "@mui/material";
import { useNavigate } from "react-router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CasinoOutlinedIcon from "@mui/icons-material/CasinoOutlined";
import PageBanner from "@/components/shared/PageBanner";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";
import { useAuth } from "@/context/AuthContext";

const BORDER = "rgba(108, 99, 255, 0.12)";

const inputSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "rgba(108, 99, 255, 0.04)",
    "& fieldset": { borderColor: "rgba(108,99,255,0.15)" },
    "&:hover fieldset": { borderColor: "rgba(108,99,255,0.3)" },
    "&.Mui-focused fieldset": { borderColor: "#00D4AA" },
  },
};

const btnSx = {
  fontFamily: "monospace",
  fontSize: "0.65rem",
  letterSpacing: "0.1em",
};

function generatePassword(length = 16): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((b) => chars[b % chars.length])
    .join("");
}

export default function ClientCreate() {
  const navigate = useNavigate();
  const { api } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = firstName.trim() && lastName.trim() && email.trim() && password.trim();

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await api.register({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
        role: "client",
        ...(company.trim() && { company: company.trim() }),
        ...(phone.trim() && { phone: phone.trim() }),
      });
      navigate("/clients");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create client.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Box
        onClick={() => navigate("/clients")}
        sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 3, py: 1.5, cursor: "pointer", color: "text.secondary", "&:hover": { color: "#00D4AA" }, transition: "color 0.2s" }}
      >
        <ArrowBackIcon sx={{ fontSize: 18 }} />
        <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.1em" }}>BACK TO CLIENTS</Typography>
      </Box>

      <PageBanner
        icon={<PeopleOutlinedIcon />}
        title="New Client"
        description="Create a new client account for the platform."
        tag="ADMIN // NEW CLIENT"
        accentWord="New"
        iconColor="#00D4AA"
        iconLabel="CLIENTS"
      />

      {/* Action bar */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", px: 3, py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" onClick={() => navigate("/clients")} sx={{ ...btnSx, borderColor: "rgba(108,99,255,0.2)", color: "text.secondary", "&:hover": { borderColor: "rgba(108,99,255,0.4)" } }}>
            Cancel
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={submitting ? <CircularProgress size={14} sx={{ color: "#10B981" }} /> : <SaveOutlinedIcon />}
            disabled={!canSubmit || submitting}
            onClick={handleSubmit}
            sx={{ ...btnSx, borderColor: "#10B98140", color: "#10B981", "&:hover": { borderColor: "#10B981", bgcolor: "#10B98108" }, "&.Mui-disabled": { borderColor: "rgba(108,99,255,0.1)", color: "text.secondary", opacity: 0.3 } }}
          >
            {submitting ? "Saving…" : "Save Client"}
          </Button>
        </Stack>
      </Box>

      {/* Error */}
      {error && (
        <Box sx={{ px: 3, pt: 2 }}>
          <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
        </Box>
      )}

      {/* Form */}
      <SectionLabel>Client Details</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        <Cell color="#00D4AA" index="00" colInRow={0} totalCols={2} animDelay={0}>
          <Stack spacing={2}>
            <TextField fullWidth size="small" label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} sx={inputSx} />
            <TextField fullWidth size="small" label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} sx={inputSx} />
            <TextField fullWidth size="small" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} sx={inputSx} />
          </Stack>
        </Cell>
        <Cell color="#6C63FF" index="01" colInRow={1} totalCols={2} animDelay={0.1}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              label="Password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={inputSx}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Generate random password">
                        <IconButton size="small" onClick={() => setPassword(generatePassword())} edge="end">
                          <CasinoOutlinedIcon sx={{ fontSize: 18, color: "#6C63FF" }} />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField fullWidth size="small" label="Company" value={company} onChange={(e) => setCompany(e.target.value)} sx={inputSx} />
            <TextField fullWidth size="small" label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} sx={inputSx} />
          </Stack>
        </Cell>
      </Box>
    </Box>
  );
}
