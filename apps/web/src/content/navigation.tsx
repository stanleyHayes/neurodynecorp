import type React from "react";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import TerminalOutlinedIcon from "@mui/icons-material/TerminalOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
const CLIENT_PORTAL_URL = import.meta.env.VITE_CLIENT_PORTAL_URL ?? "https://client.neurodyne.dev";
interface NavItem {
  label: string;
  path: string;
  index: string;
  tag: string;
  icon: React.ReactNode;
  color: string;
  description?: string;
  children?: NavItem[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Products",
    path: "/products",
    index: "01",
    tag: "PLATFORMS",
    icon: <WidgetsOutlinedIcon />,
    color: "#8B85FF",
  },
  {
    label: "Infrastructure",
    path: "/infrastructure",
    index: "02",
    tag: "THE LAYER",
    icon: <AccountTreeOutlinedIcon />,
    color: "#00D4AA",
  },
  {
    label: "Open Source",
    path: "/open-source",
    index: "03",
    tag: "IN PUBLIC",
    icon: <GitHubIcon />,
    color: "#6C63FF",
  },
  {
    label: "Developers",
    path: "/developers",
    index: "04",
    tag: "BUILD WITH US",
    icon: <TerminalOutlinedIcon />,
    color: "#6C63FF",
  },
  {
    label: "Research",
    path: "/research",
    index: "05",
    tag: "OPEN QUESTIONS",
    icon: <ScienceOutlinedIcon />,
    color: "#33DDBB",
  },
  {
    label: "Company",
    path: "/about",
    index: "06",
    tag: "WHO WE ARE",
    icon: <InfoOutlinedIcon />,
    color: "#8B85FF",
  },
  {
    label: "Blog",
    path: "/blog",
    index: "07",
    tag: "WRITING",
    icon: <ArticleOutlinedIcon />,
    color: "#F59E0B",
  },
];

const CTA_ITEM: NavItem = {
  label: "Partner With Us",
  path: "/partners",
  index: "08",
  tag: "INITIATE SEQUENCE",
  icon: <HandshakeOutlinedIcon />,
  color: "#00D4AA",
};

const HOME_ITEM: NavItem = {
  label: "Home",
  path: "/",
  index: "00",
  tag: "START HERE",
  icon: <HomeOutlinedIcon />,
  color: "#00D4AA",
};
const ALL_GRID_ITEMS: NavItem[] = [HOME_ITEM, ...NAV_ITEMS, CTA_ITEM];
const descriptions: Record<string, string> = {
  "/": "The thesis, platforms and people behind Neurodyne.",
  "/products": "Explore the platforms being built for African markets.",
  "/infrastructure": "AI, developer tools and shared digital foundations.",
  "/open-source": "Public repositories and reusable engineering work.",
  "/developers": "SDKs, agent skills and integration resources.",
  "/research": "Open questions in AI and digital systems.",
  "/about": "Meet the founder and understand the company.",
  "/blog": "Engineering notes, decisions and ideas.",
  "/partners": "Find a way to build with Neurodyne.",
};
ALL_GRID_ITEMS.forEach((item) => {
  Object.assign(item, { description: descriptions[item.path] });
});
const extra = (
  label: string,
  path: string,
  description: string,
  icon: React.ReactNode,
): NavItem => ({ label, path, description, icon, index: "", tag: "", color: "#8B85FF" });
const NAV_GROUPS: NavItem[] = [
  NAV_ITEMS[0]!,
  NAV_ITEMS[1]!,
  { ...NAV_ITEMS[3]!, children: [NAV_ITEMS[3]!, NAV_ITEMS[2]!] },
  {
    ...NAV_ITEMS[4]!,
    children: [
      NAV_ITEMS[4]!,
      extra(
        "Labs",
        "/labs",
        "Documented experiments and concepts to explore.",
        <ScienceOutlinedIcon />,
      ),
      NAV_ITEMS[6]!,
    ],
  },
  {
    ...NAV_ITEMS[5]!,
    children: [
      { ...NAV_ITEMS[5]!, label: "About" },
      extra(
        "Vision",
        "/vision",
        "The phases and direction of the infrastructure thesis.",
        <AccountTreeOutlinedIcon />,
      ),
      extra(
        "Engineering services",
        "/company/engineering-services",
        "Architecture and engineering for your organisation.",
        <TerminalOutlinedIcon />,
      ),
      extra(
        "Changelog",
        "/changelog",
        "Follow changes across the platform.",
        <ArticleOutlinedIcon />,
      ),
      extra(
        "Trust & security",
        "/trust",
        "Security practices, policies and transparency.",
        <InfoOutlinedIcon />,
      ),
      extra(
        "Client login",
        CLIENT_PORTAL_URL,
        "Open your project workspace in the client portal.",
        <WidgetsOutlinedIcon />,
      ),
    ],
  },
];

export { ALL_GRID_ITEMS, NAV_GROUPS };
export type { NavItem };
