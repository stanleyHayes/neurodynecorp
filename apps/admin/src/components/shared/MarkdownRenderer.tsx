import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Box, Typography } from "@mui/material";

interface MarkdownRendererProps {
  content: string;
  color?: string;
}

const baseSx = (color: string) => ({
  "& h1": { color: "text.primary", fontWeight: 800, fontSize: "1.8rem", mt: 4, mb: 2, letterSpacing: "-0.02em" },
  "& h2": { color: "text.primary", fontWeight: 700, fontSize: "1.5rem", mt: 4, mb: 1.5, letterSpacing: "-0.01em" },
  "& h3": { color: "text.primary", fontWeight: 600, fontSize: "1.2rem", mt: 3, mb: 1 },
  "& p": { color: "text.secondary", lineHeight: 1.85, mb: 2, fontSize: "0.95rem" },
  "& a": { color, textDecoration: "none", fontWeight: 500, borderBottom: `1px solid ${color}40`, "&:hover": { borderColor: color } },
  "& ul, & ol": { color: "text.secondary", pl: 3, mb: 2, "& li": { mb: 0.75, lineHeight: 1.7 } },
  "& blockquote": {
    borderLeft: `3px solid ${color}`,
    pl: 3,
    py: 0.5,
    my: 3,
    mx: 0,
    background: `${color}08`,
    borderRadius: "0 8px 8px 0",
    "& p": { color: "text.secondary", fontStyle: "italic", mb: 0 },
  },
  "& code": {
    fontFamily: "monospace",
    fontSize: "0.85em",
    background: "rgba(108, 99, 255, 0.1)",
    color: "#8B85FF",
    px: 0.8,
    py: 0.2,
    borderRadius: 1,
  },
  "& pre": {
    background: "rgba(10, 14, 26, 0.8)",
    border: "1px solid rgba(108, 99, 255, 0.1)",
    borderRadius: 3,
    p: 3,
    mb: 3,
    overflowX: "auto",
    "& code": { background: "none", color: "#c9d1d9", px: 0, py: 0, fontSize: "0.85rem", lineHeight: 1.7 },
  },
  "& table": {
    width: "100%",
    borderCollapse: "collapse",
    mb: 3,
    "& th": { textAlign: "left", py: 1.5, px: 2, fontWeight: 600, fontSize: "0.85rem", color: "text.primary", borderBottom: "2px solid rgba(108, 99, 255, 0.15)", background: "rgba(108, 99, 255, 0.04)" },
    "& td": { py: 1.5, px: 2, fontSize: "0.85rem", color: "text.secondary", borderBottom: "1px solid rgba(108, 99, 255, 0.08)" },
  },
  "& hr": { border: "none", height: 1, background: "rgba(108, 99, 255, 0.12)", my: 4 },
  "& strong": { color: "text.primary", fontWeight: 600 },
  "& em": { fontStyle: "italic" },
  "& img": { maxWidth: "100%", borderRadius: 3, border: "1px solid rgba(108, 99, 255, 0.1)" },
});

export default function MarkdownRenderer({ content, color = "#6C63FF" }: MarkdownRendererProps) {
  if (!content?.trim()) {
    return (
      <Typography sx={{ fontFamily: "monospace", fontSize: "0.8rem", color: "text.secondary", opacity: 0.4, py: 6, textAlign: "center" }}>
        No content yet.
      </Typography>
    );
  }

  return (
    <Box sx={baseSx(color)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content.trim()}
      </ReactMarkdown>
    </Box>
  );
}
