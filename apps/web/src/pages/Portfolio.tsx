import { useState, useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
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
  title: string;
  client: string;
  category: string;
  tags: string[];
  description: string;
  impact: string;
  results: string[];
  color: string;
}

const BORDER = "rgba(108, 99, 255, 0.12)";


export default function Portfolio() {
  const [filter, setFilter] = useState("All");
  const [projects, setProjects] = useState<(PortfolioItem & { index: string })[]>([]);
  const [loading, setLoading] = useState(true);

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

  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];
  const filtered = filter === "All" ? projects : projects.filter((p) => p.category === filter);

  return (
    <>
      <SEO
        title="Portfolio"
        description="Explore NeuroDyne Corp case studies - Fintech, Healthcare, Supply Chain, E-Commerce, and AI/ML projects delivered with excellence."
        canonical="https://neurodynecorp.com/portfolio"
        ogUrl="https://neurodynecorp.com/portfolio"
      />

      <PageHero
        icon={<WorkIcon />}
        title="Our Portfolio"
        description="Real projects, real results. See what we've built for clients across industries."
        tag="OPERATIONS // LOG"
        accentWord="Portfolio"
        iconColor="#33DDBB"
        iconLabel="ARCHIVE LOADED"
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 12 }}>
          <CircularProgress size={32} sx={{ color: "#6C63FF" }} />
        </Box>
      ) : (
        <>
          {/* Filter bar */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 1,
              flexWrap: "wrap",
              py: 3,
              px: 2,
              borderBottom: `1px solid ${BORDER}`,
            }}
          >
            {categories.map((cat) => {
              const isActive = filter === cat;
              return (
                <Box
                  key={cat}
                  onClick={() => setFilter(cat)}
                  sx={{
                    px: 2,
                    py: 0.75,
                    borderRadius: 50,
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: isActive ? 700 : 500,
                    fontFamily: "monospace",
                    letterSpacing: "0.05em",
                    color: isActive ? "text.primary" : "text.secondary",
                    background: isActive ? "rgba(108, 99, 255, 0.12)" : "transparent",
                    border: isActive ? "1px solid rgba(108, 99, 255, 0.2)" : "1px solid transparent",
                    transition: "all 0.2s",
                    "&:hover": {
                      color: "text.primary",
                      background: "rgba(108, 99, 255, 0.06)",
                    },
                  }}
                >
                  {cat}
                </Box>
              );
            })}
          </Box>

          {/* Grid */}
          {filtered.length === 0 ? (
            <EmptyState
              icon={<WorkIcon />}
              title={filter !== "All" ? "No projects in this category" : "No case studies published yet"}
              description={filter !== "All" ? "Try selecting a different category or view all projects." : "Check back soon to explore our portfolio of delivered projects."}
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
