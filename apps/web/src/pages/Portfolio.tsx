import { useState, useEffect, useMemo } from "react";
import { Box, Typography, Stack, CircularProgress } from "@mui/material";
import { AnimatePresence } from "framer-motion";
import WorkIcon from "@mui/icons-material/Work";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import EmptyState from "@/components/shared/EmptyState";
import AnimatedCaseStudy from "@/components/shared/AnimatedCaseStudy";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

const COLORS = ["#6C63FF", "#00D4AA", "#8B85FF", "#33DDBB"];

interface PortfolioItem {
  id: string;
  slug?: string;
  title: string;
  client: string;
  category: string;
  tags: string[];
  description: string;
  impact: string;
  results: string[];
  color: string;
  sector?: string;
  serviceLine?: string;
  scale?: string;
  stage?: string;
}

const BORDER = "rgba(108, 99, 255, 0.12)";

// Facets the dossiers can be sliced by (spec §5.6: sector, service line, scale, stage).
// `category` is kept as a fallback facet: it is always populated, so the filter bar still
// renders even when the optional dossier facets are blank. Each group auto-hides below 2 values.
const FACETS: { key: keyof PortfolioItem; label: string }[] = [
  { key: "category", label: "Category" },
  { key: "sector", label: "Sector" },
  { key: "serviceLine", label: "Service Line" },
  { key: "scale", label: "Scale" },
  { key: "stage", label: "Stage" },
];

type FacetKey = (typeof FACETS)[number]["key"];

export default function Portfolio() {
  const [projects, setProjects] = useState<(PortfolioItem & { index: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Record<string, string>>({
    category: "All",
    sector: "All",
    serviceLine: "All",
    scale: "All",
    stage: "All",
  });

  useEffect(() => {
    fetch(`${API_URL}/api/v1/portfolio?status=published`)
      .then((res) => res.json())
      .then((data) => {
        const items = (data.items ?? []).map((item: PortfolioItem, i: number) => ({
          ...item,
          color: item.color || COLORS[i % COLORS.length],
          index: String(i + 1).padStart(2, "0"),
        }));
        setProjects(items);
      })
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  // Only show a facet group if the data actually carries 2+ distinct values for it.
  const facetGroups = useMemo(
    () =>
      FACETS.map((f) => {
        const values = Array.from(
          new Set(projects.map((p) => p[f.key as FacetKey]).filter((v): v is string => Boolean(v))),
        );
        return { ...f, options: values };
      }).filter((f) => f.options.length > 1),
    [projects],
  );

  const filtered = useMemo(
    () =>
      projects.filter((p) =>
        FACETS.every((f) => {
          const sel = filters[f.key as string];
          return !sel || sel === "All" || p[f.key as FacetKey] === sel;
        }),
      ),
    [projects, filters],
  );

  const anyFilterActive = Object.values(filters).some((v) => v && v !== "All");
  const setFacet = (key: string, value: string) => setFilters((prev) => ({ ...prev, [key]: value }));
  const clearFilters = () => setFilters({ category: "All", sector: "All", serviceLine: "All", scale: "All", stage: "All" });

  return (
    <>
      <SEO
        title="Case Dossiers"
        description="NeuroDyne Corp case dossiers — declassified briefs on engagements across Government, Health, Financial Services, Commerce, and Education. Filter by sector, service line, scale, and stage."
        canonical="https://neurodynecorp.com/portfolio"
        ogUrl="https://neurodynecorp.com/portfolio"
      />

      <PageHero
        icon={<WorkIcon />}
        title="Case Dossiers"
        description="Engagements rendered as declassified briefs — the constraint set, the architecture chosen, what shipped, and what we kept. Filterable by sector, service line, scale, and stage."
        tag="OPERATIONS // LOG"
        accentWord="Dossiers"
        iconColor="#33DDBB"
        iconLabel="ARCHIVE LOADED"
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 12 }}>
          <CircularProgress size={32} sx={{ color: "#6C63FF" }} />
        </Box>
      ) : (
        <>
          {/* Faceted filter bar */}
          {facetGroups.length > 0 && (
            <Box sx={{ py: 3, px: { xs: 2, md: 4 }, borderBottom: `1px solid ${BORDER}` }}>
              <Stack spacing={2}>
                {facetGroups.map((group) => (
                  <Stack
                    key={group.key as string}
                    direction={{ xs: "column", sm: "row" }}
                    spacing={{ xs: 1, sm: 2 }}
                    alignItems={{ sm: "center" }}
                  >
                    <Typography
                      sx={{
                        minWidth: 110,
                        fontFamily: "monospace",
                        fontSize: "0.6rem",
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "text.secondary",
                        opacity: 0.55,
                      }}
                    >
                      {group.label}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {["All", ...group.options].map((opt) => {
                        const isActive = (filters[group.key as string] ?? "All") === opt;
                        return (
                          <FilterPill
                            key={opt}
                            label={opt}
                            active={isActive}
                            onClick={() => setFacet(group.key as string, opt)}
                          />
                        );
                      })}
                    </Stack>
                  </Stack>
                ))}
                {anyFilterActive && (
                  <Box>
                    <FilterPill label="× Clear all filters" active={false} onClick={clearFilters} />
                  </Box>
                )}
              </Stack>
            </Box>
          )}

          {/* Grid */}
          {filtered.length === 0 ? (
            <EmptyState
              icon={<WorkIcon />}
              title={anyFilterActive ? "No dossiers match these filters" : "No case dossiers published yet"}
              description={anyFilterActive ? "Try clearing a filter to widen the search." : "Check back soon to explore our archive of delivered engagements."}
              color="#33DDBB"
            />
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              }}
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((project, index) => (
                  <AnimatedCaseStudy
                    key={project.id ?? project.title}
                    title={project.title}
                    category={project.category}
                    tags={project.tags}
                    description={project.description}
                    impact={project.impact}
                    results={project.results}
                    color={project.color}
                    index={String(index + 1).padStart(2, "0")}
                    href={`/portfolio/${project.slug ?? project.id}`}
                  />
                ))}
              </AnimatePresence>
            </Box>
          )}
        </>
      )}
    </>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        px: 2,
        py: 0.75,
        borderRadius: 50,
        cursor: "pointer",
        fontSize: "0.8rem",
        fontWeight: active ? 700 : 500,
        fontFamily: "monospace",
        letterSpacing: "0.05em",
        color: active ? "text.primary" : "text.secondary",
        background: active ? "rgba(108, 99, 255, 0.12)" : "transparent",
        border: active ? "1px solid rgba(108, 99, 255, 0.2)" : "1px solid transparent",
        transition: "all 0.2s",
        "&:hover": { color: "text.primary", background: "rgba(108, 99, 255, 0.06)" },
      }}
    >
      {label}
    </Box>
  );
}
