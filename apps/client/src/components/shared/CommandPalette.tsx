import { useState, useEffect, useMemo, useRef, type ReactNode } from "react";
import { Box, Typography, InputBase, Stack } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardCommandKeyIcon from "@mui/icons-material/KeyboardCommandKey";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
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

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

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
      { id: "dashboard", label: "Dashboard", group: "PAGES", icon: <HomeOutlinedIcon />, shortcut: "G H", action: () => { navigate("/"); close(); } },
      { id: "projects", label: "My Projects", group: "PAGES", icon: <AssignmentOutlinedIcon />, shortcut: "G P", action: () => { navigate("/projects"); close(); } },
      { id: "documents", label: "Documents", group: "PAGES", icon: <InsertDriveFileOutlinedIcon />, shortcut: "G D", action: () => { navigate("/documents"); close(); } },
      { id: "billing", label: "Billing & Invoices", group: "PAGES", icon: <ReceiptLongOutlinedIcon />, shortcut: "G B", action: () => { navigate("/billing"); close(); } },
      { id: "messages", label: "Messages", group: "PAGES", icon: <MailOutlinedIcon />, shortcut: "G M", action: () => { navigate("/messages"); close(); } },
      { id: "notifications", label: "Notifications", group: "PAGES", icon: <NotificationsOutlinedIcon />, action: () => { navigate("/notifications"); close(); } },
      { id: "settings", label: "Settings", group: "ACCOUNT", icon: <SettingsOutlinedIcon />, shortcut: "G S", action: () => { navigate("/settings"); close(); } },
      { id: "logout", label: "Sign Out", group: "ACCOUNT", icon: <LogoutOutlinedIcon />, action: () => { navigate("/login"); close(); }, keywords: "logout exit leave" },
    ],
    [navigate]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      `${c.label} ${c.group} ${c.keywords ?? ""}`.toLowerCase().includes(q)
    );
  }, [commands, query]);

  const grouped = useMemo(() => {
    const m = new Map<string, Command[]>();
    filtered.forEach((c) => {
      if (!m.has(c.group)) m.set(c.group, []);
      m.get(c.group)!.push(c);
    });
    return Array.from(m.entries());
  }, [filtered]);

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
