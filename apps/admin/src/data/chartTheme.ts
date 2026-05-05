export const CHART_COLORS = ["#6C63FF", "#00D4AA", "#8B85FF", "#F59E0B", "#EF4444", "#10B981"];

export const AXIS_STYLE = {
  fontSize: 11,
  fontFamily: "monospace",
  fill: "#94A3B8",
};

export const GRID_STYLE = {
  stroke: "rgba(108, 99, 255, 0.08)",
};

export const TOOLTIP_STYLE = {
  contentStyle: {
    background: "#111827",
    border: "1px solid rgba(108,99,255,0.2)",
    borderRadius: 8,
    fontFamily: "monospace",
    fontSize: 12,
  },
  labelStyle: { color: "#94A3B8" },
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fmtTooltipK = ((v: any) => `$${(Number(v) / 1000).toFixed(0)}K`) as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fmtTooltipPct = ((v: any) => `${v}%`) as any;
