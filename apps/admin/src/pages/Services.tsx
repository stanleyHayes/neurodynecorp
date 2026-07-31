import { useState, useEffect, useCallback } from "react";
import { Box, Typography, Chip, Stack, Alert } from "@mui/material";
import { useNavigate } from "react-router";
import MiscellaneousServicesOutlinedIcon from "@mui/icons-material/MiscellaneousServicesOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import PhoneIphoneOutlinedIcon from "@mui/icons-material/PhoneIphoneOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import TokenOutlinedIcon from "@mui/icons-material/TokenOutlined";
import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import PageBanner from "@/components/shared/PageBanner";
import ActionBar from "@/components/shared/ActionBar";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";
import PageSkeleton from "@/components/shared/PageSkeleton";
import EmptyState from "@/components/shared/EmptyState";
import { useAuth } from "@/context/AuthContext";

const iconMap: Record<string, React.ReactNode> = {
  code: <CodeOutlinedIcon />,
  phone: <PhoneIphoneOutlinedIcon />,
  psychology: <PsychologyOutlinedIcon />,
  token: <TokenOutlinedIcon />,
  cloud: <CloudOutlinedIcon />,
  storage: <StorageOutlinedIcon />,
};

const statusLabel: Record<string, string> = {
  active: "Active",
  coming_soon: "Coming Soon",
  inactive: "Inactive",
};

const statusColor: Record<string, string> = {
  Active: "#10B981",
  "Coming Soon": "#F59E0B",
  Inactive: "#94A3B8",
};

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  status: "active" | "coming_soon" | "inactive";
  projectCount: number;
  color: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function Services() {
  const navigate = useNavigate();
  const { api } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.listServices();
      setServices(res.items ?? []);
    } catch (err: any) {
      setError(err.message ?? "Failed to load services");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  if (loading) {
    return <PageSkeleton stats={3} rows={6} grid cols={3} />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const activeCount = services.filter((s) => s.status === "active").length;
  const totalProjects = services.reduce((sum, s) => sum + s.projectCount, 0);

  const stats = [
    { label: "Total Services", value: String(services.length), change: `${activeCount} active`, icon: <MiscellaneousServicesOutlinedIcon />, color: "#00D4AA" },
    { label: "Active", value: String(activeCount), change: "offered to clients", icon: <CheckCircleOutlinedIcon />, color: "#10B981" },
    { label: "Total Projects", value: String(totalProjects), change: "across all services", icon: <FolderOutlinedIcon />, color: "#6C63FF" },
  ];

  return (
    <Box>
      <PageBanner
        icon={<MiscellaneousServicesOutlinedIcon />}
        title="Services"
        description="Manage service offerings displayed on the public website."
        tag="CONTENT // SERVICES"
        accentWord="Services"
        iconColor="#00D4AA"
        iconLabel="OFFERINGS"
      />

      <ActionBar label="New Service" subtitle="ADD OFFERING" color="#00D4AA" onClick={() => navigate("/services/new")} />

      <SectionLabel>Service Metrics</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" } }}>
        {stats.map((stat, i) => (
          <Cell key={stat.label} color={stat.color} index={String(i).padStart(2, "0")} colInRow={i} totalCols={3} animDelay={i * 0.1} minH={120}>
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

      <SectionLabel>All Services</SectionLabel>
      {services.length === 0 ? (
        <EmptyState
          icon={<MiscellaneousServicesOutlinedIcon />}
          title="No services yet"
          description="Define your first service offering to showcase your capabilities on the public website."
          color="#00D4AA"
          onRefresh={loadServices}
          onAdd={() => navigate("/services/new")}
          addLabel="New Service"
        />
      ) : (
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" } }}>
        {services.map((service, i) => {
          const display = statusLabel[service.status] ?? "Inactive";
          const color = statusColor[display] ?? "#94A3B8";
          return (
            <Cell key={service.id} color={service.color} index={String(i + 3).padStart(2, "0")} colInRow={i % 3} totalCols={3} animDelay={0.3 + i * 0.08} minH={180}>
              <Box sx={{ "& .MuiSvgIcon-root": { fontSize: 36 }, color: service.color, filter: `drop-shadow(0 0 12px ${service.color}40)`, mb: 1.5 }}>
                {iconMap[service.icon] ?? <CodeOutlinedIcon />}
              </Box>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{service.title}</Typography>
                <Chip label={display} size="small" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", bgcolor: `${color}18`, color, border: `1px solid ${color}30` }} />
              </Stack>
              <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.7, lineHeight: 1.6, mb: 1.5 }}>{service.description}</Typography>
              <Stack sx={{ alignItems: "center" }} direction="row" spacing={1}>
                <FolderOutlinedIcon sx={{ fontSize: 14, color: "text.secondary", opacity: 0.5 }} />
                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", color: "text.secondary", opacity: 0.5 }}>
                  {service.projectCount} project{service.projectCount !== 1 ? "s" : ""}
                </Typography>
              </Stack>
            </Cell>
          );
        })}
      </Box>
      )}
    </Box>
  );
}
