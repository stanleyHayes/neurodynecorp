import { useState, useEffect } from "react";
import { Box, Stack, Typography, Tooltip } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { playSound } from "@/hooks/useSound";

const MotionBox = motion.create(Box);

const REACTIONS = [
  { emoji: "🚀", label: "Mind blown" },
  { emoji: "💡", label: "Insightful" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "👏", label: "Applause" },
  { emoji: "🤔", label: "Made me think" },
];

interface PostReactionsProps {
  postId: string;
  color?: string;
}

interface Counts {
  [key: string]: number;
}

const STORAGE_PREFIX = "ndl_reactions_";

function seedFor(postId: string): Counts {
  // Deterministic baseline so each post shows some reactions on first visit
  let h = 0;
  for (let i = 0; i < postId.length; i++) h = (h * 31 + postId.charCodeAt(i)) >>> 0;
  return REACTIONS.reduce((acc, r, idx) => {
    acc[r.emoji] = ((h >> (idx * 3)) & 0xff) % 24 + 3;
    return acc;
  }, {} as Counts);
}

export default function PostReactions({ postId, color = "#6C63FF" }: PostReactionsProps) {
  const storageKey = STORAGE_PREFIX + postId;
  const [counts, setCounts] = useState<Counts>(() => seedFor(postId));
  const [reacted, setReacted] = useState<Set<string>>(new Set());
  const [bursting, setBursting] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        setCounts({ ...seedFor(postId), ...parsed.counts });
        setReacted(new Set(parsed.reacted ?? []));
      }
    } catch {
      // ignore
    }
  }, [postId, storageKey]);

  const toggle = (emoji: string) => {
    const wasReacted = reacted.has(emoji);
    const nextReacted = new Set(reacted);
    const nextCounts = { ...counts };

    if (wasReacted) {
      nextReacted.delete(emoji);
      nextCounts[emoji] = Math.max(0, (nextCounts[emoji] ?? 0) - 1);
    } else {
      nextReacted.add(emoji);
      nextCounts[emoji] = (nextCounts[emoji] ?? 0) + 1;
      setBursting(emoji);
      setTimeout(() => setBursting(null), 600);
      playSound("notify");
    }

    setReacted(nextReacted);
    setCounts(nextCounts);

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ counts: nextCounts, reacted: Array.from(nextReacted) })
      );
    } catch {
      // ignore
    }
  };

  return (
    <Box sx={{ py: 4, borderTop: "1px solid rgba(108,99,255,0.12)", borderBottom: "1px solid rgba(108,99,255,0.12)", my: 4 }}>
      <Typography
        sx={{
          fontFamily: "monospace",
          fontSize: "0.65rem",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "text.secondary",
          opacity: 0.5,
          mb: 2,
        }}
      >
        // REACT TO THIS POST
      </Typography>
      <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", gap: 1.5 }}>
        {REACTIONS.map((r) => {
          const active = reacted.has(r.emoji);
          const count = counts[r.emoji] ?? 0;
          return (
            <Tooltip key={r.emoji} title={r.label} placement="top">
              <Box
                onClick={() => toggle(r.emoji)}
                sx={{
                  position: "relative",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.75,
                  px: 2,
                  py: 1,
                  borderRadius: 99,
                  cursor: "pointer",
                  border: active ? `1px solid ${color}` : "1px solid rgba(108,99,255,0.15)",
                  bgcolor: active ? `${color}15` : "transparent",
                  transition: "all 0.2s",
                  userSelect: "none",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    borderColor: color,
                    bgcolor: `${color}10`,
                  },
                }}
              >
                <Typography sx={{ fontSize: "1.1rem", lineHeight: 1 }}>
                  {r.emoji}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: active ? color : "text.secondary",
                  }}
                >
                  {count}
                </Typography>

                {/* Burst */}
                <AnimatePresence>
                  {bursting === r.emoji && (
                    <>
                      {Array.from({ length: 8 }).map((_, i) => {
                        const angle = (Math.PI * 2 * i) / 8;
                        return (
                          <MotionBox
                            key={i}
                            initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
                            animate={{
                              x: Math.cos(angle) * 30,
                              y: Math.sin(angle) * 30,
                              opacity: 0,
                              scale: 1.2,
                            }}
                            transition={{ duration: 0.5 }}
                            sx={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              fontSize: "0.7rem",
                              pointerEvents: "none",
                            }}
                          >
                            {r.emoji}
                          </MotionBox>
                        );
                      })}
                    </>
                  )}
                </AnimatePresence>
              </Box>
            </Tooltip>
          );
        })}
      </Stack>
    </Box>
  );
}
