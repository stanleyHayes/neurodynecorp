import { Box, type SxProps, type Theme } from "@mui/material";

interface LogoProps {
  size?: number;
  sx?: SxProps<Theme>;
}

export default function Logo({ size = 64, sx }: LogoProps) {
  return (
    <Box
      component="svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      sx={{ width: size, height: size, ...sx }}
    >
      <defs>
        <linearGradient
          id="logo-g1"
          x1="0"
          y1="0"
          x2="64"
          y2="64"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#6C63FF" />
          <stop offset="100%" stopColor="#00D4AA" />
        </linearGradient>
        <linearGradient
          id="logo-g2"
          x1="16"
          y1="16"
          x2="48"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#8B85FF" />
          <stop offset="100%" stopColor="#33DDBB" />
        </linearGradient>
      </defs>
      <circle
        cx="32"
        cy="32"
        r="30"
        stroke="url(#logo-g1)"
        strokeWidth="2.5"
        fill="#0A0E1A"
      />
      <path
        d="M22 20c-5 2-8 7-8 13 0 7 5 12 11 13 1 0 2-1 2-2V22c0-1.5-1-2.5-2-2.5"
        stroke="url(#logo-g2)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M25 26c-3 0-6 2-6 5s2 4 4 4"
        stroke="url(#logo-g2)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M25 31c-2 1-3 3-3 5"
        stroke="url(#logo-g2)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M42 20c5 2 8 7 8 13 0 7-5 12-11 13-1 0-2-1-2-2V22c0-1.5 1-2.5 2-2.5"
        stroke="url(#logo-g1)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M39 26c3 0 6 2 6 5s-2 4-4 4"
        stroke="url(#logo-g1)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M39 31c2 1 3 3 3 5"
        stroke="url(#logo-g1)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="20" cy="25" r="2" fill="#6C63FF" />
      <circle cx="44" cy="25" r="2" fill="#00D4AA" />
      <circle cx="18" cy="35" r="1.5" fill="#8B85FF" />
      <circle cx="46" cy="35" r="1.5" fill="#33DDBB" />
      <circle cx="32" cy="17" r="2" fill="url(#logo-g1)" />
      <circle cx="32" cy="44" r="2" fill="url(#logo-g1)" />
      <line
        x1="32"
        y1="17"
        x2="20"
        y2="25"
        stroke="#6C63FF"
        strokeWidth="1"
        opacity="0.6"
      />
      <line
        x1="32"
        y1="17"
        x2="44"
        y2="25"
        stroke="#00D4AA"
        strokeWidth="1"
        opacity="0.6"
      />
      <line
        x1="20"
        y1="25"
        x2="18"
        y2="35"
        stroke="#8B85FF"
        strokeWidth="1"
        opacity="0.4"
      />
      <line
        x1="44"
        y1="25"
        x2="46"
        y2="35"
        stroke="#33DDBB"
        strokeWidth="1"
        opacity="0.4"
      />
      <line
        x1="18"
        y1="35"
        x2="32"
        y2="44"
        stroke="#6C63FF"
        strokeWidth="1"
        opacity="0.4"
      />
      <line
        x1="46"
        y1="35"
        x2="32"
        y2="44"
        stroke="#00D4AA"
        strokeWidth="1"
        opacity="0.4"
      />
    </Box>
  );
}
