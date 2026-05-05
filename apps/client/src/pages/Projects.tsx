import { useEffect, useState } from "react";
import {
  Avatar,
  AvatarGroup,
  Box,
  Typography,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Button,
  Skeleton,
} from "@mui/material";
import { useNavigate } from "react-router";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import FolderOffOutlinedIcon from "@mui/icons-material/FolderOffOutlined";
import PageBanner from "@/components/shared/PageBanner";
import AnimatedCard from "@/components/shared/AnimatedCard";
import { AnimatedGridItem } from "@/components/shared/AnimatedGrid";
import EmptyState from "@/components/shared/EmptyState";
import { useAuth } from "@/context/AuthContext";

interface ResolvedUser {
  id: string;
  initials: string;
  name: string;
  role: string;
}

export default function Projects() {
  const navigate = useNavigate();
  const { api } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [userMap, setUserMap] = useState<Record<string, ResolvedUser>>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await api.listProjects();
        const items = res.items ?? [];
        if (cancelled) return;
        setProjects(items);

        // Collect unique team member IDs across all projects
        const allIds = new Set<string>();
        for (const p of items) {
          for (const uid of (p.assigned_team ?? [])) {
            allIds.add(uid);
          }
        }

        if (allIds.size > 0) {
          const entries = await Promise.all(
            Array.from(allIds).map(async (uid) => {
              try {
                const u = await api.getUser(uid);
                const initials = `${u.first_name?.[0] ?? ""}${u.last_name?.[0] ?? ""}`.toUpperCase();
                return [uid, { id: uid, initials, name: `${u.first_name} ${u.last_name}`, role: u.role?.replace(/_/g, " ") ?? "" }] as const;
              } catch {
                return [uid, { id: uid, initials: "?", name: "Unknown", role: "" }] as const;
              }
            })
          );
          if (!cancelled) setUserMap(Object.fromEntries(entries));
        }
      } catch {
        // handled by API client
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [api]);

  return (
    <Box>
      <PageBanner
        icon={<FolderSpecialIcon />}
        title="My Projects"
        description="Track progress, milestones, and team assignments for all your active projects."
      />

      <Grid container spacing={3}>
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Grid key={i} size={{ xs: 12, md: 6 }}>
                <AnimatedGridItem index={i}>
                  <AnimatedCard sx={{ p: 2 }}>
                    <CardContent>
                      <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
                      <Skeleton variant="text" width="30%" sx={{ mb: 2 }} />
                      <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 4, mb: 2 }} />
                      <Skeleton variant="text" width="50%" />
                      <Skeleton variant="text" width="40%" />
                      <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1, mt: 2 }} />
                    </CardContent>
                  </AnimatedCard>
                </AnimatedGridItem>
              </Grid>
            ))
          : projects.length === 0
            ? (
              <Grid size={{ xs: 12 }}>
                <EmptyState
                  icon={<FolderOffOutlinedIcon />}
                  title="No projects yet"
                  description="When a project is created for your account, it will appear here with progress tracking, milestones, and team info."
                  color="#94A3B8"
                />
              </Grid>
            )
            : projects.map((project, i) => {
              const milestones = project.milestones ?? [];
              const completedMilestones = milestones.filter(
                (m: any) => m.status === "completed" || m.completed_at
              ).length;
              const nextMilestone = milestones.find(
                (m: any) => m.status !== "completed" && !m.completed_at
              );
              const teamIds: string[] = project.assigned_team ?? [];
              const resolvedTeam = teamIds.map((uid: string) => userMap[uid]).filter((m): m is ResolvedUser => !!m);

              return (
                <Grid key={project.id} size={{ xs: 12, md: 6 }}>
                  <AnimatedGridItem index={i}>
                    <AnimatedCard sx={{ p: 2 }}>
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="start" sx={{ mb: 2 }}>
                          <Box>
                            <Typography variant="h5" sx={{ mb: 0.5 }}>
                              {project.title}
                            </Typography>
                            <Chip label={project.type?.replace(/_/g, " ") ?? "Project"} size="small" variant="outlined" />
                          </Box>
                          <Chip label={project.status?.replace(/_/g, " ") ?? "Unknown"} size="small" color="primary" />
                        </Stack>

                        <Box sx={{ mb: 3 }}>
                          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">Progress</Typography>
                            <Typography variant="body2" fontWeight={600}>{project.progress}%</Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={project.progress}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>

                        <Stack spacing={1} sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Milestones: {completedMilestones}/{milestones.length}
                          </Typography>
                          {nextMilestone && (
                            <Typography variant="body2" color="text.secondary">
                              Next: <strong>{nextMilestone.name ?? nextMilestone.title}</strong>
                            </Typography>
                          )}
                        </Stack>

                        {resolvedTeam.length > 0 && (
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                            <AvatarGroup max={4} sx={{ "& .MuiAvatar-root": { width: 28, height: 28, fontSize: 11, bgcolor: "primary.dark" } }}>
                              {resolvedTeam.map((m) => (
                                <Avatar key={m.id} sx={{ width: 28, height: 28, fontSize: 11 }}>{m.initials}</Avatar>
                              ))}
                            </AvatarGroup>
                            <Typography variant="caption" color="text.secondary">
                              {resolvedTeam.map((m) => m.name.split(" ")[0]).join(", ")}
                            </Typography>
                          </Stack>
                        )}

                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          fullWidth
                          onClick={() => navigate(`/projects/${project.id}`)}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </AnimatedCard>
                  </AnimatedGridItem>
                </Grid>
              );
            })}
      </Grid>
    </Box>
  );
}
