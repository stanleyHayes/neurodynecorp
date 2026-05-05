import { useState } from "react";
import { Box, Typography, Stack, Avatar } from "@mui/material";
import { motion } from "framer-motion";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import TrackChangesOutlinedIcon from "@mui/icons-material/TrackChangesOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";

const MotionBox = motion.create(Box);

const BORDER = "rgba(108, 99, 255, 0.12)";

// ── Data ──

const topCells = [
  {
    tag: "VISION",
    title: "Where We're Going",
    icon: <RocketLaunchOutlinedIcon />,
    body: "To become the world's leading productized software engineering platform — where any business can transform an idea into a professionally specified, precisely estimated, and expertly delivered software product.",
    color: "#6C63FF",
    index: "01",
  },
  {
    tag: "MISSION",
    title: "What Drives Us",
    icon: <TrackChangesOutlinedIcon />,
    body: "To replace the chaos of traditional software consulting with an intelligent, transparent, and automated system that delivers better outcomes for both clients and engineering teams.",
    color: "#00D4AA",
    index: "02",
  },
];

const values = [
  { title: "Innovation", body: "We push boundaries with cutting-edge technology to deliver solutions that set new standards.", icon: <LightbulbOutlinedIcon />, color: "#6C63FF", index: "03" },
  { title: "Transparency", body: "Every step of our process is visible to you. No black boxes, no surprises.", icon: <VisibilityOutlinedIcon />, color: "#00D4AA", index: "04" },
  { title: "Quality", body: "We don't ship until it's right. Rigorous testing, clean code, and thoughtful architecture.", icon: <VerifiedOutlinedIcon />, color: "#8B85FF", index: "05" },
  { title: "Partnership", body: "We're not just vendors — we're your technical co-founders, invested in your success.", icon: <HandshakeOutlinedIcon />, color: "#33DDBB", index: "06" },
];

const team = [
  { name: "Alex Mercer", role: "CEO & Founder", avatar: "AM", color: "#6C63FF", index: "07" },
  { name: "Priya Sharma", role: "CTO", avatar: "PS", color: "#00D4AA", index: "08" },
  { name: "David Kim", role: "Lead Engineer", avatar: "DK", color: "#8B85FF", index: "09" },
  { name: "Maria Santos", role: "Head of Design", avatar: "MS", color: "#33DDBB", index: "10" },
  { name: "James Wright", role: "DevOps Lead", avatar: "JW", color: "#6C63FF", index: "11" },
  { name: "Aisha Patel", role: "AI/ML Lead", avatar: "AP", color: "#00D4AA", index: "12" },
];

// ── Reusable cell wrapper ──

function Cell({
  children,
  color,
  index,
  colInRow,
  totalCols,
  minH = { xs: 240, md: 300 },
  animDelay = 0,
}: {
  children: React.ReactNode;
  color: string;
  index: string;
  colInRow: number;
  totalCols: number;
  minH?: Record<string, number>;
  animDelay?: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: animDelay }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        minHeight: minH,
        p: { xs: 3, md: 4 },
        position: "relative",
        overflow: "hidden",
        borderRight: { xs: "none", md: colInRow < totalCols - 1 ? `1px solid ${BORDER}` : "none" },
        borderBottom: `1px solid ${BORDER}`,
        background: hovered ? `${color}06` : "transparent",
        transition: "background 0.3s",
      }}
    >
      {/* Corner brackets */}
      {[
        { top: 12, left: 12, bT: true, bL: true },
        { top: 12, right: 12, bT: true, bR: true },
        { bottom: 12, left: 12, bB: true, bL: true },
        { bottom: 12, right: 12, bB: true, bR: true },
      ].map((pos, ci) => (
        <Box
          key={ci}
          sx={{
            position: "absolute",
            ...(pos.top !== undefined && { top: pos.top }),
            ...(pos.bottom !== undefined && { bottom: pos.bottom }),
            ...(pos.left !== undefined && { left: pos.left }),
            ...(pos.right !== undefined && { right: pos.right }),
            width: 16,
            height: 16,
            borderTop: pos.bT ? `2px solid ${color}${hovered ? "80" : "30"}` : "none",
            borderBottom: pos.bB ? `2px solid ${color}${hovered ? "80" : "30"}` : "none",
            borderLeft: pos.bL ? `2px solid ${color}${hovered ? "80" : "30"}` : "none",
            borderRight: pos.bR ? `2px solid ${color}${hovered ? "80" : "30"}` : "none",
            filter: hovered ? `drop-shadow(0 0 6px ${color}50)` : "none",
            transition: "all 0.3s",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
      ))}

      {/* Hover glow */}
      {hovered && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "60%",
            height: "60%",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`,
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Index */}
      <Typography
        sx={{
          position: "absolute",
          top: 16,
          left: 40,
          fontSize: "0.65rem",
          fontFamily: "monospace",
          color: hovered ? color : "text.secondary",
          opacity: 0.5,
          letterSpacing: "0.15em",
          transition: "color 0.3s",
          zIndex: 2,
        }}
      >
        {index}
      </Typography>

      {/* Bottom accent line */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: "10%",
          right: "10%",
          height: 2,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: hovered ? 0.6 : 0,
          transition: "opacity 0.3s",
          pointerEvents: "none",
        }}
      />

      <Box sx={{ position: "relative", zIndex: 1 }}>{children}</Box>
    </MotionBox>
  );
}

// ── Page ──

export default function About() {
  return (
    <>
      <SEO
        title="About Us"
        description="Learn about NeuroDyne Corp - our vision, mission, culture, and the team behind the productized software engineering platform."
        canonical="https://neurodynecorp.com/about"
        ogUrl="https://neurodynecorp.com/about"
      />

      <PageHero
        icon={<InfoOutlinedIcon />}
        title="About NeuroDyne Corp"
        description="We're building the future of software engineering — where structured intelligence replaces vague conversations, and every project starts with clarity."
        tag="INTEL // BRIEF"
        accentWord="NeuroDyne Corp"
        iconColor="#8B85FF"
        iconLabel="DOSSIER LOADED"
      />

      {/* Vision & Mission — 2 columns */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
          borderTop: `1px solid ${BORDER}`,
        }}
      >
        {topCells.map((cell, i) => (
          <Cell key={cell.index} color={cell.color} index={cell.index} colInRow={i} totalCols={2} minH={{ xs: 260, md: 340 }} animDelay={i * 0.08}>
            <Box
              sx={{
                color: cell.color,
                mb: 2,
                "& .MuiSvgIcon-root": { fontSize: { xs: 36, md: 44 } },
                filter: `drop-shadow(0 0 4px ${cell.color}40)`,
              }}
            >
              {cell.icon}
            </Box>
            <Typography
              sx={{
                fontSize: "0.6rem",
                fontFamily: "monospace",
                fontWeight: 600,
                color: cell.color,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                mb: 1,
                opacity: 0.7,
              }}
            >
              {cell.tag}
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mb: 2, letterSpacing: "-0.02em", textTransform: "uppercase", color: "text.secondary" }}>
              {cell.title}
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.8, opacity: 0.7 }}>
              {cell.body}
            </Typography>
          </Cell>
        ))}
      </Box>

      {/* Section label */}
      <Box sx={{ borderBottom: `1px solid ${BORDER}`, py: 2, px: 4 }}>
        <Typography sx={{ fontSize: "0.7rem", fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.3em", color: "#6C63FF", filter: "drop-shadow(0 0 6px rgba(108,99,255,0.6))" }}>
          CORE VALUES
        </Typography>
      </Box>

      {/* Values — 4 columns */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
        }}
      >
        {values.map((v, i) => (
          <Cell key={v.index} color={v.color} index={v.index} colInRow={i} totalCols={4} minH={{ xs: 220, md: 280 }} animDelay={i * 0.06}>
            <Box
              sx={{
                color: v.color,
                mb: 2,
                "& .MuiSvgIcon-root": { fontSize: { xs: 32, md: 40 } },
                filter: `drop-shadow(0 0 4px ${v.color}40)`,
              }}
            >
              {v.icon}
            </Box>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1, letterSpacing: "0.05em", textTransform: "uppercase", color: "text.secondary" }}>
              {v.title}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7, opacity: 0.6 }}>
              {v.body}
            </Typography>
          </Cell>
        ))}
      </Box>

      {/* Section label */}
      <Box sx={{ borderBottom: `1px solid ${BORDER}`, py: 2, px: 4 }}>
        <Typography sx={{ fontSize: "0.7rem", fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.3em", color: "#00D4AA", filter: "drop-shadow(0 0 6px rgba(0,212,170,0.6))" }}>
          THE TEAM
        </Typography>
      </Box>

      {/* Team — 6 columns (3 on tablet, 1 on mobile) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(6, 1fr)" },
        }}
      >
        {team.map((member, i) => (
          <Cell key={member.index} color={member.color} index={member.index} colInRow={i} totalCols={6} minH={{ xs: 200, md: 240 }} animDelay={i * 0.05}>
            <Stack alignItems="center" spacing={1.5}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  background: `linear-gradient(135deg, ${member.color}30, ${member.color}10)`,
                  border: `1px solid ${member.color}30`,
                  color: member.color,
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  fontFamily: "monospace",
                  filter: `drop-shadow(0 0 8px ${member.color}30)`,
                }}
              >
                {member.avatar}
              </Avatar>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ letterSpacing: "0.02em" }}>
                  {member.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.6rem",
                    color: member.color,
                    letterSpacing: "0.1em",
                    opacity: 0.7,
                  }}
                >
                  {member.role}
                </Typography>
              </Box>
            </Stack>
          </Cell>
        ))}
      </Box>

      {/* Bottom CTA row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: { xs: 4, md: 5 },
          borderBottom: `1px solid ${BORDER}`,
          position: "relative",
        }}
      >
        <Stack alignItems="center" spacing={1}>
          <GroupsOutlinedIcon sx={{ fontSize: 32, color: "#6C63FF", filter: "drop-shadow(0 0 6px rgba(108,99,255,0.4))" }} />
          <Typography
            sx={{
              fontFamily: "monospace",
              fontSize: "0.65rem",
              color: "text.secondary",
              letterSpacing: "0.2em",
              opacity: 0.5,
            }}
          >
            ENGINEERING INTELLIGENCE. SOLVING TOMORROW.
          </Typography>
        </Stack>
      </Box>
    </>
  );
}
