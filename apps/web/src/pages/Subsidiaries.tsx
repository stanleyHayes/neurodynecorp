import { Box, Container, Stack, Typography, Chip } from "@mui/material";
import { motion } from "framer-motion";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import { SectionHeading, InfoCard, CardGrid, CTABand, Overline } from "@/components/shared/Marketing";

const MotionBox = motion.create(Box);

type Status = "Active" | "In formation" | "Planned";

const STATUS_COLOR: Record<Status, string> = {
  Active: "#00D4AA",
  "In formation": "#F59E0B",
  Planned: "#8B85FF",
};

interface Subsidiary {
  name: string;
  status: Status;
  focus: string;
  relationship: string;
  leadership: string;
}

const SUBSIDIARIES: Subsidiary[] = [
  {
    name: "ILIVVON Health Systems Ltd",
    status: "In formation",
    focus: "Operating company for the ILIVVON health intelligence platform across clinic networks and payers.",
    relationship: "Spun out of NeuroDyne Labs; the parent retains core IP and a strategic stake.",
    leadership: "Led by the Labs founding team, transitioning to a dedicated managing director.",
  },
  {
    name: "JDPlus Group",
    status: "Active",
    focus: "Parent platform for the JDPlus ecosystem — AC sales & service, susu collections, loans, and commerce.",
    relationship: "Co-owned operating subsidiary built and operated on NeuroDyne infrastructure.",
    leadership: "Operated by the JDPlus management team with NeuroDyne as technology partner.",
  },
  {
    name: "24H+ Authority Intelligence Co.",
    status: "Planned",
    focus: "Vehicle to operate and license the 24-hour-economy investment-intelligence platform.",
    relationship: "Planned spin-out once the platform reaches operational maturity with the Authority.",
    leadership: "To be appointed at formation.",
  },
];

export default function Subsidiaries() {
  return (
    <Box>
      <SEO
        title="Subsidiaries"
        description="The NeuroDyne Corp holding structure — subsidiaries that are active, in formation, or planned, their relationship to the parent, and their leadership."
        canonical="https://neurodynecorp.com/subsidiaries"
        ogUrl="https://neurodynecorp.com/subsidiaries"
      />

      <PageHero
        icon={<AccountTreeOutlinedIcon />}
        title="Subsidiaries"
        description="NeuroDyne is a holding company. As Labs platforms prove out, they spin into dedicated subsidiaries. This page maps that portfolio as it grows."
        tag="HOLDING // STRUCTURE"
        accentWord="Subsidiaries"
        iconColor="#8B85FF"
        iconLabel="PORTFOLIO MAP"
      />

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Stack spacing={{ xs: 6, md: 9 }}>
          {/* Structure note */}
          <InfoCard accent="#6C63FF" icon={<BusinessOutlinedIcon />} title="Parent → Services / Labs / Subsidiaries">
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              NeuroDyne Corp operates as a strategic and ownership layer: it delivers systems to governments and
              enterprises through its Services arm, builds and owns defensible IP through Labs, and holds operating
              subsidiaries that take proven platforms to market. The portfolio compounds over time.
            </Typography>
          </InfoCard>

          {/* Portfolio */}
          <Box>
            <SectionHeading
              tag="§ 01 — PORTFOLIO"
              title="The portfolio today"
              lead="Some entities are active, some are in formation, some are planned. Status is shown honestly."
              color="#00D4AA"
            />
            <CardGrid columns={3}>
              {SUBSIDIARIES.map((s, i) => {
                const color = STATUS_COLOR[s.status];
                return (
                  <MotionBox
                    key={s.name}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    sx={{
                      height: "100%",
                      p: { xs: 3, md: 3.5 },
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: `${color}0A`,
                    }}
                  >
                    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                      <Overline color={color}>ENTITY</Overline>
                      <Chip
                        label={s.status}
                        size="small"
                        sx={{ bgcolor: `${color}1A`, color, fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase" }}
                      />
                    </Stack>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
                      {s.name}
                    </Typography>
                    <Stack spacing={1.5}>
                      <Field label="Focus" value={s.focus} />
                      <Field label="Relationship" value={s.relationship} />
                      <Field label="Leadership" value={s.leadership} />
                    </Stack>
                  </MotionBox>
                );
              })}
            </CardGrid>
          </Box>

          <CTABand
            to="/labs"
            tag="§ 02 — THE SOURCE"
            title="Subsidiaries start in the Labs"
            description="See the platforms in development that will seed the next entities in the portfolio."
            color="#8B85FF"
          />
        </Stack>
      </Container>
    </Box>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "text.secondary", opacity: 0.6 }}>
        {label}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
        {value}
      </Typography>
    </Box>
  );
}
