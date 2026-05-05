import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Link, useLocation } from "react-router";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { useAuth } from "@/context/AuthContext";

export const DRAWER_WIDTH = 260;
const BORDER = "rgba(108, 99, 255, 0.12)";

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

/** Map from route path to the permission required to view it */
const ROUTE_PERMISSIONS: Record<string, string> = {
  "/": "dashboard:read",
  "/projects": "projects:read",
  "/messages": "messages:read",
  "/notifications": "notifications:read",
  "/documents": "documents:read",
  "/billing": "billing:read",
  "/settings": "settings:read",
};

const menuGroups: MenuGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", icon: <DashboardOutlinedIcon />, path: "/", color: "#6C63FF" },
      { label: "Projects", icon: <FolderOutlinedIcon />, path: "/projects", color: "#00D4AA" },
    ],
  },
  {
    title: "Communication",
    items: [
      { label: "Messages", icon: <ChatOutlinedIcon />, path: "/messages", color: "#33DDBB" },
      { label: "Notifications", icon: <NotificationsOutlinedIcon />, path: "/notifications", color: "#00D4AA" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Documents", icon: <DescriptionOutlinedIcon />, path: "/documents", color: "#8B85FF" },
      { label: "Billing", icon: <ReceiptOutlinedIcon />, path: "/billing", color: "#6C63FF" },
    ],
  },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  onItemClick?: () => void;
}

export default function Sidebar({ mobileOpen = false, onMobileClose, onItemClick }: SidebarProps) {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { hasPermission } = useAuth();

  // Filter menu groups by permissions
  const filteredGroups = menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        const requiredPerm = ROUTE_PERMISSIONS[item.path];
        return !requiredPerm || hasPermission(requiredPerm);
      }),
    }))
    .filter((group) => group.items.length > 0);

  let globalIndex = 0;

  const paperSx = {
    width: DRAWER_WIDTH,
    bgcolor: "background.paper",
    borderRight: `1px solid ${BORDER}`,
    backgroundImage: "none",
    overflowX: "hidden" as const,
  };

  const handleNav = () => {
    if (isMobile) onMobileClose?.();
    onItemClick?.();
  };

  const drawerContent = (
    <>
      {/* Scanline background */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(108,99,255,0.02) 2px, rgba(108,99,255,0.02) 4px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <Toolbar sx={{ position: "relative", zIndex: 1, px: 2.5, borderBottom: `1px solid ${BORDER}` }}>
        {/* Corner brackets on sidebar header */}
        <Box sx={{ position: "absolute", top: 8, left: 8, width: 14, height: 14, borderTop: "2px solid rgba(108,99,255,0.3)", borderLeft: "2px solid rgba(108,99,255,0.3)", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", top: 8, right: 8, width: 14, height: 14, borderTop: "2px solid rgba(0,212,170,0.3)", borderRight: "2px solid rgba(0,212,170,0.3)", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", bottom: 8, left: 8, width: 14, height: 14, borderBottom: "2px solid rgba(0,212,170,0.3)", borderLeft: "2px solid rgba(0,212,170,0.3)", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", bottom: 8, right: 8, width: 14, height: 14, borderBottom: "2px solid rgba(108,99,255,0.3)", borderRight: "2px solid rgba(108,99,255,0.3)", pointerEvents: "none" }} />

        <Box
          component={Link}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            textDecoration: "none",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <Box
            component="img"
            src="/favicon.svg"
            alt="NeuroDyne"
            sx={{
              width: 30,
              height: 30,
              flexShrink: 0,
              filter: "drop-shadow(0 0 8px rgba(108, 99, 255, 0.3))",
            }}
          />
          <Typography
            sx={{
              fontWeight: 800,
              background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              whiteSpace: "nowrap",
              fontSize: "0.95rem",
              lineHeight: 1.2,
            }}
          >
            NeuroDyne
          </Typography>
        </Box>
      </Toolbar>

      {/* Scrollable menu groups */}
      <Box sx={{ flex: 1, overflowY: "auto", py: 1, position: "relative", zIndex: 1 }}>
        {filteredGroups.map((group) => (
          <Box key={group.title}>
            <Typography
              sx={{
                fontFamily: "monospace",
                fontSize: "0.55rem",
                textTransform: "uppercase",
                letterSpacing: "0.25em",
                color: "text.secondary",
                opacity: 0.4,
                px: 2.5,
                pt: 2,
                pb: 0.5,
              }}
            >
              {group.title}
            </Typography>
            <List disablePadding>
              {group.items.map((item) => {
                const idx = globalIndex++;
                const isActive = location.pathname === item.path;
                return (
                  <ListItem key={item.path} disablePadding>
                    <ListItemButton
                      component={Link}
                      to={item.path}
                      selected={isActive}
                      sx={{
                        mx: 0,
                        borderRadius: 0,
                        position: "relative",
                        py: 1.2,
                        pl: 2.5,
                        transition: "all 0.2s",
                        "&.Mui-selected": {
                          bgcolor: `${item.color}08`,
                          "& .MuiListItemIcon-root": { color: item.color },
                          "& .MuiListItemText-primary": { color: "text.primary" },
                        },
                        "&:hover": {
                          bgcolor: `${item.color}06`,
                        },
                      }}
                    >
                      {isActive && (
                        <Box
                          sx={{
                            position: "absolute",
                            left: 0,
                            top: "15%",
                            bottom: "15%",
                            width: 3,
                            borderRadius: 2,
                            background: item.color,
                            boxShadow: `0 0 8px ${item.color}80, 0 0 20px ${item.color}40`,
                          }}
                        />
                      )}

                      <Typography
                        sx={{
                          fontFamily: "monospace",
                          fontSize: "0.55rem",
                          color: isActive ? item.color : "text.secondary",
                          opacity: isActive ? 0.7 : 0.3,
                          letterSpacing: "0.1em",
                          mr: 1.5,
                          minWidth: 18,
                          transition: "all 0.2s",
                        }}
                      >
                        {String(idx).padStart(2, "0")}
                      </Typography>

                      <ListItemIcon
                        sx={{
                          minWidth: 36,
                          color: isActive ? item.color : "text.secondary",
                          "& .MuiSvgIcon-root": {
                            fontSize: 20,
                            filter: isActive
                              ? `drop-shadow(0 0 6px ${item.color}60)`
                              : "none",
                            transition: "filter 0.2s",
                          },
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: "0.85rem",
                          fontWeight: isActive ? 600 : 400,
                          letterSpacing: "0.02em",
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* Footer — Settings (only shown if user has settings:read permission) */}
      {hasPermission("settings:read") && (
      <Box sx={{ pb: 2, position: "relative", zIndex: 1 }}>
        <Box sx={{ borderTop: `1px solid ${BORDER}`, mx: 0, mb: 1 }} />
        <List disablePadding>
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/settings"
              selected={location.pathname === "/settings"}
              sx={{
                mx: 0,
                borderRadius: 0,
                position: "relative",
                py: 1.2,
                pl: 2.5,
                transition: "all 0.2s",
                "&.Mui-selected": {
                  bgcolor: "rgba(108, 99, 255, 0.08)",
                  "& .MuiListItemIcon-root": { color: "#8B85FF" },
                },
                "&:hover": {
                  bgcolor: "rgba(108, 99, 255, 0.06)",
                },
              }}
            >
              {location.pathname === "/settings" && (
                <Box
                  sx={{
                    position: "absolute",
                    left: 0,
                    top: "15%",
                    bottom: "15%",
                    width: 3,
                    borderRadius: 2,
                    background: "#8B85FF",
                    boxShadow: "0 0 8px #8B85FF80, 0 0 20px #8B85FF40",
                  }}
                />
              )}
              <Typography
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.55rem",
                  color: location.pathname === "/settings" ? "#8B85FF" : "text.secondary",
                  opacity: location.pathname === "/settings" ? 0.7 : 0.3,
                  letterSpacing: "0.1em",
                  mr: 1.5,
                  minWidth: 18,
                }}
              >
                --
              </Typography>
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  color: location.pathname === "/settings" ? "#8B85FF" : undefined,
                  "& .MuiSvgIcon-root": {
                    fontSize: 20,
                    filter: location.pathname === "/settings"
                      ? "drop-shadow(0 0 6px #8B85FF60)"
                      : "none",
                  },
                }}
              >
                <SettingsOutlinedIcon />
              </ListItemIcon>
              <ListItemText
                primary="Settings"
                primaryTypographyProps={{
                  fontSize: "0.85rem",
                  fontWeight: location.pathname === "/settings" ? 600 : 400,
                  letterSpacing: "0.02em",
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
      )}
    </>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{ "& .MuiDrawer-paper": paperSx }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        "& .MuiDrawer-paper": { ...paperSx, width: DRAWER_WIDTH, position: "fixed", top: 0, bottom: 0 },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
