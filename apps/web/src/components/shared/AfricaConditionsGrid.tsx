import { Box, Typography } from "@mui/material";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ApiOutlinedIcon from "@mui/icons-material/ApiOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import FingerprintOutlinedIcon from "@mui/icons-material/FingerprintOutlined";
import NetworkCheckOutlinedIcon from "@mui/icons-material/NetworkCheckOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import TranslateOutlinedIcon from "@mui/icons-material/TranslateOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import { WHY_AFRICA } from "@/content/company";

const icons = [
  PaymentsOutlinedIcon,
  ApiOutlinedIcon,
  StorefrontOutlinedIcon,
  FingerprintOutlinedIcon,
  NetworkCheckOutlinedIcon,
  HubOutlinedIcon,
  TranslateOutlinedIcon,
  PublicOutlinedIcon,
];

/** A continuous matrix: shared rules, no detached card surfaces. */
export default function AfricaConditionsGrid() {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
        borderTop: "1px solid",
        borderLeft: "1px solid",
        borderColor: "divider",
      }}
    >
      {WHY_AFRICA.conditions.map((condition, index) => {
        const Icon = icons[index] ?? PublicOutlinedIcon;
        return (
          <Box
            component="article"
            key={condition.title}
            sx={{
              position: "relative",
              overflow: "hidden",
              p: { xs: 2.5, md: 3 },
              borderRight: "1px solid",
              borderBottom: "1px solid",
              borderColor: "divider",
              transition: "background-color .2s",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Box
              aria-hidden
              sx={{
                position: "absolute",
                right: -18,
                bottom: -22,
                color: "text.secondary",
                opacity: 0.065,
                pointerEvents: "none",
              }}
            >
              <Icon sx={{ fontSize: 150 }} />
            </Box>
            <Box sx={{ position: "relative" }}>
              <Box
                aria-hidden
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  color: "secondary.main",
                  mb: 2,
                }}
              >
                <Icon sx={{ fontSize: 27 }} />
                <Typography
                  sx={{ fontFamily: "monospace", fontSize: ".65rem", color: "text.secondary" }}
                >
                  {String(index + 1).padStart(2, "0")}
                </Typography>
              </Box>
              <Typography
                component="h3"
                sx={{
                  fontWeight: 800,
                  fontSize: ".98rem",
                  lineHeight: 1.4,
                  minHeight: { sm: "2.8em" },
                }}
              >
                {condition.title}
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ mt: 1.5, fontSize: ".87rem", lineHeight: 1.75 }}
              >
                {condition.reality}
              </Typography>
              <Typography
                sx={{ mt: 2, fontSize: ".87rem", lineHeight: 1.75, color: "secondary.main" }}
              >
                {condition.implication}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
