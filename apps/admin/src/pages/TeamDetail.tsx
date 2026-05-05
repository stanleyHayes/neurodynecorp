import { useEffect, useState, useCallback } from "react";
import { Box, Typography, Chip, Avatar, Stack } from "@mui/material";
import { useParams, useNavigate } from "react-router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import PageBanner from "@/components/shared/PageBanner";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";
import PageSkeleton from "@/components/shared/PageSkeleton";
import EmptyState from "@/components/shared/EmptyState";
import { useAuth } from "@/context/AuthContext";

interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  role: string;
  roleId?: string;
  permissions?: string[];
  avatar?: string;
  phone?: string;
  company?: string;
  isActive?: boolean;
  is_active?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
}

interface ProjectData {
  id: string;
  title: string;
  status: string;
  type: string;
  progress: number;
  assignedTeam?: string[];
  assigned_team?: string[];
}

const roleColors: Record<string, string> = {
  admin: "#6C63FF",
  project_manager: "#8B5CF6",
  developer: "#00D4AA",
  qa: "#F59E0B",
};

// Map roles to relevant skill sets
const roleSkills: Record<string, string[]> = {
  developer: ["TypeScript", "React", "Node.js", "Go", "MongoDB", "Docker", "REST APIs", "WebSockets"],
  admin: ["Infrastructure", "Security", "DevOps", "CI/CD", "AWS", "Monitoring", "Team Management"],
  project_manager: ["Agile", "Scrum", "Sprint Planning", "Risk Management", "Stakeholder Comms", "Roadmapping", "JIRA"],
  qa: ["Cypress", "Jest", "Selenium", "Performance Testing", "API Testing", "Test Plans", "CI Integration"],
};

// Per-user overrides — keyed by email — for title, bio, skills, etc.
interface UserOverride {
  title?: string;
  bio?: string;
  skills?: string[];
  responsibilities?: string[];
  website?: string;
  location?: string;
  socials?: { label: string; href: string }[];
}

const userOverrides: Record<string, UserOverride> = {
  "stanley@neurodynecorp.com": {
    title: "Founder & Software Engineer",
    bio: "Software Engineer with 7+ years building scalable backend systems, APIs, and modern web applications. Currently crafting high-throughput event-driven systems with Go, RabbitMQ, and Kafka. Founder of NeuroDyne Corp.",
    skills: [
      "Golang",
      "Node.js",
      "React",
      "TypeScript",
      "RabbitMQ",
      "Kafka",
      "MongoDB",
      "PostgreSQL",
      "MySQL",
      "Redis",
      "Docker",
      "Kubernetes",
      "Prometheus",
      "Grafana",
      "React Native",
      "GraphQL",
    ],
    responsibilities: [
      "Set product vision and engineering direction at NeuroDyne Corp",
      "Architect high-throughput event-driven backend systems",
      "Build core platform features across backend, frontend, and mobile",
      "Lead technical hiring and mentor engineers",
      "Drive client engagements from spec to delivery",
    ],
    website: "stanleyhayford.com",
    socials: [
      { label: "LinkedIn", href: "https://linkedin.com/in/stanley-asoku-hayford" },
      { label: "GitHub", href: "https://github.com/stanleyHayes" },
      { label: "Twitter", href: "https://x.com/stanley_hayford" },
    ],
  },
};

// Role-specific responsibilities
const roleResponsibilities: Record<string, string[]> = {
  developer: [
    "Build and maintain frontend and backend features",
    "Write clean, tested, and documented code",
    "Participate in code reviews and architecture discussions",
    "Collaborate with QA on bug fixes and test coverage",
  ],
  admin: [
    "Manage platform infrastructure and deployments",
    "Configure permissions, roles, and security policies",
    "Monitor system health and incident response",
    "Onboard new team members and manage access",
  ],
  project_manager: [
    "Plan sprints and manage project timelines",
    "Facilitate standups, retros, and stakeholder demos",
    "Track milestones, budgets, and delivery risks",
    "Coordinate between engineering, QA, and clients",
  ],
  qa: [
    "Design and execute test plans for each sprint",
    "Automate regression and integration test suites",
    "Report and verify bug fixes before release",
    "Validate API contracts and performance benchmarks",
  ],
};

function formatRole(role: string): string {
  return role.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function getName(u: UserData): string {
  const first = u.firstName ?? u.first_name ?? "";
  const last = u.lastName ?? u.last_name ?? "";
  return `${first} ${last}`.trim() || u.email;
}

function getInitials(u: UserData): string {
  const first = u.firstName ?? u.first_name ?? "";
  const last = u.lastName ?? u.last_name ?? "";
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || "?";
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

const statusColors: Record<string, string> = {
  lead: "#94A3B8",
  under_review: "#6C63FF",
  approved: "#00D4AA",
  in_development: "#F59E0B",
  qa: "#8B5CF6",
  delivered: "#10B981",
  active: "#F59E0B",
  completed: "#10B981",
  planning: "#94A3B8",
  draft: "#94A3B8",
};

export default function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  const [currentProjects, setCurrentProjects] = useState<ProjectData[]>([]);
  const [pastProjects, setPastProjects] = useState<ProjectData[]>([]);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [userData, projectsRes] = await Promise.all([
        api.getUser(id),
        api.listProjects(),
      ]);

      setUser(userData as unknown as UserData);

      // Find projects this user is assigned to
      const allProjects = (projectsRes.items ?? []) as unknown as ProjectData[];
      const memberProjects = allProjects.filter((p) => {
        const team = p.assignedTeam ?? p.assigned_team ?? [];
        return team.includes(id);
      });

      const current = memberProjects.filter((p) => p.status !== "delivered" && p.status !== "completed");
      const past = memberProjects.filter((p) => p.status === "delivered" || p.status === "completed");
      setCurrentProjects(current);
      setPastProjects(past);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  }, [api, id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <PageSkeleton stats={4} rows={6} />;
  }

  if (!user) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5" color="text.secondary">Member not found</Typography>
      </Box>
    );
  }

  const name = getName(user);
  const initials = getInitials(user);
  const color = roleColors[user.role] ?? "#94A3B8";
  const override = userOverrides[user.email] ?? {};
  const title = override.title ?? formatRole(user.role);
  const skills = override.skills ?? roleSkills[user.role] ?? [];
  const responsibilities = override.responsibilities ?? roleResponsibilities[user.role] ?? [];
  const active = user.isActive ?? user.is_active ?? true;
  const joined = formatDate(user.createdAt ?? user.created_at);
  const lastLogin = formatDate(user.lastLoginAt);

  return (
    <Box>
      <Box
        onClick={() => navigate("/team")}
        sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 3, py: 1.5, cursor: "pointer", color: "text.secondary", "&:hover": { color: "#00D4AA" }, transition: "color 0.2s" }}
      >
        <ArrowBackIcon sx={{ fontSize: 18 }} />
        <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.1em" }}>BACK TO TEAM</Typography>
      </Box>

      <PageBanner
        icon={<PersonOutlinedIcon />}
        title={name}
        description={override.bio ?? `${title} at NeuroDyne Corp`}
        tag={`TEAM // ${title.toUpperCase()}`}
        accentWord={name.split(" ")[0]}
        iconColor={color}
        iconLabel={active ? "ACTIVE" : "INACTIVE"}
      />

      {/* Profile + Contact */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "5fr 7fr" } }}>
        {/* Profile card */}
        <Box>
          <SectionLabel>Profile</SectionLabel>
          <Cell color={color} index="00" animDelay={0}>
            <Stack alignItems="center" spacing={2} sx={{ textAlign: "center", py: 2 }}>
              <Avatar
                src={user.avatar}
                sx={{ width: 80, height: 80, fontSize: 28, fontWeight: 700, bgcolor: `${color}20`, color, border: `2.5px solid ${color}30` }}
              >
                {initials}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{name}</Typography>
                <Chip label={title} size="small" sx={{ fontFamily: "monospace", fontSize: "0.6rem", mt: 1, bgcolor: `${color}18`, color, border: `1px solid ${color}30` }} />
                {override.website && (
                  <Typography
                    component="a"
                    href={`https://${override.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ display: "block", fontFamily: "monospace", fontSize: "0.65rem", color, mt: 1.5, textDecoration: "none", opacity: 0.8, "&:hover": { opacity: 1, textDecoration: "underline" } }}
                  >
                    {override.website}
                  </Typography>
                )}
                {override.socials && override.socials.length > 0 && (
                  <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mt: 1.5, flexWrap: "wrap" }}>
                    {override.socials.map((s) => (
                      <Typography
                        key={s.href}
                        component="a"
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          fontFamily: "monospace",
                          fontSize: "0.6rem",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "text.secondary",
                          textDecoration: "none",
                          opacity: 0.6,
                          "&:hover": { color, opacity: 1 },
                          transition: "color 0.2s, opacity 0.2s",
                        }}
                      >
                        {s.label}
                      </Typography>
                    ))}
                  </Stack>
                )}
              </Box>
              <Chip
                label={active ? "Active" : "Inactive"}
                size="small"
                sx={{ fontFamily: "monospace", fontSize: "0.55rem", bgcolor: active ? "#10B98118" : "#94A3B818", color: active ? "#10B981" : "#94A3B8", border: `1px solid ${active ? "#10B98130" : "#94A3B830"}` }}
              />
            </Stack>
          </Cell>
        </Box>

        {/* Contact & details */}
        <Box>
          <SectionLabel>Details</SectionLabel>
          <Cell color="#6C63FF" index="01" animDelay={0.1}>
            <Stack spacing={2.5}>
              {[
                { icon: <EmailOutlinedIcon />, label: "Email", value: user.email },
                { icon: <PhoneOutlinedIcon />, label: "Phone", value: user.phone || "Not provided" },
                { icon: <BadgeOutlinedIcon />, label: "Role", value: formatRole(user.role) },
                { icon: <CalendarTodayOutlinedIcon />, label: "Joined", value: joined },
                { icon: <HistoryOutlinedIcon />, label: "Last Login", value: lastLogin },
              ].map((item) => (
                <Stack key={item.label} direction="row" spacing={2} alignItems="center">
                  <Box sx={{ "& .MuiSvgIcon-root": { fontSize: 18 }, color: "text.secondary", opacity: 0.4, flexShrink: 0 }}>
                    {item.icon}
                  </Box>
                  <Box>
                    <Typography sx={{ fontFamily: "monospace", fontSize: "0.55rem", color: "text.secondary", opacity: 0.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>{item.value}</Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Cell>
        </Box>
      </Box>

      {/* Skills & Permissions */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        <Box>
          <SectionLabel>Skills & Technologies</SectionLabel>
          <Cell color="#00D4AA" index="02" colInRow={0} totalCols={2} animDelay={0.2}>
            <Box sx={{ "& .MuiSvgIcon-root": { fontSize: 22 }, color: "#00D4AA", filter: "drop-shadow(0 0 8px #00D4AA40)", mb: 2 }}>
              <CodeOutlinedIcon />
            </Box>
            {skills.length > 0 ? (
              <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75 }}>
                {skills.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    size="small"
                    variant="outlined"
                    sx={{ fontFamily: "monospace", fontSize: "0.6rem", borderColor: "#00D4AA30", color: "#00D4AA" }}
                  />
                ))}
              </Stack>
            ) : (
              <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "text.secondary", opacity: 0.4 }}>No skills listed</Typography>
            )}
          </Cell>
        </Box>

        <Box>
          <SectionLabel>Permissions</SectionLabel>
          <Cell color="#8B5CF6" index="03" colInRow={1} totalCols={2} animDelay={0.25}>
            <Box sx={{ "& .MuiSvgIcon-root": { fontSize: 22 }, color: "#8B5CF6", filter: "drop-shadow(0 0 8px #8B5CF640)", mb: 2 }}>
              <SecurityOutlinedIcon />
            </Box>
            {(user.permissions ?? []).length > 0 ? (
              <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75 }}>
                {(user.permissions ?? []).map((perm) => (
                  <Chip
                    key={perm}
                    label={perm}
                    size="small"
                    sx={{ fontFamily: "monospace", fontSize: "0.55rem", bgcolor: "#8B5CF618", color: "#8B5CF6", border: "1px solid #8B5CF630" }}
                  />
                ))}
              </Stack>
            ) : (
              <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "text.secondary", opacity: 0.4 }}>Default role permissions</Typography>
            )}
          </Cell>
        </Box>
      </Box>

      {/* Responsibilities */}
      {responsibilities.length > 0 && (
        <>
          <SectionLabel>Responsibilities</SectionLabel>
          <Cell color={color} index="R0" animDelay={0.3}>
            <Box sx={{ "& .MuiSvgIcon-root": { fontSize: 22 }, color, filter: `drop-shadow(0 0 8px ${color}40)`, mb: 2 }}>
              <AssignmentOutlinedIcon />
            </Box>
            <Stack spacing={1.5}>
              {responsibilities.map((r, i) => (
                <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: color, flexShrink: 0, mt: 0.8, filter: `drop-shadow(0 0 4px ${color}60)` }} />
                  <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6 }}>{r}</Typography>
                </Stack>
              ))}
            </Stack>
          </Cell>
        </>
      )}

      {/* Current Projects */}
      <SectionLabel>Current Projects</SectionLabel>
      {currentProjects.length === 0 ? (
        <EmptyState
          icon={<FolderOutlinedIcon />}
          title="No active projects"
          description={`${name.split(" ")[0]} isn't assigned to any active projects right now. Assign them to a project to see it here.`}
          color="#F59E0B"
          onAdd={() => navigate("/projects")}
          addLabel="View Projects"
        />
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
          {currentProjects.map((project, i) => {
            const pColor = statusColors[project.status] ?? "#94A3B8";
            return (
              <Cell key={project.id} color={pColor} index={String(i + 4).padStart(2, "0")} colInRow={i % 2} totalCols={2} animDelay={0.3 + i * 0.05}>
                <Box onClick={() => navigate(`/projects/${project.id}`)} sx={{ cursor: "pointer" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <FolderOutlinedIcon sx={{ fontSize: 18, color: pColor }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{project.title}</Typography>
                    </Stack>
                    <Chip
                      label={project.status.replace(/_/g, " ")}
                      size="small"
                      sx={{ fontFamily: "monospace", fontSize: "0.55rem", bgcolor: `${pColor}18`, color: pColor, border: `1px solid ${pColor}30`, textTransform: "capitalize" }}
                    />
                  </Stack>
                  <Stack direction="row" spacing={3}>
                    <Box>
                      <Typography sx={{ fontFamily: "monospace", fontSize: "0.55rem", color: "text.secondary", opacity: 0.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>Type</Typography>
                      <Typography variant="body2" sx={{ fontSize: "0.8rem", textTransform: "capitalize" }}>{project.type?.replace(/_/g, " ") ?? "—"}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontFamily: "monospace", fontSize: "0.55rem", color: "text.secondary", opacity: 0.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>Progress</Typography>
                      <Typography variant="body2" sx={{ fontSize: "0.8rem", color: pColor, fontWeight: 600 }}>{project.progress}%</Typography>
                    </Box>
                  </Stack>
                </Box>
              </Cell>
            );
          })}
        </Box>
      )}

      {/* Past Projects */}
      <SectionLabel>Completed Projects</SectionLabel>
      {pastProjects.length === 0 ? (
        <EmptyState
          icon={<AssignmentOutlinedIcon />}
          title="No completed projects yet"
          description={`Once ${name.split(" ")[0]} finishes a project, it will appear here as part of their delivery history.`}
          color="#10B981"
        />
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" } }}>
          {pastProjects.map((project, i) => (
            <Cell key={project.id} color="#10B981" index={String(i + 6).padStart(2, "0")} colInRow={i % 3} totalCols={3} animDelay={0.4 + i * 0.05}>
              <Box onClick={() => navigate(`/projects/${project.id}`)} sx={{ cursor: "pointer" }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <FolderOutlinedIcon sx={{ fontSize: 16, color: "#10B981" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{project.title}</Typography>
                </Stack>
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", color: "text.secondary", opacity: 0.5, textTransform: "capitalize" }}>
                  {project.type?.replace(/_/g, " ") ?? "Project"}
                </Typography>
              </Box>
            </Cell>
          ))}
        </Box>
      )}
    </Box>
  );
}
