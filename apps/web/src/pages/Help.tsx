import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";
import {
  Box,
  Container,
  Stack,
  Typography,
  Card,
  CardContent,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
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

function slugFor(article: any): string {
  return article?.slug ?? "";
}

export default function Help() {
  const [categories, setCategories] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Committed query (drives the fetch) vs the live input value.
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data: any = await api.get("/api/v1/help/categories");
        if (!active) return;
        const list = Array.isArray(data) ? data : data?.categories ?? data?.items ?? [];
        setCategories(list);
      } catch {
        if (active) setCategories([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const params: Record<string, string> = {};
        if (query.trim()) params.q = query.trim();
        if (category) params.category = category;
        const data: any = await api.get("/api/v1/help", params);
        if (!active) return;
        const list = Array.isArray(data) ? data : data?.items ?? data?.articles ?? [];
        setArticles(list);
      } catch {
        if (active) setArticles([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [query, category]);

  const categoryOptions = useMemo(() => {
    return categories
      .map((c: any) => ({
        label: c?.name ?? c?.title ?? c?.label ?? (typeof c === "string" ? c : ""),
        value: c?.slug ?? c?.id ?? c?.value ?? (typeof c === "string" ? c : ""),
      }))
      .filter((c) => c.value);
  }, [categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(search);
  };

  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <SEO
        title="Help Center"
        description="Search guides, answers, and how-tos for working with NeuroDyne Corp."
        canonical="https://neurodyne.dev/help"
        ogUrl="https://neurodyne.dev/help"
      />
      <Container maxWidth="lg">
        {/* Header */}
        <Stack spacing={1.5} sx={{ mb: { xs: 4, md: 6 } }}>
          <Typography sx={OVERLINE}>SUPPORT // KNOWLEDGE BASE</Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
            Help Center
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640, opacity: 0.8 }}>
            Browse guides and answers, or search for exactly what you need.
          </Typography>
        </Stack>

        {/* Search */}
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search the help center..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon sx={{ color: "text.secondary", opacity: 0.6, fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              maxWidth: 560,
              "& .MuiOutlinedInput-root": {
                bgcolor: "rgba(108,99,255,0.04)",
                "& fieldset": { borderColor: "rgba(108,99,255,0.15)" },
                "&:hover fieldset": { borderColor: "rgba(108,99,255,0.3)" },
                "&.Mui-focused fieldset": { borderColor: "#6C63FF" },
              },
            }}
          />
        </Box>

        {/* Category filter */}
        {categoryOptions.length > 0 && (
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", mb: { xs: 4, md: 5 }, gap: 1 }}>
            <Chip
              label="All"
              onClick={() => setCategory("")}
              sx={{
                fontFamily: "monospace",
                fontSize: "0.7rem",
                letterSpacing: "0.08em",
                cursor: "pointer",
                bgcolor: category === "" ? "rgba(108,99,255,0.15)" : "transparent",
                color: category === "" ? "#6C63FF" : "text.secondary",
                border: category === "" ? "1px solid #6C63FF" : "1px solid rgba(108,99,255,0.15)",
                "&:hover": { borderColor: "rgba(108,99,255,0.4)" },
              }}
            />
            {categoryOptions.map((c) => {
              const active = c.value === category;
              return (
                <Chip
                  key={c.value}
                  label={c.label}
                  onClick={() => setCategory(active ? "" : c.value)}
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.7rem",
                    letterSpacing: "0.08em",
                    cursor: "pointer",
                    bgcolor: active ? "rgba(108,99,255,0.15)" : "transparent",
                    color: active ? "#6C63FF" : "text.secondary",
                    border: active ? "1px solid #6C63FF" : "1px solid rgba(108,99,255,0.15)",
                    "&:hover": { borderColor: "rgba(108,99,255,0.4)" },
                  }}
                />
              );
            })}
          </Stack>
        )}

        {/* Results */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress size={32} sx={{ color: "#6C63FF" }} />
          </Box>
        ) : articles.length === 0 ? (
          <Stack spacing={2} sx={{ alignItems: "center", py: 10, textAlign: "center" }}>
            <HelpOutlineOutlinedIcon sx={{ fontSize: 48, color: "#6C63FF", opacity: 0.5 }} />
            <Typography sx={{ fontWeight: 700 }} variant="h6">
              No articles found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, opacity: 0.75 }}>
              {query
                ? `Nothing matched "${query}". Try a different keyword or clear the filters.`
                : "There are no help articles here yet. Check back soon."}
            </Typography>
          </Stack>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
              gap: { xs: 2, md: 3 },
            }}
          >
            {articles.map((article: any) => {
              const slug = slugFor(article);
              const cat = article?.category ?? article?.categoryName ?? article?.categoryLabel ?? "";
              return (
                <Card
                  key={article?.id ?? slug ?? article?.title}
                  component={Link}
                  to={`/help/${slug}`}
                  sx={{
                    height: "100%",
                    textDecoration: "none",
                    bgcolor: "rgba(108,99,255,0.03)",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 2,
                    transition: "border-color 0.2s, background 0.2s, transform 0.2s",
                    "&:hover": {
                      borderColor: "rgba(108,99,255,0.4)",
                      bgcolor: "rgba(108,99,255,0.06)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%", gap: 1.5 }}>
                    {cat && (
                      <Chip
                        label={cat}
                        size="small"
                        sx={{
                          alignSelf: "flex-start",
                          fontFamily: "monospace",
                          fontSize: "0.62rem",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          bgcolor: "rgba(108,99,255,0.12)",
                          color: "#8B85FF",
                          border: "1px solid rgba(108,99,255,0.2)",
                        }}
                      />
                    )}
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.35, color: "text.primary" }}>
                      {article?.title}
                    </Typography>
                    {(article?.summary ?? article?.excerpt) && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ opacity: 0.75, lineHeight: 1.6, flexGrow: 1 }}
                      >
                        {article?.summary ?? article?.excerpt}
                      </Typography>
                    )}
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", mt: "auto", color: "#6C63FF" }}>
                      <Typography
                        sx={{ fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.1em" }}
                      >
                        READ
                      </Typography>
                      <ArrowForwardOutlinedIcon sx={{ fontSize: 14 }} />
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Container>
    </Box>
  );
}
