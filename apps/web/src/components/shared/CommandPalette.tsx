import { useState, useEffect, useMemo, useRef, type ReactNode } from "react";
import { Box, Typography, InputBase, Stack } from "@mui/material";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MiscellaneousServicesOutlinedIcon from "@mui/icons-material/MiscellaneousServicesOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import XIcon from "@mui/icons-material/X";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardCommandKeyIcon from "@mui/icons-material/KeyboardCommandKey";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";
import HistoryEduOutlinedIcon from "@mui/icons-material/HistoryEduOutlined";
import VideoCallOutlinedIcon from "@mui/icons-material/VideoCallOutlined";
import { useThemeMode } from "@/context/ThemeContext";
import { playSound } from "@/hooks/useSound";

const MotionBox = motion.create(Box);

interface Command {
  id: string;
  label: string;
  group: string;
  icon: ReactNode;
  shortcut?: string;
  action: () => void;
  keywords?: string;
}

interface DynamicItem {
  id: string;
  label: string;
  group: string;
  href: string;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [dynamic, setDynamic] = useState<DynamicItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { mode, toggleTheme } = useThemeMode();

  // Lazy-load dynamic items (blog, portfolio, services) once when palette first opens
  useEffect(() => {
    if (!open || dynamic.length > 0) return;
    const ctrl = new AbortController();
    Promise.all([
      fetch(`${API_BASE}/api/v1/blog?status=published`, { signal: ctrl.signal }).then((r) => r.ok ? r.json() : { items: [] }).catch(() => ({ items: [] })),
      fetch(`${API_BASE}/api/v1/portfolio?status=published`, { signal: ctrl.signal }).then((r) => r.ok ? r.json() : { items: [] }).catch(() => ({ items: [] })),
      fetch(`${API_BASE}/api/v1/services?status=active`, { signal: ctrl.signal }).then((r) => r.ok ? r.json() : { items: [] }).catch(() => ({ items: [] })),
    ]).then(([blog, portfolio, services]) => {
      const items: DynamicItem[] = [];
      for (const p of (blog.items ?? [])) {
        items.push({ id: `blog-${p.id ?? p.slug}`, label: p.title, group: "BLOG", href: `/blog/${p.slug ?? p.id}` });
      }
      for (const c of (portfolio.items ?? [])) {
        items.push({ id: `case-${c.id}`, label: `${c.title} — ${c.client ?? c.category}`, group: "CASE STUDY", href: "/portfolio" });
      }
      for (const s of (services.items ?? [])) {
        items.push({ id: `svc-${s.id}`, label: s.title, group: "SERVICE", href: "/services" });
      }
      setDynamic(items);
    });
    return () => ctrl.abort();
  }, [open, dynamic.length]);

  // Open via Cmd+K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => {
          playSound(v ? "close" : "open");
          return !v;
        });
      }
      if (e.key === "Escape") {
        setOpen((v) => {
          if (v) playSound("close");
          return false;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const close = () => setOpen(false);

  const commands: Command[] = useMemo(
    () => [
      // Navigation
      { id: "home", label: "Home", group: "NAVIGATE", icon: <HomeOutlinedIcon />, shortcut: "G H", action: () => { navigate("/"); close(); } },
      { id: "about", label: "About", group: "NAVIGATE", icon: <InfoOutlinedIcon />, shortcut: "G A", action: () => { navigate("/about"); close(); } },
      { id: "services", label: "Services", group: "NAVIGATE", icon: <MiscellaneousServicesOutlinedIcon />, shortcut: "G S", action: () => { navigate("/services"); close(); } },
      { id: "portfolio", label: "Portfolio", group: "NAVIGATE", icon: <WorkOutlineOutlinedIcon />, shortcut: "G P", action: () => { navigate("/portfolio"); close(); } },
      { id: "blog", label: "Blog", group: "NAVIGATE", icon: <ArticleOutlinedIcon />, shortcut: "G B", action: () => { navigate("/blog"); close(); } },
      { id: "contact", label: "Contact", group: "NAVIGATE", icon: <MailOutlineIcon />, shortcut: "G C", action: () => { navigate("/contact"); close(); } },
      // Resources
      { id: "specs", label: "Spec Library", group: "RESOURCES", icon: <LibraryBooksOutlinedIcon />, action: () => { navigate("/spec-library"); close(); }, keywords: "examples sample document specification" },
      { id: "philosophy", label: "Philosophy", group: "COMPANY", icon: <HistoryEduOutlinedIcon />, action: () => { navigate("/philosophy"); close(); }, keywords: "doctrine principles engineering industries" },
      { id: "standards", label: "Open Standards", group: "COMPANY", icon: <GitHubIcon />, action: () => { navigate("/open-standards"); close(); }, keywords: "nosi interoperability schemas data standards" },
      { id: "research", label: "Research", group: "COMPANY", icon: <GitHubIcon />, action: () => { navigate("/research"); close(); }, keywords: "lab papers ai distributed systems" },
      { id: "projects", label: "Projects", group: "COMPANY", icon: <GitHubIcon />, action: () => { navigate("/projects"); close(); }, keywords: "case studies portfolio systems rentos auraedu" },
      // Actions
      { id: "start", label: "Start a Project", group: "ACTIONS", icon: <RocketLaunchOutlinedIcon />, shortcut: "↵", action: () => { navigate("/start-project"); close(); }, keywords: "begin new build hire quote" },
      { id: "book", label: "Book a Discovery Call", group: "ACTIONS", icon: <VideoCallOutlinedIcon />, action: () => { navigate("/contact"); close(); }, keywords: "calendly meeting schedule chat" },
      { id: "theme", label: mode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode", group: "ACTIONS", icon: mode === "dark" ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />, action: () => { toggleTheme(); close(); } },
      // External
      { id: "github", label: "GitHub", group: "SOCIAL", icon: <GitHubIcon />, action: () => { window.open("https://github.com/stanleyHayes", "_blank"); close(); } },
      { id: "linkedin", label: "LinkedIn", group: "SOCIAL", icon: <LinkedInIcon />, action: () => { window.open("https://linkedin.com/in/stanley-asoku-hayford", "_blank"); close(); } },
      { id: "twitter", label: "Twitter / X", group: "SOCIAL", icon: <XIcon />, action: () => { window.open("https://x.com/stanley_hayford", "_blank"); close(); } },
    ],
    [navigate, mode, toggleTheme]
  );

  // Merge dynamic items as Commands
  const allCommands: Command[] = useMemo(() => {
    const dynCmds: Command[] = dynamic.map((d) => ({
      id: d.id,
      label: d.label,
      group: d.group,
      icon:
        d.group === "BLOG" ? <ArticleOutlinedIcon /> :
        d.group === "CASE STUDY" ? <WorkOutlineOutlinedIcon /> :
        <MiscellaneousServicesOutlinedIcon />,
      action: () => {
        playSound("click");
        navigate(d.href);
        close();
      },
    }));
    return [...commands, ...dynCmds];
  }, [commands, dynamic, navigate]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Hide dynamic items (blog/case/service) when there's no query — keeps the default list short
    if (!q) return commands;
    return allCommands.filter((c) =>
      `${c.label} ${c.group} ${c.keywords ?? ""}`.toLowerCase().includes(q)
    );
  }, [commands, allCommands, query]);

  // Group filtered commands
  const grouped = useMemo(() => {
    const m = new Map<string, Command[]>();
    filtered.forEach((c) => {
      if (!m.has(c.group)) m.set(c.group, []);
      m.get(c.group)!.push(c);
    });
    return Array.from(m.entries());
  }, [filtered]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const cmd = filtered[activeIdx];
        if (cmd) {
          playSound("click");
          cmd.action();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, activeIdx]);

  // Reset active when filter changes
  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  let runningIdx = -1;

  return (
    <AnimatePresence>
      {open && (
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={close}
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            pt: { xs: 8, md: 14 },
            px: 2,
            backdropFilter: "blur(6px)",
            background: "rgba(10, 14, 26, 0.55)",
          }}
        >
          <MotionBox
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            sx={{
              width: "100%",
              maxWidth: 580,
              bgcolor: "background.paper",
              border: "1px solid rgba(108,99,255,0.25)",
              borderRadius: 2,
              boxShadow: "0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(108,99,255,0.15), 0 0 80px rgba(108,99,255,0.18)",
              overflow: "hidden",
            }}
          >
            {/* Search input */}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", px: 2.5, py: 2, borderBottom: "1px solid rgba(108,99,255,0.12)" }}>
              <SearchIcon sx={{ color: "text.secondary", opacity: 0.6, fontSize: 20 }} />
              <InputBase
                inputRef={inputRef}
                fullWidth
                placeholder="Type a command or search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={{
                  fontSize: "0.95rem",
                  color: "text.primary",
                  "& input::placeholder": { color: "text.secondary", opacity: 0.5 },
                }}
              />
              <Box
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.6rem",
                  letterSpacing: "0.1em",
                  color: "text.secondary",
                  opacity: 0.5,
                  border: "1px solid rgba(108,99,255,0.18)",
                  borderRadius: 0.75,
                  px: 0.75,
                  py: 0.25,
                }}
              >
                ESC
              </Box>
            </Stack>

            {/* Results */}
            <Box sx={{ maxHeight: 420, overflowY: "auto", py: 1 }}>
              {filtered.length === 0 ? (
                <Box sx={{ py: 6, textAlign: "center" }}>
                  <Typography sx={{ fontFamily: "monospace", fontSize: "0.75rem", color: "text.secondary", opacity: 0.5 }}>
                    No commands match "{query}"
                  </Typography>
                </Box>
              ) : (
                grouped.map(([group, items]) => (
                  <Box key={group} sx={{ mb: 1 }}>
                    <Typography
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.55rem",
                        fontWeight: 700,
                        letterSpacing: "0.25em",
                        color: "text.secondary",
                        opacity: 0.5,
                        px: 2.5,
                        py: 0.75,
                      }}
                    >
                      {group}
                    </Typography>
                    {items.map((cmd) => {
                      runningIdx++;
                      const active = runningIdx === activeIdx;
                      return (
                        <Stack
                          key={cmd.id}
                          direction="row"
                          spacing={1.5}
                          onMouseEnter={() => setActiveIdx(runningIdx)}
                          onClick={cmd.action}
                          sx={{ alignItems: "center",
                            px: 2.5,
                            py: 1.25,
                            cursor: "pointer",
                            position: "relative",
                            bgcolor: active ? "rgba(108,99,255,0.08)" : "transparent",
                            transition: "background 0.12s",
                            "&::before": active
                              ? {
                                  content: '""',
                                  position: "absolute",
                                  left: 0,
                                  top: 6,
                                  bottom: 6,
                                  width: 2,
                                  bgcolor: "#6C63FF",
                                  borderRadius: "0 2px 2px 0",
                                }
                              : {},
                          }}
                        >
                          <Box sx={{ color: active ? "#6C63FF" : "text.secondary", opacity: active ? 1 : 0.7, "& .MuiSvgIcon-root": { fontSize: 18 } }}>
                            {cmd.icon}
                          </Box>
                          <Typography sx={{ flex: 1, fontSize: "0.85rem", color: "text.primary" }}>
                            {cmd.label}
                          </Typography>
                          {cmd.shortcut && (
                            <Box
                              sx={{
                                fontFamily: "monospace",
                                fontSize: "0.6rem",
                                letterSpacing: "0.1em",
                                color: "text.secondary",
                                opacity: 0.5,
                              }}
                            >
                              {cmd.shortcut}
                            </Box>
                          )}
                        </Stack>
                      );
                    })}
                  </Box>
                ))
              )}
            </Box>

            {/* Footer */}
            <Stack direction="row" spacing={2} sx={{ alignItems: "center", px: 2.5, py: 1.25, borderTop: "1px solid rgba(108,99,255,0.12)", bgcolor: "rgba(108,99,255,0.03)" }}>
              <Stack sx={{ alignItems: "center" }} direction="row" spacing={0.5}>
                <KeyboardCommandKeyIcon sx={{ fontSize: 14, color: "text.secondary", opacity: 0.5 }} />
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", color: "text.secondary", opacity: 0.5, letterSpacing: "0.1em" }}>
                  K to toggle
                </Typography>
              </Stack>
              <Box sx={{ flex: 1 }} />
              <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", color: "text.secondary", opacity: 0.5, letterSpacing: "0.1em" }}>
                ↑↓ navigate &nbsp;·&nbsp; ↵ select
              </Typography>
            </Stack>
          </MotionBox>
        </MotionBox>
      )}
    </AnimatePresence>
  );
}
