import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Alert,
  Tooltip,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router";
import SearchIcon from "@mui/icons-material/Search";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import PageBanner from "@/components/shared/PageBanner";
import ActionBar from "@/components/shared/ActionBar";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";
import PageSkeleton from "@/components/shared/PageSkeleton";
import EmptyState from "@/components/shared/EmptyState";
import { useAuth } from "@/context/AuthContext";
import PermissionGate from "@/components/PermissionGate";

interface RBACRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export default function Roles() {
  const navigate = useNavigate();
  const { api } = useAuth();
  const [roles, setRoles] = useState<RBACRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.listRoles();
      setRoles(res.roles ?? []);
    } catch (err: any) {
      setError(err.message ?? "Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const filtered = useMemo(
    () =>
      roles.filter(
        (r) =>
          (r.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (r.description ?? "").toLowerCase().includes(search.toLowerCase()),
      ),
    [search, roles],
  );

  const systemCount = roles.filter((r) => r.is_system).length;
  const customCount = roles.filter((r) => !r.is_system).length;
  const totalPermissions = roles.reduce((sum, r) => sum + r.permissions.length, 0);

  const handleDelete = async (role: RBACRole) => {
    if (role.is_system) return;
    if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;
    try {
      await api.deleteRole(role.id);
      await loadRoles();
    } catch (err: any) {
      setError(err.message ?? "Failed to delete role");
    }
  };

  if (loading) {
    return <PageSkeleton stats={4} rows={8} grid />;
  }

  const stats = [
    { label: "Total Roles", value: String(roles.length), change: `${roles.length} defined`, icon: <SecurityOutlinedIcon />, color: "#6C63FF" },
    { label: "System Roles", value: String(systemCount), change: "built-in", icon: <LockOutlinedIcon />, color: "#F59E0B" },
    { label: "Custom Roles", value: String(customCount), change: "user-created", icon: <TuneOutlinedIcon />, color: "#00D4AA" },
    { label: "Permissions", value: String(totalPermissions), change: "total assigned", icon: <VpnKeyOutlinedIcon />, color: "#8B5CF6" },
  ];

  const roleColor = (role: RBACRole) => (role.is_system ? "#F59E0B" : "#6C63FF");

  return (
    <Box>
      <PageBanner
        icon={<SecurityOutlinedIcon />}
        title="Roles & Permissions"
        description="Manage roles and their default permissions for access control across your platform."
        tag="ADMIN // ROLES"
        accentWord="Roles"
        iconColor="#6C63FF"
        iconLabel="RBAC ACTIVE"
      />

      <PermissionGate permission="roles:create">
        <ActionBar label="Create Role" subtitle="NEW ROLE" color="#6C63FF" onClick={() => navigate("/roles/new")} />
      </PermissionGate>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <SectionLabel>Role Metrics</SectionLabel>
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

      <SectionLabel>Role Directory</SectionLabel>
      <Cell color="#6C63FF" index="04">
        <TextField
          fullWidth
          size="small"
          placeholder="Search by role name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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

      {filtered.length === 0 ? (
        <EmptyState
          icon={<SecurityOutlinedIcon />}
          title={search ? "No roles match your search" : "No roles defined"}
          description={search ? "Try adjusting your search terms or clearing the filter." : "Create your first role to manage team permissions and access control."}
          color="#6C63FF"
          onRefresh={loadRoles}
          onAdd={() => navigate("/roles/new")}
          addLabel="Create Role"
          isFiltered={!!search}
        />
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" } }}>
          {filtered.map((role, i) => {
            const color = roleColor(role);
            return (
              <Cell
                key={role.id}
                color={color}
                index={String(i + 5).padStart(2, "0")}
                colInRow={i % 3}
                totalCols={3}
                animDelay={0.3 + i * 0.05}
              >
                <Box onClick={() => navigate(`/roles/${role.id}`)} sx={{ cursor: "pointer" }}>
                  <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 2 }}>
                    <Box sx={{ "& .MuiSvgIcon-root": { fontSize: 32 }, color, filter: `drop-shadow(0 0 10px ${color}40)` }}>
                      {role.is_system ? <AdminPanelSettingsOutlinedIcon /> : <SecurityOutlinedIcon />}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{role.name}</Typography>
                      <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", color: "text.secondary", opacity: 0.6 }}>
                        {role.description || "No description"}
                      </Typography>
                    </Box>
                    <Chip
                      label={role.is_system ? "System" : "Custom"}
                      size="small"
                      icon={role.is_system ? <LockOutlinedIcon sx={{ fontSize: "14px !important" }} /> : undefined}
                      sx={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: "0.6rem",
                        bgcolor: `${color}18`,
                        color,
                        border: `1px solid ${color}30`,
                      }}
                    />
                  </Stack>

                  <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
                    <Box>
                      <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem", color: "text.secondary", opacity: 0.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>Permissions</Typography>
                      <Typography variant="body2" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>{role.permissions.length}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem", color: "text.secondary", opacity: 0.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>Created</Typography>
                      <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>{role.created_at?.slice(0, 10) ?? "—"}</Typography>
                    </Box>
                  </Stack>
                </Box>

                <Stack sx={{ justifyContent: "flex-end" }} direction="row" spacing={0.5}>
                  <PermissionGate permission="roles:update">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => navigate(`/roles/${role.id}`)} sx={{ color: "text.secondary" }}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </PermissionGate>
                  {!role.is_system && (
                    <PermissionGate permission="roles:delete">
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDelete(role)} sx={{ color: "error.main" }}>
                          <DeleteOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </PermissionGate>
                  )}
                </Stack>
              </Cell>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
