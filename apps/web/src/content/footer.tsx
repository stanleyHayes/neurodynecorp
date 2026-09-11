import type { ReactNode } from "react";
import GitHubIcon from "@mui/icons-material/GitHub";
import EmailIcon from "@mui/icons-material/Email";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DesignServicesOutlinedIcon from "@mui/icons-material/DesignServicesOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import ArchitectureOutlinedIcon from "@mui/icons-material/ArchitectureOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import CookieOutlinedIcon from "@mui/icons-material/CookieOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import AccessibilityNewOutlinedIcon from "@mui/icons-material/AccessibilityNewOutlined";
import PrivacyTipOutlinedIcon from "@mui/icons-material/PrivacyTipOutlined";
interface FooterLinkItem {
  label: string;
  path: string;
  icon?: ReactNode;
}

const IC = { fontSize: 15 } as const;

const footerSections: { title: string; links: FooterLinkItem[] }[] = [
  {
    title: "Build",
    links: [
      { label: "Products", path: "/products", icon: <FolderOpenOutlinedIcon sx={IC} /> },
      {
        label: "Infrastructure",
        path: "/infrastructure",
        icon: <DesignServicesOutlinedIcon sx={IC} />,
      },
      { label: "Open Source", path: "/open-source", icon: <AccountTreeOutlinedIcon sx={IC} /> },
      { label: "Developers", path: "/developers", icon: <CodeOutlinedIcon sx={IC} /> },
      { label: "Labs", path: "/labs", icon: <ScienceOutlinedIcon sx={IC} /> },
      { label: "Research", path: "/research", icon: <InsightsOutlinedIcon sx={IC} /> },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", path: "/about", icon: <InfoOutlinedIcon sx={IC} /> },
      { label: "Vision", path: "/vision", icon: <ArchitectureOutlinedIcon sx={IC} /> },
      { label: "Partner With Us", path: "/partners", icon: <PlayCircleOutlinedIcon sx={IC} /> },
      { label: "Blog", path: "/blog", icon: <ArticleOutlinedIcon sx={IC} /> },
      { label: "Changelog", path: "/changelog", icon: <MenuBookOutlinedIcon sx={IC} /> },
      { label: "Contact", path: "/contact", icon: <MailOutlinedIcon sx={IC} /> },
    ],
  },
  {
    title: "Engineering Services",
    links: [
      {
        label: "Overview",
        path: "/company/engineering-services",
        icon: <DesignServicesOutlinedIcon sx={IC} />,
      },
      {
        label: "Audit & Architecture",
        path: "/company/engineering-services/audit",
        icon: <ArchitectureOutlinedIcon sx={IC} />,
      },
      {
        label: "Enterprise & Institutions",
        path: "/company/engineering-services/enterprise",
        icon: <AccountBalanceOutlinedIcon sx={IC} />,
      },
      {
        label: "AI & Automation",
        path: "/company/engineering-services/ai",
        icon: <PsychologyOutlinedIcon sx={IC} />,
      },
      { label: "Digital Platforms", path: "/company/engineering-services/digital", icon: <CodeOutlinedIcon sx={IC} /> },
      { label: "Strategy & Advisory", path: "/company/engineering-services/advisory", icon: <ArchitectureOutlinedIcon sx={IC} /> },
      {
        label: "Scope Estimator",
        path: "/company/engineering-services/estimator",
        icon: <CalculateOutlinedIcon sx={IC} />,
      },
      {
        label: "Submit an RFP",
        path: "/company/engineering-services/rfp",
        icon: <DescriptionOutlinedIcon sx={IC} />,
      },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", path: "/help", icon: <SupportAgentOutlinedIcon sx={IC} /> },
      { label: "FAQ", path: "/faq", icon: <QuizOutlinedIcon sx={IC} /> },
      { label: "Glossary", path: "/glossary", icon: <MenuBookOutlinedIcon sx={IC} /> },
      { label: "Book a Call", path: "/book", icon: <EventAvailableOutlinedIcon sx={IC} /> },
    ],
  },
  {
    title: "Legal & Trust",
    links: [
      { label: "Status", path: "/status", icon: <MonitorHeartOutlinedIcon sx={IC} /> },
      { label: "Trust Center", path: "/trust", icon: <VerifiedUserOutlinedIcon sx={IC} /> },
      { label: "Security", path: "/legal/security", icon: <SecurityOutlinedIcon sx={IC} /> },
      { label: "Sub-processors", path: "/legal/subprocessors", icon: <HubOutlinedIcon sx={IC} /> },
      { label: "Cookie Policy", path: "/legal/cookies", icon: <CookieOutlinedIcon sx={IC} /> },
      { label: "DPA", path: "/legal/dpa", icon: <GavelOutlinedIcon sx={IC} /> },
      {
        label: "Accessibility",
        path: "/legal/accessibility",
        icon: <AccessibilityNewOutlinedIcon sx={IC} />,
      },
      { label: "Privacy", path: "/privacy", icon: <PrivacyTipOutlinedIcon sx={IC} /> },
      {
        label: "Delete Account",
        path: "/account-deletion",
        icon: <PrivacyTipOutlinedIcon sx={IC} />,
      },
    ],
  },
];

const socials = [
  {
    icon: <GitHubIcon fontSize="small" />,
    label: "GitHub",
    href: "https://github.com/stanleyHayes",
  },
  { icon: <EmailIcon fontSize="small" />, label: "Email", href: "mailto:info@neurodyne.dev" },
];

export { footerSections, socials };
