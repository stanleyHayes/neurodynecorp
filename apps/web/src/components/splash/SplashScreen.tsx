import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Logo from "@/components/logo/Logo";

const MotionBox = motion.create(Box);
const MotionTypography = motion.create(Typography);

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

const systemNotes = ["Product engineering", "Applied intelligence", "Digital infrastructure"];

export default function SplashScreen({ onComplete, duration = 3200 }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), reduceMotion ? 900 : duration);
    return () => window.clearTimeout(timer);
  }, [duration, reduceMotion]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <MotionBox
          role="status"
          aria-label="NeuroDyne is loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: reduceMotion ? 0 : -24 }}
          transition={{ duration: reduceMotion ? 0.18 : 0.55, ease: [0.76, 0, 0.24, 1] }}
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 1400,
            overflow: "hidden",
            bgcolor: "#080b14",
            color: "#f5f4fa",
          }}
        >
          <Box
            aria-hidden="true"
            sx={{
              position: "absolute",
              inset: 0,
              opacity: 0.46,
              backgroundImage: `
                linear-gradient(rgba(139,133,255,.08) 1px, transparent 1px),
                linear-gradient(90deg, rgba(139,133,255,.08) 1px, transparent 1px)
              `,
              backgroundSize: { xs: "44px 44px", md: "72px 72px" },
              maskImage: "linear-gradient(to bottom, black, transparent 88%)",
            }}
          />

          <MotionBox
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: reduceMotion ? 0 : duration / 1000, ease: [0.45, 0, 0.2, 1] }}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              bgcolor: "#8b85ff",
              transformOrigin: "left center",
            }}
          />

          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              minHeight: "100dvh",
              display: "grid",
              gridTemplateRows: "auto 1fr auto",
              px: { xs: 2.5, sm: 5, lg: 8 },
              py: { xs: 2.5, sm: 4, lg: 5 },
            }}
          >
            <Box component="header" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 34, height: 34, display: "grid", placeItems: "center" }}>
                  <Logo size={34} />
                </Box>
                <Typography sx={{ fontFamily: "monospace", fontSize: 10, letterSpacing: ".2em", color: "rgba(245,244,250,.58)" }}>
                  ND / 00—01
                </Typography>
              </Box>
              <Box
                component="button"
                type="button"
                onClick={() => setVisible(false)}
                sx={{
                  appearance: "none",
                  border: "1px solid rgba(245,244,250,.18)",
                  bgcolor: "rgba(8,11,20,.6)",
                  color: "rgba(245,244,250,.72)",
                  px: 2,
                  py: 1,
                  font: "600 10px monospace",
                  letterSpacing: ".16em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "border-color 180ms ease, color 180ms ease, transform 180ms ease",
                  "&:hover": { borderColor: "#8b85ff", color: "#fff" },
                  "&:active": { transform: "translateY(1px)" },
                  "&:focus-visible": { outline: "2px solid #8b85ff", outlineOffset: 3 },
                }}
              >
                Skip intro
              </Box>
            </Box>

            <Box
              component="main"
              sx={{
                alignSelf: "center",
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "minmax(0,1fr) 20rem" },
                alignItems: "end",
                gap: { xs: 5, lg: 10 },
                width: "100%",
                maxWidth: 1480,
                mx: "auto",
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <MotionTypography
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.15 }}
                  sx={{ mb: { xs: 2.5, md: 4 }, fontFamily: "monospace", fontSize: { xs: 10, md: 11 }, letterSpacing: ".22em", color: "#8b85ff" }}
                >
                  SYSTEMS, DESIGNED WITH INTENT
                </MotionTypography>
                <Box sx={{ overflow: "hidden" }}>
                  <MotionTypography
                    initial={{ y: reduceMotion ? 0 : "108%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.82, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
                    sx={{
                      m: 0,
                      fontFamily: "'TT Squares', 'Outfit', sans-serif",
                      fontSize: { xs: "clamp(3.35rem, 18vw, 5rem)", sm: "clamp(5rem, 13vw, 8rem)", lg: "clamp(7.5rem, 11vw, 11rem)" },
                      fontWeight: 800,
                      lineHeight: 0.76,
                      letterSpacing: "-.07em",
                      textWrap: "balance",
                    }}
                  >
                    Neuro
                  </MotionTypography>
                </Box>
                <Box sx={{ overflow: "hidden", ml: { xs: "10vw", sm: "16vw", lg: "12vw" } }}>
                  <MotionTypography
                    initial={{ y: reduceMotion ? 0 : "-108%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.82, delay: 0.28, ease: [0.76, 0, 0.24, 1] }}
                    sx={{
                      m: 0,
                      color: "#8b85ff",
                      fontFamily: "'TT Squares', 'Outfit', sans-serif",
                      fontSize: { xs: "clamp(3.35rem, 18vw, 5rem)", sm: "clamp(5rem, 13vw, 8rem)", lg: "clamp(7.5rem, 11vw, 11rem)" },
                      fontWeight: 800,
                      lineHeight: 0.8,
                      letterSpacing: "-.07em",
                    }}
                  >
                    Dyne.
                  </MotionTypography>
                </Box>
              </Box>

              <MotionBox
                initial={{ opacity: 0, x: reduceMotion ? 0 : 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.75 }}
                sx={{ borderTop: "1px solid rgba(245,244,250,.2)", pt: 2.5 }}
              >
                <Typography sx={{ maxWidth: 290, fontSize: { xs: 15, md: 17 }, lineHeight: 1.55, color: "rgba(245,244,250,.72)" }}>
                  Building dependable software for consequential work across Africa and beyond.
                </Typography>
                <Box sx={{ mt: 4, display: "grid", gap: 1.25 }}>
                  {systemNotes.map((note, index) => (
                    <Box key={note} sx={{ display: "grid", gridTemplateColumns: "2rem 1fr auto", gap: 1, alignItems: "center" }}>
                      <Typography sx={{ fontFamily: "monospace", fontSize: 9, color: "rgba(245,244,250,.34)" }}>0{index + 1}</Typography>
                      <Typography sx={{ fontSize: 12, color: "rgba(245,244,250,.78)" }}>{note}</Typography>
                      <Box sx={{ width: 5, height: 5, bgcolor: index === 0 ? "#8b85ff" : "rgba(245,244,250,.22)" }} />
                    </Box>
                  ))}
                </Box>
              </MotionBox>
            </Box>

            <Box component="footer" sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 3 }}>
              <Box>
                <Typography sx={{ fontFamily: "monospace", fontSize: 9, letterSpacing: ".16em", color: "rgba(245,244,250,.36)" }}>ACCRA / GH</Typography>
                <Typography sx={{ mt: 0.6, fontFamily: "monospace", fontSize: 9, letterSpacing: ".12em", color: "rgba(245,244,250,.36)" }}>05°33′N · 00°12′W</Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
                  <MotionBox
                    animate={reduceMotion ? undefined : { opacity: [0.35, 1, 0.35] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                    sx={{ width: 6, height: 6, bgcolor: "#8b85ff" }}
                  />
                  <Typography sx={{ fontFamily: "monospace", fontSize: 9, letterSpacing: ".16em", color: "rgba(245,244,250,.58)" }}>INITIALISING</Typography>
                </Box>
                <Typography sx={{ mt: 0.6, fontFamily: "monospace", fontSize: 9, letterSpacing: ".1em", color: "rgba(245,244,250,.3)" }}>NEURODYNE.DEV</Typography>
              </Box>
            </Box>
          </Box>
        </MotionBox>
      )}
    </AnimatePresence>
  );
}
