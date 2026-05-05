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
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Link, useLocation } from "react-router";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import ViewKanbanOutlinedIcon from "@mui/icons-material/ViewKanbanOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import FormatQuoteOutlinedIcon from "@mui/icons-material/FormatQuoteOutlined";
import MiscellaneousServicesOutlinedIcon from "@mui/icons-material/MiscellaneousServicesOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import ContactMailOutlinedIcon from "@mui/icons-material/ContactMailOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useAuth } from "@/context/AuthContext";

export const DRAWER_WIDTH = 260;
export const COLLAPSED_WIDTH = 68;
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
  "/pipeline": "pipeline:read",
  "/analytics": "analytics:read",
  "/clients": "clients:read",
  "/projects": "projects:read",
  "/specifications": "specifications:read",
  "/tasks": "tasks:read",
  "/blog": "blog:read",
  "/portfolio": "portfolio:read",
  "/testimonials": "testimonials:read",
  "/services": "services:read",
  "/contact-submissions": "contact_submissions:read",
  "/team": "team:read",
  "/messages": "messages:read",
  "/notifications": "notifications:read",
  "/finance": "finance:read",
  "/roles": "roles:read",
  "/settings": "settings:read",
};

const menuGroups: MenuGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", icon: <DashboardOutlinedIcon />, path: "/", color: "#6C63FF" },
      { label: "Pipeline", icon: <TimelineOutlinedIcon />, path: "/pipeline", color: "#8B85FF" },
      { label: "Analytics", icon: <BarChartOutlinedIcon />, path: "/analytics", color: "#8B85FF" },
    ],
  },
  {
    title: "Manage",
    items: [
      { label: "Clients", icon: <PeopleOutlinedIcon />, path: "/clients", color: "#00D4AA" },
      { label: "Projects", icon: <FolderOutlinedIcon />, path: "/projects", color: "#F59E0B" },
      { label: "Specifications", icon: <DescriptionOutlinedIcon />, path: "/specifications", color: "#8B5CF6" },
      { label: "Tasks", icon: <ViewKanbanOutlinedIcon />, path: "/tasks", color: "#EF4444" },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Blog Posts", icon: <ArticleOutlinedIcon />, path: "/blog", color: "#6C63FF" },
      { label: "Portfolio", icon: <WorkOutlineOutlinedIcon />, path: "/portfolio", color: "#00D4AA" },
      { label: "Testimonials", icon: <FormatQuoteOutlinedIcon />, path: "/testimonials", color: "#8B85FF" },
      { label: "Services", icon: <MiscellaneousServicesOutlinedIcon />, path: "/services", color: "#33DDBB" },
      { label: "Contact", icon: <ContactMailOutlinedIcon />, path: "/contact-submissions", color: "#F59E0B" },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Team", icon: <GroupOutlinedIcon />, path: "/team", color: "#00D4AA" },
      { label: "Messages", icon: <ChatOutlinedIcon />, path: "/messages", color: "#33DDBB" },
      { label: "Notifications", icon: <NotificationsOutlinedIcon />, path: "/notifications", color: "#00D4AA" },
      { label: "Finance", icon: <AttachMoneyOutlinedIcon />, path: "/finance", color: "#10B981" },
      { label: "Roles", icon: <AdminPanelSettingsOutlinedIcon />, path: "/roles", color: "#EF4444" },
    ],
  },
];

function SidebarItem({
  item,
  indexLabel,
  isActive,
  collapsed,
  onClick,
}: {
  item: MenuItem;
  indexLabel: string;
  isActive: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}) {
  const button = (
    <ListItem disablePadding>
      <ListItemButton
        component={Link}
        to={item.path}
        selected={isActive}
        onClick={onClick}
        sx={{
          mx: collapsed ? 0.5 : 1,
          borderRadius: 0,
          position: "relative",
          pl: collapsed ? 0 : 2,
          justifyContent: collapsed ? "center" : "flex-start",
          "&::before": {
            content: '""',
            position: "absolute",
            left: 0,
            top: "15%",
            bottom: "15%",
            width: 3,
            borderRadius: 1,
            bgcolor: isActive ? item.color : "transparent",
            filter: isActive ? `drop-shadow(0 0 6px ${item.color}80)` : "none",
            transition: "all 0.3s",
          },
          "&.Mui-selected": {
            bgcolor: `${item.color}10`,
            color: item.color,
            "& .MuiListItemIcon-root": { color: item.color },
          },
          "&:hover": {
            bgcolor: `${item.color}08`,
          },
        }}
      >
        {!collapsed && (
          <Typography
            sx={{
              fontFamily: "monospace",
              fontSize: "0.55rem",
              color: isActive ? item.color : "text.secondary",
              opacity: isActive ? 0.7 : 0.3,
              letterSpacing: "0.1em",
              mr: 1.5,
              minWidth: 18,
              transition: "all 0.3s",
            }}
          >
            {indexLabel}
          </Typography>
        )}
        <ListItemIcon
          sx={{
            minWidth: collapsed ? 0 : 36,
            color: isActive ? item.color : "text.secondary",
            "& .MuiSvgIcon-root": {
              filter: isActive
                ? `drop-shadow(0 0 6px ${item.color}50)`
                : "none",
              transition: "filter 0.3s",
            },
          }}
        >
          {item.icon}
        </ListItemIcon>
        {!collapsed && (
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{
              fontSize: "0.85rem",
              fontWeight: isActive ? 600 : 400,
            }}
          />
        )}
      </ListItemButton>
    </ListItem>
  );

  if (collapsed) {
    return <Tooltip title={item.label} placement="right">{button}</Tooltip>;
  }
  return button;
}

interface AdminSidebarProps {
  mobileOpen: boolean;
  collapsed: boolean;
  onMobileClose: () => void;
  onToggleCollapse: () => void;
}

export default function AdminSidebar({ mobileOpen, collapsed, onMobileClose, onToggleCollapse }: AdminSidebarProps) {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { hasPermission } = useAuth();

  const currentWidth = collapsed && !isMobile ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  // Filter menu groups by permissions — hide items the user can't read
  const filteredGroups = menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        const requiredPerm = ROUTE_PERMISSIONS[item.path];
        return !requiredPerm || hasPermission(requiredPerm);
      }),
    }))
    .filter((group) => group.items.length > 0);

  const drawerContent = (
    <>
      {/* Header */}
      <Toolbar
        sx={{
          position: "relative",
          borderBottom: `1px solid ${BORDER}`,
          minHeight: "64px !important",
          justifyContent: collapsed && !isMobile ? "center" : "flex-start",
          px: collapsed && !isMobile ? "0 !important" : undefined,
        }}
      >
        {/* Corner brackets */}
        {[
          { top: 8, left: 8, bT: true, bL: true },
          { top: 8, right: 8, bT: true, bR: true },
          { bottom: 8, left: 8, bB: true, bL: true },
          { bottom: 8, right: 8, bB: true, bR: true },
        ].map((pos, ci) => (
          <Box
            key={ci}
            sx={{
              position: "absolute",
              ...(pos.top !== undefined && { top: pos.top }),
              ...(pos.bottom !== undefined && { bottom: pos.bottom }),
              ...(pos.left !== undefined && { left: pos.left }),
              ...(pos.right !== undefined && { right: pos.right }),
              width: 12,
              height: 12,
              borderTop: pos.bT ? "2px solid #6C63FF35" : "none",
              borderBottom: pos.bB ? "2px solid #6C63FF35" : "none",
              borderLeft: pos.bL ? "2px solid #6C63FF35" : "none",
              borderRight: pos.bR ? "2px solid #6C63FF35" : "none",
              pointerEvents: "none",
            }}
          />
        ))}
        <Box
          component={Link}
          to="/"
          onClick={isMobile ? onMobileClose : undefined}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            textDecoration: "none",
            overflow: collapsed && !isMobile ? "visible" : "hidden",
            minWidth: 0,
            justifyContent: collapsed && !isMobile ? "center" : "flex-start",
          }}
        >
          <Box
            component="img"
            src="/favicon.svg"
            alt="NeuroDyne"
            sx={{
              width: collapsed && !isMobile ? 32 : 30,
              height: collapsed && !isMobile ? 32 : 30,
              flexShrink: 0,
              filter: "drop-shadow(0 0 8px rgba(108, 99, 255, 0.3))",
              transition: "width 0.3s, height 0.3s",
            }}
          />
          {!(collapsed && !isMobile) && (
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
              NeuroDyne Admin
            </Typography>
          )}
        </Box>
      </Toolbar>

      {/* Menu groups */}
      <Box sx={{ py: 1, flex: 1, overflowY: "auto" }}>
        {(() => {
          let globalIndex = 0;
          return filteredGroups.map((group) => (
            <Box key={group.title}>
              {!(collapsed && !isMobile) && (
                <Typography
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.55rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.25em",
                    color: "text.secondary",
                    opacity: 0.4,
                    px: 3,
                    pt: 2,
                    pb: 0.5,
                  }}
                >
                  {group.title}
                </Typography>
              )}
              {collapsed && !isMobile && <Box sx={{ pt: 1 }} />}
              <List disablePadding>
                {group.items.map((item) => {
                  const idx = globalIndex++;
                  return (
                    <SidebarItem
                      key={item.path}
                      item={item}
                      indexLabel={String(idx).padStart(2, "0")}
                      isActive={location.pathname === item.path}
                      collapsed={collapsed && !isMobile}
                      onClick={isMobile ? onMobileClose : undefined}
                    />
                  );
                })}
              </List>
            </Box>
          ));
        })()}
      </Box>

      {/* Footer — Cmd+K hint + Settings + Collapse toggle */}
      <Box sx={{ pb: 2 }}>
        <Box sx={{ borderTop: `1px solid ${BORDER}`, mx: 1, mb: 1 }} />
        {!(collapsed && !isMobile) && (
          <Box
            onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }))}
            sx={{
              mx: 2,
              mb: 1,
              px: 1.25,
              py: 0.75,
              borderRadius: 1,
              border: `1px solid ${BORDER}`,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              transition: "all 0.2s",
              "&:hover": { borderColor: "rgba(108,99,255,0.3)", bgcolor: "rgba(108,99,255,0.04)" },
            }}
          >
            <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", color: "text.secondary", opacity: 0.5, letterSpacing: "0.1em" }}>
              QUICK NAV
            </Typography>
            <Typography sx={{ fontFamily: "monospace", fontSize: "0.65rem", color: "text.secondary", opacity: 0.6 }}>
              ⌘ K
            </Typography>
          </Box>
        )}
        {hasPermission("settings:read") && (
          <List disablePadding>
            <SidebarItem
              item={{ label: "Settings", icon: <SettingsOutlinedIcon />, path: "/settings", color: "#94A3B8" }}
              indexLabel="--"
              isActive={location.pathname === "/settings"}
              collapsed={collapsed && !isMobile}
              onClick={isMobile ? onMobileClose : undefined}
            />
          </List>
        )}
        {!isMobile && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
            <IconButton
              onClick={onToggleCollapse}
              size="small"
              sx={{
                color: "text.secondary",
                opacity: 0.5,
                "&:hover": { opacity: 1, color: "#6C63FF" },
              }}
            >
              {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
            </IconButton>
          </Box>
        )}
      </Box>
    </>
  );

  // Mobile: temporary overlay drawer
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            bgcolor: "background.paper",
            borderRight: `1px solid ${BORDER}`,
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(108,99,255,0.02) 2px, rgba(108,99,255,0.02) 4px)",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  // Desktop: permanent, collapsible
  return (
    <Drawer
      variant="permanent"
      sx={{
        "& .MuiDrawer-paper": {
          width: currentWidth,
          bgcolor: "background.paper",
          borderRight: `1px solid ${BORDER}`,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(108,99,255,0.02) 2px, rgba(108,99,255,0.02) 4px)",
          transition: "width 0.3s",
          overflowX: "hidden",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
