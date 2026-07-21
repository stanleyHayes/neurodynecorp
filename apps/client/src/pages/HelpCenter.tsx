import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Stack,
  Typography,
  Card,
  CardContent,
  Chip,
  TextField,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import { useAuth } from "@/context/AuthContext";

const overlineSx = {
  fontFamily: "monospace",
  fontSize: "0.7rem",
  textTransform: "uppercase",
  letterSpacing: "0.25em",
  color: "text.secondary",
  opacity: 0.6,
} as const;

const ALL_CATEGORY = "All";

export default function HelpCenter() {
  const { api } = useAuth();

  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(ALL_CATEGORY);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res: any = await api.get("/api/v1/help");
        const items = res?.items ?? res?.articles ?? res?.data ?? res ?? [];
        if (!cancelled) setArticles(Array.isArray(items) ? items : []);
      } catch {
        if (!cancelled) setArticles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [api]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const a of articles) {
      const c = a.category ?? a.topic;
      if (c) set.add(String(c));
    }
    return [ALL_CATEGORY, ...Array.from(set).sort()];
  }, [articles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      const cat = String(a.category ?? a.topic ?? "");
      if (category !== ALL_CATEGORY && cat !== category) return false;
      if (!q) return true;
      const haystack = [a.title, a.body ?? a.content, a.summary ?? a.excerpt, cat]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [articles, query, category]);

  function articleId(a: any, i: number): string {
    return String(a.id ?? a._id ?? a.slug ?? i);
  }

  function articleBody(a: any): string {
    return a.body ?? a.content ?? a.summary ?? a.excerpt ?? "";
  }

  function articleExcerpt(a: any): string {
    const text = a.summary ?? a.excerpt ?? a.body ?? a.content ?? "";
    return text.length > 160 ? `${text.slice(0, 160).trim()}…` : text;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Container maxWidth="lg" disableGutters>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={overlineSx}>Support</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
            Help Center
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Search guides and answers to get the most out of your projects.
          </Typography>
        </Box>

        {/* Search */}
        <TextField slotProps={{ input: {
            startAdornment: (
              <SearchOutlinedIcon sx={{ color: "text.secondary", mr: 1 }} fontSize="small" />
            ),
          } }}
          fullWidth
          placeholder="Search articles…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Category chips */}
        {categories.length > 1 && (
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", mb: 3 }}>
            {categories.map((c) => (
              <Chip
                key={c}
                label={c}
                onClick={() => setCategory(c)}
                color={category === c ? "primary" : "default"}
                variant={category === c ? "filled" : "outlined"}
                size="small"
              />
            ))}
          </Stack>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 8 }}>
              <HelpOutlineOutlinedIcon sx={{ fontSize: 48, color: "text.secondary", opacity: 0.4, mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                No articles found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {query.trim()
                  ? "Try a different search term or category."
                  : "Help articles will appear here once available."}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={1.5}>
            {filtered.map((a, i) => {
              const id = articleId(a, i);
              const cat = a.category ?? a.topic;
              return (
                <Accordion
                  key={id}
                  expanded={expanded === id}
                  onChange={(_, isOpen) => setExpanded(isOpen ? id : null)}
                  disableGutters
                  sx={{
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    "&:before": { display: "none" },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreOutlinedIcon />}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start", width: "100%" }}>
                      <ArticleOutlinedIcon sx={{ color: "primary.main", mt: 0.25 }} fontSize="small" />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.25 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {a.title ?? "Untitled"}
                          </Typography>
                          {cat && (
                            <Chip
                              label={String(cat)}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: "0.65rem", height: 20 }}
                            />
                          )}
                        </Stack>
                        {expanded !== id && (
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {articleExcerpt(a)}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7, pl: { sm: 4.5 } }}
                    >
                      {articleBody(a)}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
