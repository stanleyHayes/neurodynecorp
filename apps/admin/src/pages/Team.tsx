import { useState, useEffect, useCallback } from "react";
import { Box, Typography, Chip, Avatar, Stack, Alert } from "@mui/material";
import { useNavigate } from "react-router";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import PageBanner from "@/components/shared/PageBanner";
import ActionBar from "@/components/shared/ActionBar";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";
import PageSkeleton from "@/components/shared/PageSkeleton";
import EmptyState from "@/components/shared/EmptyState";
import { useAuth } from "@/context/AuthContext";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  role: string;
  avatar?: string;
  phone?: string;
  permissions: string[];
  isActive?: boolean;
  is_active?: boolean;
  createdAt?: string;
  created_at?: string;
}

const roleColors: Record<string, string> = {
  admin: "#6C63FF",
  project_manager: "#8B5CF6",
  developer: "#00D4AA",
  qa: "#F59E0B",
};

function formatRole(role: string): string {
  return role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function getUserName(u: User): string {
  const first = u.firstName ?? u.first_name ?? "";
  const last = u.lastName ?? u.last_name ?? "";
  return `${first} ${last}`.trim() || u.email;
}

function getInitials(u: User): string {
  const first = u.firstName ?? u.first_name ?? "";
  const last = u.lastName ?? u.last_name ?? "";
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || "?";
}

export default function Team() {
  const navigate = useNavigate();
  const { api } = useAuth();
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTeam = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.listUsers({ isActive: "true" });
      const internal = (res.users ?? []).filter((u: User) => u.role !== "client");
      setMembers(internal);
    } catch (err: any) {
      setError(err.message ?? "Failed to load team members");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  if (loading) {
    return <PageSkeleton stats={4} rows={8} grid />;
  }

  const devs = members.filter((m) => m.role === "developer").length;
  const pms = members.filter((m) => m.role === "project_manager").length;
  const qas = members.filter((m) => m.role === "qa").length;

  const stats = [
    { label: "Total Members", value: String(members.length), change: `${members.length} active`, icon: <GroupsOutlinedIcon />, color: "#00D4AA" },
    { label: "Developers", value: String(devs), change: "core engineering", icon: <CodeOutlinedIcon />, color: "#6C63FF" },
    { label: "Project Managers", value: String(pms), change: "delivery leads", icon: <ManageAccountsOutlinedIcon />, color: "#8B5CF6" },
    { label: "QA Engineers", value: String(qas), change: "quality assurance", icon: <BugReportOutlinedIcon />, color: "#F59E0B" },
  ];

  return (
    <Box>
      <PageBanner
        icon={<GroupsOutlinedIcon />}
        title="Team"
        description="View and manage your team members, roles, and project assignments."
        tag="ADMIN // TEAM"
        accentWord="Team"
        iconColor="#00D4AA"
        iconLabel="TEAM ROSTER"
      />

      <ActionBar label="New Member" subtitle="ADD TO ROSTER" color="#00D4AA" onClick={() => navigate("/team/new")} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <SectionLabel>Team Metrics</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" } }}>
        {stats.map((stat, i) => (
          <Cell key={stat.label} color={stat.color} index={String(i).padStart(2, "0")} colInRow={i} totalCols={4} animDelay={i * 0.1} minH={120}>
            <Box sx={{ "& .MuiSvgIcon-root": { fontSize: 28 }, color: stat.color, filter: `drop-shadow(0 0 12px ${stat.color}40)`, mb: 1 }}>
              {stat.icon}
            </Box>
            <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "text.secondary", opacity: 0.6, mb: 0.5 }}>
              {stat.label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>{stat.value}</Typography>
            <Typography variant="caption" sx={{ color: stat.color, opacity: 0.8 }}>{stat.change}</Typography>
          </Cell>
        ))}
      </Box>

      <SectionLabel>Team Members</SectionLabel>
      {members.length === 0 ? (
        <EmptyState
          icon={<GroupsOutlinedIcon />}
          title="No team members yet"
          description="Add your first team member to manage roles, permissions, and project assignments."
          color="#00D4AA"
          onRefresh={loadTeam}
          onAdd={() => navigate("/team/new")}
          addLabel="New Member"
        />
      ) : (
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" } }}>
        {members.map((member, i) => {
          const color = roleColors[member.role] ?? "#94A3B8";
          const name = getUserName(member);
          const initials = getInitials(member);
          return (
            <Cell key={member.id} color={color} index={String(i + 4).padStart(2, "0")} colInRow={i % 4} totalCols={4} animDelay={0.4 + i * 0.05}>
              <Box onClick={() => navigate(`/team/${member.id}`)} sx={{ cursor: "pointer" }}>
                <Stack spacing={1.5} sx={{ alignItems: "center", textAlign: "center" }}>
                  <Avatar
                    src={member.avatar}
                    sx={{ width: 56, height: 56, fontSize: 18, fontWeight: 700, bgcolor: `${color}20`, color, border: `1.5px solid ${color}30` }}
                  >
                    {initials}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{name}</Typography>
                    <Chip label={formatRole(member.role)} size="small" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem", mt: 0.5, bgcolor: `${color}18`, color, border: `1px solid ${color}30` }} />
                  </Box>
                  <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", color: "text.secondary", opacity: 0.6 }}>{member.email}</Typography>
                </Stack>
              </Box>
            </Cell>
          );
        })}
      </Box>
      )}
    </Box>
  );
}
