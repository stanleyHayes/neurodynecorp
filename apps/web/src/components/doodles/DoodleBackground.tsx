import { Box, keyframes } from "@mui/material";

// ── Keyframe animations ──────────────────────────────────────────

const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-12px) rotate(3deg); }
  50% { transform: translateY(-6px) rotate(-2deg); }
  75% { transform: translateY(-15px) rotate(1deg); }
`;

const drift = keyframes`
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(10px, -8px) rotate(5deg); }
  66% { transform: translate(-8px, 5px) rotate(-3deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// ── Doodle SVG Components ────────────────────────────────────────

function BrainDoodle({ x, y, size, delay }: { x: string; y: string; size: number; delay: number }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 80 80"
      sx={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        animation: `${float} ${4 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        opacity: 0.5,
      }}
    >
      <path
        d="M30 15c-8 3-14 11-14 21 0 11 8 19 18 21 1.5 0 3-1.5 3-3V18c0-2.5-1.5-4-3-4"
        stroke="#6C63FF"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M50 15c8 3 14 11 14 21 0 11-8 19-18 21-1.5 0-3-1.5-3-3V18c0-2.5 1.5-4 3-4"
        stroke="#00D4AA"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M34 28c-4 0-8 3-8 7s3 6 6 6" stroke="#8B85FF" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M46 28c4 0 8 3 8 7s-3 6-6 6" stroke="#33DDBB" strokeWidth="1" fill="none" strokeLinecap="round" />
      <circle cx="25" cy="30" r="2" fill="#6C63FF" opacity="0.6" />
      <circle cx="55" cy="30" r="2" fill="#00D4AA" opacity="0.6" />
    </Box>
  );
}

function NeuralNetDoodle({ x, y, size, delay }: { x: string; y: string; size: number; delay: number }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 100 100"
      sx={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        animation: `${drift} ${6 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        opacity: 0.4,
      }}
    >
      <circle cx="20" cy="30" r="4" fill="#6C63FF" />
      <circle cx="20" cy="70" r="4" fill="#6C63FF" />
      <circle cx="50" cy="20" r="4" fill="#8B85FF" />
      <circle cx="50" cy="50" r="4" fill="#8B85FF" />
      <circle cx="50" cy="80" r="4" fill="#8B85FF" />
      <circle cx="80" cy="35" r="4" fill="#00D4AA" />
      <circle cx="80" cy="65" r="4" fill="#00D4AA" />
      <line x1="20" y1="30" x2="50" y2="20" stroke="#6C63FF" strokeWidth="0.8" opacity="0.5" />
      <line x1="20" y1="30" x2="50" y2="50" stroke="#6C63FF" strokeWidth="0.8" opacity="0.5" />
      <line x1="20" y1="70" x2="50" y2="50" stroke="#6C63FF" strokeWidth="0.8" opacity="0.5" />
      <line x1="20" y1="70" x2="50" y2="80" stroke="#6C63FF" strokeWidth="0.8" opacity="0.5" />
      <line x1="50" y1="20" x2="80" y2="35" stroke="#00D4AA" strokeWidth="0.8" opacity="0.5" />
      <line x1="50" y1="50" x2="80" y2="35" stroke="#00D4AA" strokeWidth="0.8" opacity="0.5" />
      <line x1="50" y1="50" x2="80" y2="65" stroke="#00D4AA" strokeWidth="0.8" opacity="0.5" />
      <line x1="50" y1="80" x2="80" y2="65" stroke="#00D4AA" strokeWidth="0.8" opacity="0.5" />
      <line x1="20" y1="30" x2="50" y2="80" stroke="#8B85FF" strokeWidth="0.5" opacity="0.3" />
      <line x1="20" y1="70" x2="50" y2="20" stroke="#8B85FF" strokeWidth="0.5" opacity="0.3" />
    </Box>
  );
}

function ChipDoodle({ x, y, size, delay }: { x: string; y: string; size: number; delay: number }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 60 60"
      sx={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        animation: `${float} ${5 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        opacity: 0.45,
      }}
    >
      <rect x="15" y="15" width="30" height="30" rx="4" stroke="#00D4AA" strokeWidth="1.5" fill="none" />
      <rect x="22" y="22" width="16" height="16" rx="2" stroke="#6C63FF" strokeWidth="1" fill="none" />
      {[20, 30, 40].map((pos) => (
        <g key={`pin-${pos}`}>
          <line x1={pos} y1="15" x2={pos} y2="8" stroke="#33DDBB" strokeWidth="1.2" />
          <line x1={pos} y1="45" x2={pos} y2="52" stroke="#33DDBB" strokeWidth="1.2" />
          <line x1="15" y1={pos} x2="8" y2={pos} stroke="#8B85FF" strokeWidth="1.2" />
          <line x1="45" y1={pos} x2="52" y2={pos} stroke="#8B85FF" strokeWidth="1.2" />
        </g>
      ))}
      <circle cx="30" cy="30" r="3" fill="#6C63FF" opacity="0.5" />
    </Box>
  );
}

function LightbulbDoodle({ x, y, size, delay }: { x: string; y: string; size: number; delay: number }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 50 70"
      sx={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size * 1.4,
        animation: `${pulse} ${3 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      <path
        d="M25 5C14 5 7 13 7 22c0 6 3 10 7 14 2 2 3 4 3 7h16c0-3 1-5 3-7 4-4 7-8 7-14 0-9-7-17-18-17z"
        stroke="#F59E0B"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <line x1="17" y1="48" x2="33" y2="48" stroke="#F59E0B" strokeWidth="1.2" />
      <line x1="19" y1="52" x2="31" y2="52" stroke="#F59E0B" strokeWidth="1.2" />
      <line x1="22" y1="56" x2="28" y2="56" stroke="#F59E0B" strokeWidth="1.2" />
      <line x1="25" y1="0" x2="25" y2="-4" stroke="#F59E0B" strokeWidth="0.8" opacity="0.5" />
      <line x1="4" y1="22" x2="0" y2="22" stroke="#F59E0B" strokeWidth="0.8" opacity="0.5" />
      <line x1="46" y1="22" x2="50" y2="22" stroke="#F59E0B" strokeWidth="0.8" opacity="0.5" />
      <line x1="10" y1="8" x2="7" y2="5" stroke="#F59E0B" strokeWidth="0.8" opacity="0.5" />
      <line x1="40" y1="8" x2="43" y2="5" stroke="#F59E0B" strokeWidth="0.8" opacity="0.5" />
    </Box>
  );
}

function GearDoodle({ x, y, size, delay }: { x: string; y: string; size: number; delay: number }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 50 50"
      sx={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        animation: `${spin} ${10 + delay * 3}s linear infinite`,
        opacity: 0.35,
      }}
    >
      <path
        d="M25 10 L27 3 L23 3Z M25 40 L27 47 L23 47Z M10 25 L3 27 L3 23Z M40 25 L47 27 L47 23Z M14 14 L9 9 L12 7Z M36 36 L41 41 L38 43Z M14 36 L9 41 L7 38Z M36 14 L41 9 L43 12Z"
        fill="#6C63FF"
        opacity="0.6"
      />
      <circle cx="25" cy="25" r="12" stroke="#6C63FF" strokeWidth="1.5" fill="none" />
      <circle cx="25" cy="25" r="5" stroke="#8B85FF" strokeWidth="1" fill="none" />
    </Box>
  );
}

function CodeBracketDoodle({ x, y, size, delay }: { x: string; y: string; size: number; delay: number }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 80 50"
      sx={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size * 0.625,
        animation: `${drift} ${5 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        opacity: 0.4,
      }}
    >
      <path d="M25 5 L8 25 L25 45" stroke="#00D4AA" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M55 5 L72 25 L55 45" stroke="#00D4AA" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="45" y1="5" x2="35" y2="45" stroke="#6C63FF" strokeWidth="1.5" strokeLinecap="round" />
    </Box>
  );
}

function DNADoodle({ x, y, size, delay }: { x: string; y: string; size: number; delay: number }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 40 100"
      sx={{
        position: "absolute",
        left: x,
        top: y,
        width: size * 0.4,
        height: size,
        animation: `${float} ${6 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        opacity: 0.35,
      }}
    >
      <path d="M10 5 C10 20, 30 20, 30 35 C30 50, 10 50, 10 65 C10 80, 30 80, 30 95" stroke="#8B85FF" strokeWidth="1.5" fill="none" />
      <path d="M30 5 C30 20, 10 20, 10 35 C10 50, 30 50, 30 65 C30 80, 10 80, 10 95" stroke="#00D4AA" strokeWidth="1.5" fill="none" />
      {[20, 35, 50, 65, 80].map((cy) => (
        <line key={cy} x1="12" y1={cy} x2="28" y2={cy} stroke="#33DDBB" strokeWidth="0.8" opacity="0.5" />
      ))}
    </Box>
  );
}

function SatelliteDoodle({ x, y, size, delay }: { x: string; y: string; size: number; delay: number }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 60 60"
      sx={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        animation: `${drift} ${7 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        opacity: 0.4,
      }}
    >
      <rect x="22" y="22" width="16" height="16" rx="3" stroke="#6C63FF" strokeWidth="1.5" fill="none" transform="rotate(45 30 30)" />
      <rect x="2" y="26" width="18" height="8" rx="2" stroke="#00D4AA" strokeWidth="1" fill="none" />
      <rect x="40" y="26" width="18" height="8" rx="2" stroke="#00D4AA" strokeWidth="1" fill="none" />
      <line x1="5" y1="28" x2="5" y2="32" stroke="#33DDBB" strokeWidth="0.8" />
      <line x1="10" y1="28" x2="10" y2="32" stroke="#33DDBB" strokeWidth="0.8" />
      <line x1="15" y1="28" x2="15" y2="32" stroke="#33DDBB" strokeWidth="0.8" />
      <line x1="45" y1="28" x2="45" y2="32" stroke="#33DDBB" strokeWidth="0.8" />
      <line x1="50" y1="28" x2="50" y2="32" stroke="#33DDBB" strokeWidth="0.8" />
      <line x1="55" y1="28" x2="55" y2="32" stroke="#33DDBB" strokeWidth="0.8" />
      <path d="M38 18 C42 14, 46 14, 50 10" stroke="#8B85FF" strokeWidth="0.8" fill="none" opacity="0.5" />
      <path d="M40 15 C44 11, 48 11, 52 7" stroke="#8B85FF" strokeWidth="0.6" fill="none" opacity="0.3" />
    </Box>
  );
}

function RobotDoodle({ x, y, size, delay }: { x: string; y: string; size: number; delay: number }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 60 70"
      sx={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size * 1.16,
        animation: `${float} ${5 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        opacity: 0.4,
      }}
    >
      <line x1="30" y1="8" x2="30" y2="18" stroke="#8B85FF" strokeWidth="1.5" />
      <circle cx="30" cy="5" r="3" fill="#6C63FF" opacity="0.6" />
      <rect x="12" y="18" width="36" height="28" rx="6" stroke="#6C63FF" strokeWidth="1.5" fill="none" />
      <circle cx="22" cy="32" r="4" stroke="#00D4AA" strokeWidth="1.2" fill="none" />
      <circle cx="22" cy="32" r="1.5" fill="#00D4AA" />
      <circle cx="38" cy="32" r="4" stroke="#00D4AA" strokeWidth="1.2" fill="none" />
      <circle cx="38" cy="32" r="1.5" fill="#00D4AA" />
      <line x1="22" y1="40" x2="38" y2="40" stroke="#33DDBB" strokeWidth="1" strokeLinecap="round" />
      <rect x="16" y="48" width="28" height="16" rx="4" stroke="#6C63FF" strokeWidth="1.2" fill="none" />
      <line x1="24" y1="52" x2="24" y2="60" stroke="#8B85FF" strokeWidth="0.8" />
      <line x1="30" y1="52" x2="30" y2="60" stroke="#8B85FF" strokeWidth="0.8" />
      <line x1="36" y1="52" x2="36" y2="60" stroke="#8B85FF" strokeWidth="0.8" />
      <line x1="12" y1="52" x2="4" y2="58" stroke="#6C63FF" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="48" y1="52" x2="56" y2="58" stroke="#6C63FF" strokeWidth="1.2" strokeLinecap="round" />
    </Box>
  );
}

function CircuitBoardDoodle({ x, y, size, delay }: { x: string; y: string; size: number; delay: number }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 100 80"
      sx={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size * 0.8,
        animation: `${drift} ${6 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        opacity: 0.3,
      }}
    >
      <path d="M10 40 L30 40 L30 20 L60 20 L60 40 L90 40" stroke="#00D4AA" strokeWidth="1" fill="none" />
      <path d="M10 60 L40 60 L40 40 L70 40 L70 60 L90 60" stroke="#6C63FF" strokeWidth="1" fill="none" />
      <path d="M50 10 L50 30" stroke="#8B85FF" strokeWidth="0.8" fill="none" />
      <path d="M50 50 L50 70" stroke="#8B85FF" strokeWidth="0.8" fill="none" />
      <circle cx="30" cy="40" r="3" fill="#00D4AA" opacity="0.5" />
      <circle cx="60" cy="20" r="3" fill="#00D4AA" opacity="0.5" />
      <circle cx="60" cy="40" r="3" fill="#6C63FF" opacity="0.5" />
      <circle cx="40" cy="60" r="3" fill="#6C63FF" opacity="0.5" />
      <circle cx="50" cy="30" r="2" fill="#8B85FF" opacity="0.4" />
      <circle cx="50" cy="50" r="2" fill="#8B85FF" opacity="0.4" />
      <circle cx="70" cy="40" r="2.5" fill="#33DDBB" opacity="0.4" />
    </Box>
  );
}

function EyeDoodle({ x, y, size, delay }: { x: string; y: string; size: number; delay: number }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 70 40"
      sx={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size * 0.57,
        animation: `${pulse} ${4 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      <path d="M5 20 Q35 -5 65 20 Q35 45 5 20Z" stroke="#6C63FF" strokeWidth="1.5" fill="none" />
      <circle cx="35" cy="20" r="10" stroke="#00D4AA" strokeWidth="1.2" fill="none" />
      <circle cx="35" cy="20" r="4" fill="#00D4AA" opacity="0.6" />
      <circle cx="37" cy="17" r="2" fill="#fff" opacity="0.3" />
    </Box>
  );
}

function WaveDoodle({ x, y, size, delay }: { x: string; y: string; size: number; delay: number }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 120 40"
      sx={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size * 0.33,
        animation: `${drift} ${5 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        opacity: 0.35,
      }}
    >
      <path d="M0 20 Q15 5 30 20 Q45 35 60 20 Q75 5 90 20 Q105 35 120 20" stroke="#8B85FF" strokeWidth="1.5" fill="none" />
      <path d="M0 25 Q15 10 30 25 Q45 40 60 25 Q75 10 90 25 Q105 40 120 25" stroke="#00D4AA" strokeWidth="1" fill="none" opacity="0.5" />
    </Box>
  );
}

function AtomDoodle({ x, y, size, delay }: { x: string; y: string; size: number; delay: number }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 80 80"
      sx={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        animation: `${spin} ${12 + delay * 2}s linear infinite`,
        opacity: 0.35,
      }}
    >
      <ellipse cx="40" cy="40" rx="30" ry="12" stroke="#6C63FF" strokeWidth="1" fill="none" />
      <ellipse cx="40" cy="40" rx="30" ry="12" stroke="#00D4AA" strokeWidth="1" fill="none" transform="rotate(60 40 40)" />
      <ellipse cx="40" cy="40" rx="30" ry="12" stroke="#8B85FF" strokeWidth="1" fill="none" transform="rotate(120 40 40)" />
      <circle cx="40" cy="40" r="4" fill="#6C63FF" opacity="0.7" />
    </Box>
  );
}

function CloudDoodle({ x, y, size, delay }: { x: string; y: string; size: number; delay: number }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 90 50"
      sx={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size * 0.55,
        animation: `${drift} ${8 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        opacity: 0.3,
      }}
    >
      <path
        d="M20 35 Q5 35 5 25 Q5 15 18 15 Q20 5 35 5 Q48 5 50 15 Q55 10 65 12 Q80 14 80 25 Q80 35 65 35Z"
        stroke="#00D4AA"
        strokeWidth="1.2"
        fill="none"
      />
      <line x1="25" y1="38" x2="25" y2="45" stroke="#33DDBB" strokeWidth="0.8" strokeDasharray="2 2" />
      <line x1="40" y1="38" x2="40" y2="48" stroke="#33DDBB" strokeWidth="0.8" strokeDasharray="2 2" />
      <line x1="55" y1="38" x2="55" y2="44" stroke="#33DDBB" strokeWidth="0.8" strokeDasharray="2 2" />
    </Box>
  );
}

function BinaryDoodle({ x, y, size, delay }: { x: string; y: string; size: number; delay: number }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 60 80"
      sx={{
        position: "absolute",
        left: x,
        top: y,
        width: size * 0.75,
        height: size,
        animation: `${float} ${5 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        opacity: 0.25,
      }}
    >
      <text x="5" y="15" fill="#6C63FF" fontSize="10" fontFamily="monospace">01</text>
      <text x="25" y="28" fill="#00D4AA" fontSize="10" fontFamily="monospace">10</text>
      <text x="10" y="41" fill="#8B85FF" fontSize="10" fontFamily="monospace">11</text>
      <text x="30" y="54" fill="#33DDBB" fontSize="10" fontFamily="monospace">01</text>
      <text x="5" y="67" fill="#6C63FF" fontSize="10" fontFamily="monospace">10</text>
      <text x="28" y="78" fill="#00D4AA" fontSize="10" fontFamily="monospace">00</text>
    </Box>
  );
}

// ── Doodle Layout Presets ────────────────────────────────────────

interface DoodleBackgroundProps {
  /** "dense" = lots of doodles (404, splash), "sparse" = subtle background */
  density?: "dense" | "sparse";
}

export default function DoodleBackground({ density = "dense" }: DoodleBackgroundProps) {
  if (density === "sparse") {
    return (
      <Box sx={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <BrainDoodle x="5%" y="10%" size={70} delay={0} />
        <NeuralNetDoodle x="78%" y="8%" size={90} delay={0.5} />
        <ChipDoodle x="88%" y="60%" size={50} delay={0.8} />
        <GearDoodle x="8%" y="75%" size={40} delay={0.3} />
        <CodeBracketDoodle x="60%" y="85%" size={60} delay={1.2} />
        <DNADoodle x="92%" y="30%" size={65} delay={0.6} />
        <AtomDoodle x="15%" y="45%" size={55} delay={1} />
        <WaveDoodle x="40%" y="92%" size={80} delay={0.4} />
        <CloudDoodle x="70%" y="5%" size={60} delay={1.5} />
        <BinaryDoodle x="50%" y="50%" size={50} delay={0.9} />
      </Box>
    );
  }

  return (
    <Box sx={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* Brains */}
      <BrainDoodle x="3%" y="8%" size={90} delay={0} />
      <BrainDoodle x="82%" y="72%" size={70} delay={1.5} />
      <BrainDoodle x="60%" y="5%" size={55} delay={2.8} />

      {/* Neural networks */}
      <NeuralNetDoodle x="75%" y="10%" size={120} delay={0.5} />
      <NeuralNetDoodle x="2%" y="60%" size={100} delay={2} />
      <NeuralNetDoodle x="45%" y="78%" size={90} delay={3.2} />

      {/* Chips */}
      <ChipDoodle x="88%" y="40%" size={65} delay={0.8} />
      <ChipDoodle x="15%" y="80%" size={55} delay={2.3} />
      <ChipDoodle x="35%" y="5%" size={50} delay={1.1} />

      {/* Lightbulbs */}
      <LightbulbDoodle x="92%" y="8%" size={40} delay={0.3} />
      <LightbulbDoodle x="5%" y="35%" size={35} delay={1.8} />

      {/* Gears */}
      <GearDoodle x="20%" y="15%" size={50} delay={0} />
      <GearDoodle x="70%" y="85%" size={45} delay={1.2} />
      <GearDoodle x="85%" y="55%" size={35} delay={0.5} />

      {/* Code brackets */}
      <CodeBracketDoodle x="55%" y="88%" size={80} delay={0.6} />
      <CodeBracketDoodle x="8%" y="48%" size={60} delay={2.5} />

      {/* DNA */}
      <DNADoodle x="95%" y="25%" size={80} delay={1} />
      <DNADoodle x="0%" y="70%" size={70} delay={0.4} />

      {/* Satellites */}
      <SatelliteDoodle x="40%" y="2%" size={55} delay={0.7} />
      <SatelliteDoodle x="75%" y="45%" size={50} delay={2.1} />

      {/* Robots */}
      <RobotDoodle x="12%" y="88%" size={50} delay={0.9} />
      <RobotDoodle x="80%" y="20%" size={45} delay={1.6} />

      {/* Circuit boards */}
      <CircuitBoardDoodle x="25%" y="55%" size={110} delay={0.2} />
      <CircuitBoardDoodle x="55%" y="35%" size={90} delay={1.4} />

      {/* Eyes (AI vision) */}
      <EyeDoodle x="48%" y="12%" size={60} delay={0.5} />
      <EyeDoodle x="10%" y="25%" size={50} delay={2.2} />
      <EyeDoodle x="72%" y="62%" size={55} delay={1.3} />

      {/* Waves */}
      <WaveDoodle x="30%" y="68%" size={100} delay={0.8} />
      <WaveDoodle x="60%" y="20%" size={80} delay={1.7} />
      <WaveDoodle x="5%" y="92%" size={90} delay={2.6} />

      {/* Atoms */}
      <AtomDoodle x="18%" y="42%" size={70} delay={0.4} />
      <AtomDoodle x="65%" y="50%" size={55} delay={1.8} />

      {/* Clouds */}
      <CloudDoodle x="30%" y="3%" size={70} delay={0.6} />
      <CloudDoodle x="78%" y="88%" size={60} delay={2.4} />

      {/* Binary */}
      <BinaryDoodle x="42%" y="60%" size={55} delay={1.3} />
      <BinaryDoodle x="90%" y="15%" size={45} delay={0.7} />
      <BinaryDoodle x="3%" y="92%" size={50} delay={2.0} />
    </Box>
  );
}
