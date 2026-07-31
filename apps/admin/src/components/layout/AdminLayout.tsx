import { useState, useEffect, useCallback } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Outlet, useNavigate, useLocation } from "react-router";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import AdminSidebar, { DRAWER_WIDTH, COLLAPSED_WIDTH } from "./AdminSidebar";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/hooks/useSocket";

const BORDER = "rgba(108, 99, 255, 0.12)";

const menuItemSx = {
  py: 1,
  px: 2,
  gap: 1.5,
  "& .MuiListItemIcon-root": { minWidth: 0 },
  "&:hover": { bgcolor: "rgba(108, 99, 255, 0.06)" },
};

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/pipeline": "Pipeline",
  "/analytics": "Analytics",
  "/clients": "Clients",
  "/projects": "Projects",
  "/specifications": "Specifications",
  "/team": "Team",
  "/tasks": "Tasks",
  "/finance": "Finance",
  "/settings": "Settings",
  "/blog": "Blog",
  "/portfolio": "Portfolio",
  "/testimonials": "Testimonials",
  "/services": "Services",
  "/contact-submissions": "Contact",
  "/messages": "Messages",
  "/notifications": "Notifications",
};

export default function AdminLayout() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { api, logout } = useAuth();
  const { on } = useSocket();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count on mount and when navigating back from notifications
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.getUnreadNotificationCount();
      setUnreadCount(res.unread);
    } catch { /* silent */ }
  }, [api]);

  useEffect(() => { fetchUnreadCount(); }, [fetchUnreadCount]);

  // Re-fetch when navigating away from notifications page
  useEffect(() => {
    if (location.pathname !== "/notifications") return;
    return () => { fetchUnreadCount(); };
  }, [location.pathname, fetchUnreadCount]);

  // Listen for real-time notifications
  useEffect(() => {
    const cleanup = on("notification", () => {
      setUnreadCount((prev) => prev + 1);
    });
    return cleanup;
  }, [on]);

  const sidebarWidth = isMobile ? 0 : collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;
  const basePath = "/" + location.pathname.split("/").filter(Boolean)[0] || "/";
  const pageTitle = pageTitles[basePath] ?? pageTitles[location.pathname] ?? "NeuroDyne";

  const goTo = (path: string) => {
    setAnchorEl(null);
    navigate(path);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AdminSidebar
        mobileOpen={mobileOpen}
        collapsed={collapsed}
        onMobileClose={() => setMobileOpen(false)}
        onToggleCollapse={() => setCollapsed((p) => !p)}
      />
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          minWidth: 0,
          ml: { md: `${sidebarWidth}px` },
          transition: "margin-left 0.3s",
        }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            borderBottom: `1px solid ${BORDER}`,
          }}
        >
          <Toolbar sx={{ gap: 1 }}>
            {/* Hamburger */}
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => isMobile ? setMobileOpen(true) : setCollapsed((p) => !p)}
            >
              <MenuIcon />
            </IconButton>

            {/* Page title */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                sx={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "0.5rem",
                  color: "primary.main",
                  opacity: 0.5,
                  letterSpacing: "0.1em",
                }}
              >
                //
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  color: "text.primary",
                }}
              >
                {pageTitle}
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <IconButton color="inherit" size="small" onClick={() => navigate("/notifications")}>
              <Badge badgeContent={unreadCount || undefined} color="error">
                <NotificationsOutlinedIcon fontSize="small" />
              </Badge>
            </IconButton>

            {/* User dropdown trigger */}
            <Box
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                py: 0.5,
                px: 1,
                borderRadius: 1,
                transition: "background 0.2s",
                "&:hover": { bgcolor: "rgba(108, 99, 255, 0.06)" },
              }}
            >
              <Avatar sx={{ bgcolor: "#6C63FF30", color: "#6C63FF", width: 34, height: 34, fontSize: 13, fontWeight: 700 }}>
                AA
              </Avatar>
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.75rem", fontWeight: 600, lineHeight: 1.2 }}>
                  Ayo Adeyemi
                </Typography>
                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem", color: "#6C63FF", letterSpacing: "0.1em", opacity: 0.7, lineHeight: 1 }}>
                  ADMIN
                </Typography>
              </Box>
            </Box>

            {/* Dropdown menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,
                    minWidth: 220,
                    bgcolor: "background.paper",
                    border: `1px solid ${BORDER}`,
                    backgroundImage:
                      "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(108,99,255,0.015) 2px, rgba(108,99,255,0.015) 4px)",
                    "& .MuiList-root": { py: 0.5 },
                  },
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem", color: "text.secondary", opacity: 0.4, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                  Quick Settings
                </Typography>
              </Box>

              <MenuItem onClick={() => goTo("/settings?tab=profile")} sx={menuItemSx}>
                <ListItemIcon><PersonOutlinedIcon sx={{ fontSize: 18, color: "#6C63FF" }} /></ListItemIcon>
                <ListItemText slotProps={{ primary: { sx: { fontSize: "0.8rem" }, } }}>Profile</ListItemText>
                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.5rem", color: "text.secondary", opacity: 0.4 }}>P0</Typography>
              </MenuItem>

              <MenuItem onClick={() => goTo("/settings?tab=security")} sx={menuItemSx}>
                <ListItemIcon><LockOutlinedIcon sx={{ fontSize: 18, color: "#EF4444" }} /></ListItemIcon>
                <ListItemText slotProps={{ primary: { sx: { fontSize: "0.8rem" }, } }}>Security</ListItemText>
                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.5rem", color: "text.secondary", opacity: 0.4 }}>S0</Typography>
              </MenuItem>

              <MenuItem onClick={() => goTo("/settings?tab=appearance")} sx={menuItemSx}>
                <ListItemIcon><PaletteOutlinedIcon sx={{ fontSize: 18, color: "#8B5CF6" }} /></ListItemIcon>
                <ListItemText slotProps={{ primary: { sx: { fontSize: "0.8rem" }, } }}>Appearance</ListItemText>
                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.5rem", color: "text.secondary", opacity: 0.4 }}>A0</Typography>
              </MenuItem>

              <MenuItem onClick={() => goTo("/settings?tab=notifications")} sx={menuItemSx}>
                <ListItemIcon><NotificationsNoneOutlinedIcon sx={{ fontSize: 18, color: "#F59E0B" }} /></ListItemIcon>
                <ListItemText slotProps={{ primary: { sx: { fontSize: "0.8rem" }, } }}>Notifications</ListItemText>
                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.5rem", color: "text.secondary", opacity: 0.4 }}>N0</Typography>
              </MenuItem>

              <Divider sx={{ borderColor: BORDER, my: 0.5 }} />

              <MenuItem onClick={() => goTo("/settings")} sx={menuItemSx}>
                <ListItemIcon><SettingsOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} /></ListItemIcon>
                <ListItemText slotProps={{ primary: { sx: { fontSize: "0.8rem" }, } }}>All Settings</ListItemText>
              </MenuItem>

              <Divider sx={{ borderColor: BORDER, my: 0.5 }} />

              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  logout();
                  navigate("/login", { replace: true });
                }}
                sx={{ ...menuItemSx, "&:hover": { bgcolor: "rgba(239, 68, 68, 0.06)" } }}
              >
                <ListItemIcon><LogoutOutlinedIcon sx={{ fontSize: 18, color: "#EF4444" }} /></ListItemIcon>
                <ListItemText slotProps={{ primary: { sx: { fontSize: "0.8rem" }, color: "#EF4444" } }}>Sign Out</ListItemText>
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ flexGrow: 1, p: 0, width: "100%" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
