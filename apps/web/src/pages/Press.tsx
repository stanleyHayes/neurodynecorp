import { Box, Container, Stack, Typography, Button, Divider } from "@mui/material";
import NewspaperOutlinedIcon from "@mui/icons-material/NewspaperOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import MicOutlinedIcon from "@mui/icons-material/MicOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import { SectionHeading, InfoCard, CardGrid, Overline } from "@/components/shared/Marketing";

interface Release {
  date: string;
  title: string;
  summary: string;
}

const RELEASES: Release[] = [
  {
    date: "2026-05",
    title: "NeuroDyne Corp engaged on the 24-Hour Economy Authority intelligence architecture",
    summary: "The firm is building the investment-intelligence platform underpinning Ghana's 24-hour economy programme.",
  },
  {
    date: "2026-03",
    title: "ILIVVON health intelligence platform enters development with Fastcare Clinics",
    summary: "A unified clinical record, claims automation, and an intelligence layer for African clinic networks.",
  },
  {
    date: "2026-01",
    title: "NeuroDyne crosses 36 shipped platforms across fintech, govtech, health and edtech",
    summary: "Reflecting on the portfolio as the firm approaches a phase of national-scale work.",
  },
];

const COVERAGE: { outlet: string; note: string }[] = [
  { outlet: "Coverage on request", note: "Media enquiries are handled directly by the press contact below." },
];

const AWARDS: string[] = [
  "Recognised for national-scale digital infrastructure work in West Africa",
];

const SPEAKING: string[] = [
  "Intelligent government systems in West Africa",
  "Donor-capital infrastructure in the African development decade",
];

export default function Press() {
  return (
    <Box>
      <SEO
        title="Press & Newsroom"
        description="NeuroDyne Corp newsroom — press releases, media coverage, the media kit, awards, speaking engagements, and press contact."
        canonical="https://neurodyne.dev/press"
        ogUrl="https://neurodyne.dev/press"
      />

      <PageHero
        icon={<NewspaperOutlinedIcon />}
        title="Press & Newsroom"
        description="Announcements, coverage, and the assets journalists need. For interviews and enquiries, reach the press contact directly."
        tag="NEWSROOM // PRESS"
        accentWord="Newsroom"
        iconColor="#6C63FF"
        iconLabel="BROADCAST"
      />

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Stack spacing={{ xs: 6, md: 9 }}>
          {/* Releases */}
          <Box>
            <SectionHeading tag="§ 01 — RELEASES" title="Press releases" color="#6C63FF" />
            <Stack spacing={2}>
              {RELEASES.map((r, i) => (
                <InfoCard key={r.title} accent="#6C63FF" delay={i * 0.05}>
                  <Stack sx={{ alignItems: "flex-start" }} direction="row" spacing={2}>
                    <Box sx={{ minWidth: 64 }}>
                      <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#6C63FF", letterSpacing: "0.1em" }}>
                        {r.date}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{r.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{r.summary}</Typography>
                    </Box>
                  </Stack>
                </InfoCard>
              ))}
            </Stack>
          </Box>

          {/* Coverage + Media kit */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: { xs: 3, md: 4 } }}>
            <InfoCard accent="#00D4AA" icon={<CampaignOutlinedIcon />} title="Media coverage">
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                {COVERAGE.map((c) => (
                  <Box key={c.outlet}>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>{c.outlet}</Typography>
                    <Typography variant="body2" color="text.secondary">{c.note}</Typography>
                  </Box>
                ))}
              </Stack>
            </InfoCard>

            <InfoCard accent="#8B85FF" icon={<DownloadOutlinedIcon />} title="Media kit">
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Logos, brand assets, executive headshots, founder bio, and a one-pager about the firm.
              </Typography>
              <Stack sx={{ flexWrap: "wrap" }} direction="row" spacing={1.5} useFlexGap>
                <Button variant="outlined" size="small" startIcon={<DownloadOutlinedIcon />} href="/media-kit.zip">
                  Brand assets
                </Button>
                <Button variant="outlined" size="small" startIcon={<DownloadOutlinedIcon />} href="/one-pager.pdf">
                  One-pager
                </Button>
              </Stack>
            </InfoCard>
          </Box>

          {/* Awards + Speaking */}
          <CardGrid columns={2}>
            <InfoCard accent="#F59E0B" icon={<EmojiEventsOutlinedIcon />} title="Awards & recognition">
              <Stack spacing={1} sx={{ mt: 1 }}>
                {AWARDS.map((a) => (
                  <Typography key={a} variant="body2" color="text.secondary">— {a}</Typography>
                ))}
              </Stack>
            </InfoCard>
            <InfoCard accent="#33DDBB" icon={<MicOutlinedIcon />} title="Speaking engagements">
              <Stack spacing={1} sx={{ mt: 1 }}>
                {SPEAKING.map((s) => (
                  <Typography key={s} variant="body2" color="text.secondary">— {s}</Typography>
                ))}
              </Stack>
            </InfoCard>
          </CardGrid>

          <Divider />

          {/* Press contact */}
          <InfoCard accent="#6C63FF" icon={<EmailOutlinedIcon />} title="Press contact">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              For interviews, quotes, and media enquiries:
            </Typography>
            <Stack sx={{ alignItems: "center" }} direction="row" spacing={1}>
              <EmailOutlinedIcon sx={{ color: "text.secondary", fontSize: 18 }} />
              <Typography
                component="a"
                href="mailto:press@neurodynecorp.com"
                sx={{ fontFamily: "monospace", color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
              >
                press@neurodynecorp.com
              </Typography>
            </Stack>
            <Overline>Typical response within two business days</Overline>
          </InfoCard>
        </Stack>
      </Container>
    </Box>
  );
}
