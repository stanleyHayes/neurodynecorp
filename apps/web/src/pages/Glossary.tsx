import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Container,
  Stack,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
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

interface Term {
  id: string;
  term: string;
  slug: string;
  definition: string;
  category?: string;
  aliases?: string[];
}

function firstLetter(term: string): string {
  const c = (term?.trim()?.[0] ?? "#").toUpperCase();
  return /[A-Z]/.test(c) ? c : "#";
}

export default function Glossary() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await api.glossaryCategories();
        if (active) setCategories(data?.categories ?? []);
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
        const data = await api.listGlossary(category ? { category } : undefined);
        if (active) setTerms((data?.items as Term[]) ?? []);
      } catch {
        if (active) setTerms([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [category]);

  // Client-side search across term, definition, and aliases.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return terms;
    return terms.filter((t) => {
      const hay = [t.term, t.definition, ...(t.aliases ?? [])].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [terms, search]);

  // Group A–Z (with a "#" bucket for non-alpha).
  const grouped = useMemo(() => {
    const map = new Map<string, Term[]>();
    for (const t of filtered) {
      const k = firstLetter(t.term);
      const arr = map.get(k) ?? [];
      arr.push(t);
      map.set(k, arr);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const structuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "DefinedTermSet",
      name: "NeuroDyne Glossary of Practice",
      url: "https://neurodynecorp.com/glossary",
      hasDefinedTerm: filtered.slice(0, 200).map((t) => ({
        "@type": "DefinedTerm",
        name: t.term,
        description: t.definition,
        ...(t.slug ? { url: `https://neurodynecorp.com/glossary#${t.slug}` } : {}),
      })),
    }),
    [filtered],
  );

  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <SEO
        title="Glossary of Practice"
        description="Definitions of the language NeuroDyne Corp uses — leverage points, the capability lattice, sovereign-by-default, and more."
        canonical="https://neurodynecorp.com/glossary"
        ogUrl="https://neurodynecorp.com/glossary"
        structuredData={structuredData}
      />
      <Container maxWidth="lg">
        {/* Header */}
        <Stack spacing={1.5} sx={{ mb: { xs: 4, md: 6 } }}>
          <Typography sx={OVERLINE}>KNOWLEDGE // GLOSSARY OF PRACTICE</Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
            Glossary of Practice
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 680, opacity: 0.8 }}>
            The language we use, defined. Precise terms make for precise engagements.
          </Typography>
        </Stack>

        {/* Search */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search terms, definitions, aliases…"
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
        {categories.length > 0 && (
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", mb: { xs: 4, md: 5 }, gap: 1 }}>
            {["", ...categories].map((c) => {
              const active = c === category;
              return (
                <Chip
                  key={c || "all"}
                  label={c || "All"}
                  onClick={() => setCategory(active && c ? "" : c)}
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.7rem",
                    letterSpacing: "0.08em",
                    cursor: "pointer",
                    textTransform: c ? "none" : "uppercase",
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
        ) : filtered.length === 0 ? (
          <Stack spacing={2} sx={{ alignItems: "center", py: 10, textAlign: "center" }}>
            <MenuBookOutlinedIcon sx={{ fontSize: 48, color: "#6C63FF", opacity: 0.5 }} />
            <Typography sx={{ fontWeight: 700 }} variant="h6">
              No terms found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, opacity: 0.75 }}>
              {search
                ? `Nothing matched "${search}". Try a different keyword or clear the filters.`
                : "The glossary is being written. Check back soon."}
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={{ xs: 4, md: 5 }}>
            {grouped.map(([letter, items]) => (
              <Box key={letter}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 800, color: "#6C63FF", mb: 2, fontFamily: "monospace", letterSpacing: "0.05em" }}
                >
                  {letter}
                </Typography>
                <Stack spacing={2}>
                  {items.map((t) => (
                    <Box
                      key={t.id}
                      id={t.slug || undefined}
                      sx={{
                        p: { xs: 2, md: 2.5 },
                        bgcolor: "rgba(108,99,255,0.03)",
                        border: `1px solid ${BORDER}`,
                        borderRadius: 2,
                        scrollMarginTop: "96px",
                      }}
                    >
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", mb: 0.75, gap: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                          {t.term}
                        </Typography>
                        {t.category && (
                          <Chip
                            label={t.category}
                            size="small"
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "0.6rem",
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              bgcolor: "rgba(108,99,255,0.12)",
                              color: "#8B85FF",
                              border: "1px solid rgba(108,99,255,0.2)",
                            }}
                          />
                        )}
                      </Stack>
                      <Typography variant="body1" color="text.secondary" sx={{ opacity: 0.85, lineHeight: 1.7, whiteSpace: "pre-line" }}>
                        {t.definition}
                      </Typography>
                      {t.aliases && t.aliases.length > 0 && (
                        <Typography sx={{ mt: 1, fontFamily: "monospace", fontSize: "0.7rem", color: "text.secondary", opacity: 0.6 }}>
                          Also: {t.aliases.join(", ")}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
