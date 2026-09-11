import { Box, Container, Stack, Typography, Card, CardContent, Chip, Button, Divider } from "@mui/material";
import { motion } from "framer-motion";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";
import HistoryToggleOffOutlinedIcon from "@mui/icons-material/HistoryToggleOffOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import SEO from "@/components/seo/SEO";

const MotionBox = motion.create(Box);

const OVERLINE_SX = {
  fontFamily: "monospace",
  fontSize: "0.7rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.25em",
  color: "text.secondary",
  opacity: 0.6,
};

interface Item {
  label: string;
  detail: string;
  Icon: typeof LockOutlinedIcon;
}

interface Section {
  title: string;
  blurb: string;
  Icon: typeof ShieldOutlinedIcon;
  accent: string;
  items: Item[];
}

const SECTIONS: Section[] = [
  {
    title: "Security Posture",
    blurb: "Defence-in-depth is part of how each service is built and operated.",
    Icon: VerifiedUserOutlinedIcon,
    accent: "#6C63FF",
    items: [
      { label: "Audit logging", detail: "Sensitive actions and access events are written to an append-only audit log — entries are created, never edited or deleted.", Icon: HistoryToggleOffOutlinedIcon },
      { label: "Encryption in transit", detail: "Traffic is served over HTTPS, with standard security headers set by the API.", Icon: LockOutlinedIcon },
      { label: "Role-based access control (RBAC)", detail: "Least-privilege roles and granular per-permission checks on protected routes.", Icon: GroupsOutlinedIcon },
      { label: "Authentication", detail: "Token-based sign-in with per-role authorisation. Multi-factor authentication is not enabled today — it is on the roadmap, not in place.", Icon: VpnKeyOutlinedIcon },
    ],
  },
  {
    title: "Data Protection by Design",
    blurb: "Privacy-first engineering, built around the data-protection regimes that matter in the markets we build for. These are the practices followed, not a certified compliance position.",
    Icon: GavelOutlinedIcon,
    accent: "#00D4AA",
    items: [
      { label: "Built around GDPR principles", detail: "Data-subject rights, lawful basis, and a data-processing agreement available on request.", Icon: ShieldOutlinedIcon },
      { label: "Designed to align with Ghana's Data Protection Act 2012 (Act 843)", detail: "Data handling is designed around the requirements set out by Ghana's Data Protection Commission.", Icon: GavelOutlinedIcon },
      { label: "Data residency options", detail: "Deployments can be placed in a specific region where local data-residency obligations apply.", Icon: PublicOutlinedIcon },
      { label: "Data minimisation", detail: "Only what a feature needs is collected, and it is retained no longer than necessary.", Icon: StorageOutlinedIcon },
    ],
  },
];

export default function Trust() {
  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <SEO
        title="Trust Center"
        description="NeuroDyne Corp Trust Center — the security practices followed, a data-protection approach designed to align with GDPR and Ghana's Data Protection Act 2012 (Act 843), sub-processors, and how to report a security issue."
      />
      <Container maxWidth="lg">
        <Typography sx={OVERLINE_SX}>Trust Center</Typography>
        <Typography variant="h3" sx={{ fontWeight: 700, mt: 1.5, mb: 2 }}>
          Security, privacy & data protection
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, maxWidth: 760, mb: { xs: 4, md: 6 } }}>
          The practices used to protect your data, written plainly. NeuroDyne holds no security or privacy
          certification — what follows is how systems are actually built and operated, so you can assess it yourself.
        </Typography>

        <Stack spacing={{ xs: 3, md: 4 }}>
          {/* Security posture + data-protection cards */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: { xs: 3, md: 4 },
            }}
          >
            {SECTIONS.map((section, idx) => {
              const SectionIcon = section.Icon;
              return (
                <MotionBox
                  key={section.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: `${section.accent}0A`,
                    }}
                  >
                    <CardContent sx={{ p: { xs: 3, md: 3.5 } }}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1 }}>
                        <SectionIcon sx={{ color: section.accent, fontSize: 30 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {section.title}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                        {section.blurb}
                      </Typography>
                      <Stack spacing={2}>
                        {section.items.map((item) => {
                          const ItemIcon = item.Icon;
                          return (
                            <Stack sx={{ alignItems: "flex-start" }} key={item.label} direction="row" spacing={1.5}>
                              <ItemIcon sx={{ color: section.accent, fontSize: 20, mt: "2px" }} />
                              <Box>
                                <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                                  {item.label}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {item.detail}
                                </Typography>
                              </Box>
                            </Stack>
                          );
                        })}
                      </Stack>
                    </CardContent>
                  </Card>
                </MotionBox>
              );
            })}
          </Box>

          {/* Sub-processors */}
          <MotionBox
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <Card sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
              <CardContent sx={{ p: { xs: 3, md: 3.5 } }}>
                <Stack sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                >
                  <Stack sx={{ alignItems: "center" }} direction="row" spacing={1.5}>
                    <HubOutlinedIcon sx={{ color: "#F59E0B", fontSize: 30 }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Sub-processors
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        The third-party services that help us deliver the platform, and what they handle.
                      </Typography>
                    </Box>
                  </Stack>
                  <Button
                    variant="outlined"
                    href="/legal/subprocessors"
                    endIcon={<DescriptionOutlinedIcon />}
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    View sub-processors
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </MotionBox>

          {/* Security contact + links */}
          <MotionBox
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <Card
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "rgba(108,99,255,0.06)",
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1 }}>
                  <ShieldOutlinedIcon sx={{ color: "#6C63FF", fontSize: 30 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Report a security issue
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, maxWidth: 680 }}>
                  Found a vulnerability? Responsible disclosure is welcome. Email the address below — it reaches the
                  founder directly. Please do not publicly disclose until there has been a chance to remediate.
                </Typography>

                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2.5 }}>
                  <EmailOutlinedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                  <Typography
                    component="a"
                    href="mailto:info@neurodyne.dev"
                    sx={{
                      fontFamily: "monospace",
                      color: "primary.main",
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    info@neurodyne.dev
                  </Typography>
                </Stack>

                <Divider sx={{ mb: 2.5 }} />

                <Stack sx={{ flexWrap: "wrap" }} direction="row" spacing={1.5} useFlexGap>
                  <Chip
                    component="a"
                    clickable
                    href="/.well-known/security.txt"
                    icon={<DescriptionOutlinedIcon />}
                    label="security.txt"
                    variant="outlined"
                  />
                  <Chip
                    component="a"
                    clickable
                    href="/status"
                    icon={<MonitorHeartOutlinedIcon />}
                    label="System status"
                    variant="outlined"
                  />
                  <Chip
                    component="a"
                    clickable
                    href="/legal/subprocessors"
                    icon={<HubOutlinedIcon />}
                    label="Sub-processors"
                    variant="outlined"
                  />
                </Stack>
              </CardContent>
            </Card>
          </MotionBox>
        </Stack>
      </Container>
    </Box>
  );
}
