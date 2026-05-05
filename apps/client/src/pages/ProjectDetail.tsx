import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Avatar,
  Skeleton,
} from "@mui/material";
import { useParams, useNavigate } from "react-router";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import DownloadIcon from "@mui/icons-material/Download";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PageBanner from "@/components/shared/PageBanner";
import AnimatedCard from "@/components/shared/AnimatedCard";
import { useAuth } from "@/context/AuthContext";

const statusColors: Record<string, "primary" | "warning" | "success" | "info"> = {
  in_development: "warning",
  lead: "info",
  under_review: "info",
  approved: "info",
  qa: "success",
  delivered: "success",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      try {
        const data = await api.getProject(id!);
        if (cancelled) return;
        setProject(data);

        // Resolve team member IDs to user data
        const teamIds: string[] = data.assigned_team ?? [];
        if (teamIds.length > 0) {
          const members = await Promise.all(
            teamIds.map(async (uid: string) => {
              try {
                const u = await api.getUser(uid);
                return {
                  id: u.id,
                  name: `${u.first_name} ${u.last_name}`,
                  email: u.email,
                  role: u.role?.replace(/_/g, " ") ?? "Member",
                  avatar: u.avatar,
                } as TeamMember;
              } catch {
                return { id: uid, name: "Unknown", email: "", role: "Member" } as TeamMember;
              }
            })
          );
          if (!cancelled) setTeamMembers(members);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [api, id]);

  if (loading) {
    return (
      <Box>
        <Box sx={{ px: 3, py: 1.5 }}>
          <Skeleton variant="text" width={150} />
        </Box>
        <Box sx={{ px: 3 }}>
          <Skeleton variant="text" width="40%" height={48} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="70%" sx={{ mb: 3 }} />
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2, mb: 3 }} />
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
        </Box>
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
          Project not found
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/projects")}>
          Back to Projects
        </Button>
      </Box>
    );
  }

  const milestones = project.milestones ?? [];
  const attachments = project.attachments ?? [];
  const completedMilestones = milestones.filter(
    (m: any) => m.status === "completed" || m.completed_at
  ).length;

  return (
    <Box>
      <Box
        onClick={() => navigate("/projects")}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          px: 3,
          py: 1.5,
          cursor: "pointer",
          color: "text.secondary",
          "&:hover": { color: "primary.main" },
          transition: "color 0.2s",
        }}
      >
        <ArrowBackIcon sx={{ fontSize: 18 }} />
        <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.1em" }}>
          BACK TO PROJECTS
        </Typography>
      </Box>

      <PageBanner
        icon={<AssignmentIcon />}
        title={project.title}
        description={project.description}
        action={
          <Stack direction="row" spacing={1}>
            <Chip label={project.type?.replace(/_/g, " ") ?? "Project"} size="small" variant="outlined" />
            <Chip label={project.status?.replace(/_/g, " ") ?? "Unknown"} size="small" color={statusColors[project.status] ?? "primary"} />
          </Stack>
        }
      />

      <AnimatedCard delay={0} sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="subtitle2">Overall Progress</Typography>
            <Typography variant="subtitle2" fontWeight={700}>
              {project.progress}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={project.progress}
            sx={{ height: 10, borderRadius: 5 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            {completedMilestones} of {milestones.length} milestones completed
          </Typography>
        </CardContent>
      </AnimatedCard>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Overview" />
          <Tab label="Milestones" />
          <Tab label="Documents" />
          <Tab label="Team" />
        </Tabs>
      </Box>

      {tab === 0 && (
        <AnimatedCard delay={1} sx={{ p: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Description
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {project.description}
            </Typography>
          </CardContent>
        </AnimatedCard>
      )}

      {tab === 1 && (
        <AnimatedCard delay={1} sx={{ p: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Milestones
            </Typography>
            {milestones.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No milestones defined yet.
              </Typography>
            ) : (
              <List>
                {milestones.map((milestone: any) => {
                  const isCompleted = milestone.status === "completed" || !!milestone.completed_at;
                  return (
                    <ListItem key={milestone.id ?? milestone.name}>
                      <ListItemIcon>
                        {isCompleted ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <RadioButtonUncheckedIcon color="disabled" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={milestone.name ?? milestone.title}
                        secondary={milestone.due_date ? formatDate(milestone.due_date) : undefined}
                        sx={{
                          textDecoration: isCompleted ? "line-through" : "none",
                          opacity: isCompleted ? 0.7 : 1,
                        }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </CardContent>
        </AnimatedCard>
      )}

      {tab === 2 && (
        <AnimatedCard delay={1} sx={{ p: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Documents
            </Typography>
            {attachments.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No documents uploaded yet.
              </Typography>
            ) : (
              <List>
                {attachments.map((doc: any) => (
                  <ListItem
                    key={doc.id ?? doc.file_name}
                    secondaryAction={
                      doc.file_url ? (
                        <Button size="small" startIcon={<DownloadIcon />} href={doc.file_url} target="_blank">
                          Download
                        </Button>
                      ) : (
                        <Button size="small" startIcon={<DownloadIcon />} disabled>
                          Download
                        </Button>
                      )
                    }
                  >
                    <ListItemText
                      primary={doc.file_name ?? doc.name}
                      secondary={doc.uploaded_at ? formatDate(doc.uploaded_at) : undefined}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </AnimatedCard>
      )}

      {tab === 3 && (
        <AnimatedCard animDelay={0.1} sx={{ p: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Assigned Team
            </Typography>
            {teamMembers.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No team members assigned yet.
              </Typography>
            ) : (
              <Stack spacing={2}>
                {teamMembers.map((member) => {
                  const initials = member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  return (
                    <Stack key={member.id} direction="row" spacing={2} alignItems="center">
                      <Avatar
                        src={member.avatar}
                        sx={{ width: 40, height: 40, fontSize: 14, fontWeight: 700, bgcolor: "primary.dark" }}
                      >
                        {initials}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {member.name}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={member.role}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: "0.65rem", height: 20, textTransform: "capitalize" }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {member.email}
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                  );
                })}
              </Stack>
            )}
          </CardContent>
        </AnimatedCard>
      )}
    </Box>
  );
}
