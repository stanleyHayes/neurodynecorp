import { Box, Typography, Chip, Stack } from "@mui/material";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import PageBanner from "@/components/shared/PageBanner";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";

interface PipelineProject {
  title: string;
  client: string;
  type: string;
  budget: string;
}

const pipelineStages: { name: string; color: string; projects: PipelineProject[] }[] = [
  {
    name: "Lead",
    color: "#94A3B8",
    projects: [
      { title: "E-Learning Platform", client: "EduNova", type: "Web App", budget: "$50K-$100K" },
      { title: "IoT Dashboard", client: "SmartHome Inc", type: "Web App", budget: "$25K-$50K" },
    ],
  },
  {
    name: "Under Review",
    color: "#6C63FF",
    projects: [
      { title: "Supply Chain AI", client: "LogiTrack", type: "AI System", budget: "$100K-$250K" },
    ],
  },
  {
    name: "Approved",
    color: "#00D4AA",
    projects: [
      { title: "Fitness Tracker", client: "FitLife", type: "Mobile App", budget: "$25K-$50K" },
    ],
  },
  {
    name: "In Development",
    color: "#F59E0B",
    projects: [
      { title: "FinTech Mobile App", client: "Apex Finance", type: "Mobile App", budget: "$100K-$250K" },
      { title: "Healthcare Portal", client: "MedCore", type: "Web App", budget: "$50K-$100K" },
    ],
  },
  {
    name: "QA",
    color: "#8B5CF6",
    projects: [
      { title: "CRM System", client: "NexGen", type: "Web App", budget: "$50K-$100K" },
    ],
  },
  {
    name: "Delivered",
    color: "#10B981",
    projects: [
      { title: "Analytics Dashboard", client: "DataViz", type: "AI System", budget: "$25K-$50K" },
    ],
  },
];

const totalInPipeline = pipelineStages.reduce((s, st) => s + st.projects.length, 0);
const newLeads = pipelineStages[0]?.projects.length ?? 0;

const stats = [
  { label: "In Pipeline", value: String(totalInPipeline), change: "total opportunities", icon: <TimelineOutlinedIcon />, color: "#6C63FF" },
  { label: "Conversion Rate", value: "63%", change: "lead to delivery", icon: <TrendingUpOutlinedIcon />, color: "#00D4AA" },
  { label: "Avg Deal Size", value: "$68K", change: "across stages", icon: <MonetizationOnOutlinedIcon />, color: "#F59E0B" },
  { label: "New Leads", value: String(newLeads), change: "this month", icon: <PersonAddOutlinedIcon />, color: "#10B981" },
];

export default function Pipeline() {
  return (
    <Box>
      <PageBanner
        icon={<TimelineOutlinedIcon />}
        title="Project Pipeline"
        description="Visualize project flow from lead to delivery across all stages."
        tag="ADMIN // PIPELINE"
        accentWord="Pipeline"
        iconColor="#8B85FF"
        iconLabel="FLOW ACTIVE"
      />

      <SectionLabel>Pipeline Metrics</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" } }}>
        {stats.map((stat, i) => (
          <Cell key={stat.label} color={stat.color} index={String(i).padStart(2, "0")} colInRow={i} totalCols={4} animDelay={i * 0.1} minH={120}>
            <Box sx={{ "& .MuiSvgIcon-root": { fontSize: 28 }, color: stat.color, filter: `drop-shadow(0 0 12px ${stat.color}40)`, mb: 1 }}>
              {stat.icon}
            </Box>
            <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "text.secondary", opacity: 0.6, mb: 0.5 }}>
              {stat.label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>{stat.value}</Typography>
            <Typography variant="caption" sx={{ color: stat.color, opacity: 0.8 }}>{stat.change}</Typography>
          </Cell>
        ))}
      </Box>

      <SectionLabel>Pipeline Board</SectionLabel>
      <Box sx={{ overflowX: "auto", pb: 2 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${pipelineStages.length}, minmax(200px, 1fr))`, minWidth: 1100 }}>
          {pipelineStages.map((stage, si) => (
            <Box key={stage.name}>
              <Cell color={stage.color} index={String(si + 4).padStart(2, "0")} colInRow={si} totalCols={pipelineStages.length} animDelay={0.4 + si * 0.05} minH={40}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: stage.color, filter: `drop-shadow(0 0 4px ${stage.color}60)` }} />
                  <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.05em" }}>{stage.name}</Typography>
                  <Chip label={stage.projects.length} size="small" sx={{ fontFamily: "monospace", fontSize: "0.6rem", height: 20, bgcolor: `${stage.color}18`, color: stage.color, border: `1px solid ${stage.color}30` }} />
                </Stack>
              </Cell>
              {stage.projects.map((project, pi) => (
                <Cell key={project.title} color={stage.color} colInRow={si} totalCols={pipelineStages.length} animDelay={0.5 + (si + pi) * 0.05}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, fontSize: "0.8rem" }}>{project.title}</Typography>
                  <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", color: "text.secondary", opacity: 0.6, mb: 1 }}>{project.client}</Typography>
                  <Stack direction="row" spacing={0.5}>
                    <Chip label={project.type} size="small" sx={{ fontFamily: "monospace", fontSize: "0.5rem", height: 20 }} variant="outlined" />
                    <Chip label={project.budget} size="small" sx={{ fontFamily: "monospace", fontSize: "0.5rem", height: 20, bgcolor: `${stage.color}15`, color: stage.color }} />
                  </Stack>
                </Cell>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
