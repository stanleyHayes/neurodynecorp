import { useState, useMemo, useEffect, useCallback } from "react";
import { Box, Typography, Chip, Avatar, Stack, TextField, InputAdornment, Alert } from "@mui/material";
import { useNavigate } from "react-router";
import SearchIcon from "@mui/icons-material/Search";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import PageBanner from "@/components/shared/PageBanner";
import ActionBar from "@/components/shared/ActionBar";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";
import Pagination from "@/components/shared/Pagination";
import PageSkeleton from "@/components/shared/PageSkeleton";
import EmptyState from "@/components/shared/EmptyState";
import { useAuth } from "@/context/AuthContext";

interface ClientUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  avatar?: string;
  phone?: string;
  company?: string;
  is_active: boolean;
  created_at: string;
}

interface ClientDisplay {
  id: string;
  name: string;
  email: string;
  company: string;
  status: "Active" | "Lead" | "Churned";
  joined: string;
  avatarColor: string;
}

const AVATAR_COLORS = ["#6C63FF", "#00D4AA", "#8B85FF", "#F59E0B", "#EF4444", "#10B981", "#8B5CF6"];

function mapUserToClient(user: ClientUser, index: number): ClientDisplay {
  return {
    id: user.id,
    name: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || "Unknown",
    email: user.email ?? "",
    company: user.company ?? "",
    status: user.is_active ? "Active" : "Churned",
    joined: (user.created_at ?? "").slice(0, 10),
    avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length] ?? "#6C63FF",
  };
}

const PER_PAGE = 9;

const statusColor: Record<string, string> = {
  Active: "#10B981",
  Lead: "#F59E0B",
  Churned: "#94A3B8",
};

export default function Clients() {
  const navigate = useNavigate();
  const { api } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [clients, setClients] = useState<ClientDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.listUsers({ role: "client" });
      setClients((res.users ?? []).map((u: any, i: number) => mapUserToClient(u as ClientUser, i)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const filtered = useMemo(
    () =>
      clients.filter(
        (c) =>
          (c.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (c.company ?? "").toLowerCase().includes(search.toLowerCase()),
      ),
    [search, clients],
  );

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageItems = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const activeCount = clients.filter((c) => c.status === "Active").length;

  const stats = [
    { label: "Total Clients", value: String(clients.length), change: `${activeCount} active`, icon: <PeopleOutlinedIcon />, color: "#00D4AA" },
    { label: "Active", value: String(activeCount), change: "currently active", icon: <FolderOutlinedIcon />, color: "#6C63FF" },
    { label: "New This Month", value: "—", change: "from API", icon: <PersonAddOutlinedIcon />, color: "#10B981" },
    { label: "Revenue", value: "—", change: "aggregation pending", icon: <AttachMoneyOutlinedIcon />, color: "#F59E0B" },
  ];

  if (loading) {
    return <PageSkeleton stats={4} rows={8} grid />;
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PageBanner
        icon={<PeopleOutlinedIcon />}
        title="Clients"
        description="Manage your client relationships, track engagement, and onboard new clients."
        tag="ADMIN // CLIENTS"
        accentWord="Clients"
        iconColor="#00D4AA"
        iconLabel="CRM ACTIVE"
      />

      <ActionBar label="New Client" subtitle="ONBOARD CLIENT" color="#00D4AA" onClick={() => navigate("/clients/new")} />

      {/* Stats */}
      <SectionLabel>Client Metrics</SectionLabel>
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

      {/* Search */}
      <SectionLabel>Client Directory</SectionLabel>
      <Cell color="#6C63FF" index="04">
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name or company..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "text.secondary" }} /></InputAdornment>,
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: "rgba(108, 99, 255, 0.04)",
              "& fieldset": { borderColor: "rgba(108,99,255,0.15)" },
              "&:hover fieldset": { borderColor: "rgba(108,99,255,0.3)" },
              "&.Mui-focused fieldset": { borderColor: "#6C63FF" },
            },
          }}
        />
      </Cell>

      {/* Card Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<PeopleOutlinedIcon />}
          title={search ? "No clients match your search" : "No clients yet"}
          description={search ? "Try adjusting your search terms or clearing the filter." : "Add your first client to start managing relationships and tracking engagement."}
          color="#00D4AA"
          onRefresh={fetchClients}
          onAdd={() => navigate("/clients/new")}
          addLabel="New Client"
          isFiltered={!!search}
        />
      ) : (
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" } }}>
        {pageItems.map((client, i) => {
          const color = statusColor[client.status] ?? "#94A3B8";
          return (
            <Cell
              key={client.id}
              color={client.avatarColor}
              index={String(page * PER_PAGE + i + 5).padStart(2, "0")}
              colInRow={i % 3}
              totalCols={3}
              animDelay={0.3 + i * 0.05}
            >
              <Box onClick={() => navigate(`/clients/${client.id}`)} sx={{ cursor: "pointer" }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 2 }}>
                  <Avatar sx={{ bgcolor: `${client.avatarColor}20`, color: client.avatarColor, width: 42, height: 42, fontSize: 14, fontWeight: 700, border: `1.5px solid ${client.avatarColor}30` }}>
                    {client.name.split(" ").map((n) => n[0]).join("")}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{client.name}</Typography>
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", color: "text.secondary", opacity: 0.6 }}>{client.company}</Typography>
                  </Box>
                  <Chip
                    label={client.status}
                    size="small"
                    sx={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "0.6rem",
                      bgcolor: `${color}18`,
                      color,
                      border: `1px solid ${color}30`,
                    }}
                  />
                </Stack>

                <Stack direction="row" spacing={3}>
                  <Box>
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem", color: "text.secondary", opacity: 0.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>Email</Typography>
                    <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>{client.email}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem", color: "text.secondary", opacity: 0.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>Joined</Typography>
                    <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>{client.joined}</Typography>
                  </Box>
                </Stack>
              </Box>
            </Cell>
          );
        })}
      </Box>
      )}

      {filtered.length > 0 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={filtered.length} />}
    </Box>
  );
}
