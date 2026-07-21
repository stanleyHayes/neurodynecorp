import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  Box,
  Container,
  Stack,
  Typography,
  Chip,
  Button,
  Divider,
  CircularProgress,
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import SEO from "@/components/seo/SEO";
import { api } from "@/api/client";

const OVERLINE = {
  fontFamily: "monospace",
  fontSize: "0.7rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.25em",
  color: "text.secondary",
  opacity: 0.6,
};

const BORDER = "rgba(108, 99, 255, 0.12)";

export default function HelpArticle() {
  const { slug } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setNotFound(false);
    setFeedbackSent(false);
    (async () => {
      try {
        const data: any = await api.get(`/api/v1/help/slug/${encodeURIComponent(slug)}`);
        if (!active) return;
        if (!data) {
          setNotFound(true);
        } else {
          setArticle(data);
        }
      } catch {
        if (active) setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  const sendFeedback = async (helpful: boolean) => {
    if (!article?.id || submitting) return;
    setSubmitting(true);
    try {
      await api.post(`/api/v1/help/${article.id}/helpful`, { helpful });
      setFeedbackSent(true);
    } catch {
      // Swallow errors; still thank the reader so the flow completes gracefully.
      setFeedbackSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress size={32} sx={{ color: "#6C63FF" }} />
          </Box>
        </Container>
      </Box>
    );
  }

  if (notFound || !article) {
    return (
      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <SEO title="Article not found" description="The help article you're looking for could not be found." />
        <Container maxWidth="lg">
          <Stack spacing={3} sx={{ alignItems: "flex-start", py: 8 }}>
            <Typography sx={OVERLINE}>SUPPORT // 404</Typography>
            <Typography sx={{ fontWeight: 800 }} variant="h4">
              Article not found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ opacity: 0.8 }}>
              The help article you're looking for doesn't exist or has been moved.
            </Typography>
            <Button
              component={Link}
              to="/help"
              startIcon={<ArrowBackOutlinedIcon />}
              variant="outlined"
              sx={{ borderColor: "rgba(108,99,255,0.3)", "&:hover": { borderColor: "rgba(108,99,255,0.5)" } }}
            >
              Back to Help Center
            </Button>
          </Stack>
        </Container>
      </Box>
    );
  }

  const body: string = article?.body ?? article?.content ?? "";
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const cat = article?.category ?? article?.categoryName ?? article?.categoryLabel ?? "";

  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <SEO
        title={article?.title}
        description={article?.summary ?? article?.excerpt ?? body.slice(0, 160).trim()}
        ogType="article"
        canonical={`https://neurodynecorp.com/help/${slug}`}
        ogUrl={`https://neurodynecorp.com/help/${slug}`}
      />
      <Container maxWidth="md">
        <Button
          component={Link}
          to="/help"
          startIcon={<ArrowBackOutlinedIcon />}
          sx={{
            mb: 4,
            color: "text.secondary",
            "&:hover": { color: "text.primary", bgcolor: "rgba(108,99,255,0.06)" },
          }}
        >
          Help Center
        </Button>

        <Stack spacing={2} sx={{ mb: 4 }}>
          {cat && (
            <Chip
              label={cat}
              size="small"
              sx={{
                alignSelf: "flex-start",
                fontFamily: "monospace",
                fontSize: "0.65rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                bgcolor: "rgba(108,99,255,0.12)",
                color: "#8B85FF",
                border: "1px solid rgba(108,99,255,0.2)",
              }}
            />
          )}
          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            {article?.title}
          </Typography>
        </Stack>

        <Box>
          {paragraphs.length > 0 ? (
            paragraphs.map((para, i) => (
              <Typography
                key={i}
                variant="body1"
                sx={{ color: "text.secondary", lineHeight: 1.85, mb: 2.5, opacity: 0.9 }}
              >
                {para}
              </Typography>
            ))
          ) : (
            <Typography variant="body1" sx={{ color: "text.secondary", opacity: 0.7 }}>
              This article has no content yet.
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 6, borderColor: BORDER }} />

        {/* Was this helpful? */}
        <Box
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 2,
            border: `1px solid ${BORDER}`,
            bgcolor: "rgba(108,99,255,0.03)",
          }}
        >
          {feedbackSent ? (
            <Stack sx={{ alignItems: "center" }} direction="row" spacing={1.5}>
              <CheckCircleOutlineOutlinedIcon sx={{ color: "#10B981", fontSize: 28 }} />
              <Box>
                <Typography sx={{ fontWeight: 700 }} variant="subtitle1">
                  Thanks for your feedback!
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.75 }}>
                  It helps us make these articles better.
                </Typography>
              </Box>
            </Stack>
          ) : (
            <Stack spacing={2}>
              <Typography sx={OVERLINE}>FEEDBACK</Typography>
              <Typography sx={{ fontWeight: 700 }} variant="h6">
                Was this helpful?
              </Typography>
              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="outlined"
                  disabled={submitting}
                  onClick={() => sendFeedback(true)}
                  startIcon={<ThumbUpAltOutlinedIcon />}
                  sx={{
                    borderColor: "rgba(16,185,129,0.4)",
                    color: "#10B981",
                    "&:hover": { borderColor: "#10B981", bgcolor: "rgba(16,185,129,0.08)" },
                  }}
                >
                  Yes
                </Button>
                <Button
                  variant="outlined"
                  disabled={submitting}
                  onClick={() => sendFeedback(false)}
                  startIcon={<ThumbDownAltOutlinedIcon />}
                  sx={{
                    borderColor: "rgba(239,68,68,0.4)",
                    color: "#EF4444",
                    "&:hover": { borderColor: "#EF4444", bgcolor: "rgba(239,68,68,0.08)" },
                  }}
                >
                  No
                </Button>
              </Stack>
            </Stack>
          )}
        </Box>
      </Container>
    </Box>
  );
}
