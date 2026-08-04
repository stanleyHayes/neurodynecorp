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
import Sidebar, { DRAWER_WIDTH } from "./Sidebar";
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
  "/projects": "Projects",
  "/start-project": "Start a Project",
  "/documents": "Documents",
  "/billing": "Billing",
  "/messages": "Messages",
  "/notifications": "Notifications",
  "/settings": "Settings",
};

export default function DashboardLayout() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { api, logout } = useAuth();
  const { on } = useSocket();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count on mount
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

  const sidebarWidth = isMobile ? 0 : DRAWER_WIDTH;
  const basePath = "/" + (location.pathname.split("/").filter(Boolean)[0] ?? "");
  const pageTitle = pageTitles[basePath] ?? pageTitles[location.pathname] ?? "NeuroDyne";

  const goTo = (path: string) => {
    setAnchorEl(null);
    navigate(path);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          minWidth: 0,
          ml: { md: `${sidebarWidth}px` },
        }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            borderBottom: `1px solid ${BORDER}`,
            backgroundImage: "none",
          }}
        >
          <Toolbar sx={{ gap: 1 }}>
            {/* Hamburger (mobile only) */}
            {isMobile && (
              <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}

            {/* Page title */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                sx={{
                  fontFamily: "monospace",
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
                  fontFamily: "monospace",
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

            {/* Cmd+K hint */}
            <Box
              onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }))}
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: 0.75,
                px: 1.25,
                py: 0.5,
                borderRadius: 1,
                border: "1px solid rgba(108,99,255,0.2)",
                bgcolor: "rgba(108,99,255,0.04)",
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": { borderColor: "rgba(108,99,255,0.4)", bgcolor: "rgba(108,99,255,0.08)" },
              }}
            >
              <Typography sx={{ fontFamily: "monospace", fontSize: "0.65rem", color: "text.secondary", opacity: 0.6, letterSpacing: "0.05em" }}>
                ⌘ K
              </Typography>
            </Box>

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
              <Avatar sx={{ bgcolor: "#00D4AA30", color: "#00D4AA", width: 34, height: 34, fontSize: 13, fontWeight: 700 }}>
                DK
              </Avatar>
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.75rem", fontWeight: 600, lineHeight: 1.2 }}>
                  David Kim
                </Typography>
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.55rem", color: "#00D4AA", letterSpacing: "0.1em", opacity: 0.7, lineHeight: 1 }}>
                  CLIENT
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
                    backgroundImage: "none",
                    "& .MuiList-root": { py: 0.5 },
                  },
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.55rem", color: "text.secondary", opacity: 0.4, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                  Quick Settings
                </Typography>
              </Box>

              <MenuItem onClick={() => goTo("/settings?tab=profile")} sx={menuItemSx}>
                <ListItemIcon><PersonOutlinedIcon sx={{ fontSize: 18, color: "#6C63FF" }} /></ListItemIcon>
                <ListItemText slotProps={{ primary: { sx: { fontSize: "0.8rem" }, } }}>Profile</ListItemText>
              </MenuItem>

              <MenuItem onClick={() => goTo("/settings?tab=security")} sx={menuItemSx}>
                <ListItemIcon><LockOutlinedIcon sx={{ fontSize: 18, color: "#EF4444" }} /></ListItemIcon>
                <ListItemText slotProps={{ primary: { sx: { fontSize: "0.8rem" }, } }}>Security</ListItemText>
              </MenuItem>

              <MenuItem onClick={() => goTo("/settings?tab=appearance")} sx={menuItemSx}>
                <ListItemIcon><PaletteOutlinedIcon sx={{ fontSize: 18, color: "#8B5CF6" }} /></ListItemIcon>
                <ListItemText slotProps={{ primary: { sx: { fontSize: "0.8rem" }, } }}>Appearance</ListItemText>
              </MenuItem>

              <MenuItem onClick={() => goTo("/settings?tab=notifications")} sx={menuItemSx}>
                <ListItemIcon><NotificationsNoneOutlinedIcon sx={{ fontSize: 18, color: "#F59E0B" }} /></ListItemIcon>
                <ListItemText slotProps={{ primary: { sx: { fontSize: "0.8rem" }, } }}>Notifications</ListItemText>
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
