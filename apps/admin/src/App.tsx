import { lazy, Suspense, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router";
import { ThemeProvider } from "@/theme/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import AdminLayout from "@/components/layout/AdminLayout";
import SplashScreen from "@/components/splash/SplashScreen";
import Login from "@/pages/Login";
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Projects = lazy(() => import("@/pages/Projects"));
const Clients = lazy(() => import("@/pages/Clients"));
const Pipeline = lazy(() => import("@/pages/Pipeline"));
const Specifications = lazy(() => import("@/pages/Specifications"));
const Team = lazy(() => import("@/pages/Team"));
const Tasks = lazy(() => import("@/pages/Tasks"));
const Finance = lazy(() => import("@/pages/Finance"));
const Settings = lazy(() => import("@/pages/Settings"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const ClientDetail = lazy(() => import("@/pages/ClientDetail"));
const BlogPosts = lazy(() => import("@/pages/BlogPosts"));
const Testimonials = lazy(() => import("@/pages/Testimonials"));
const Services = lazy(() => import("@/pages/Services"));
const Portfolio = lazy(() => import("@/pages/Portfolio"));
const ContactSubmissions = lazy(() => import("@/pages/ContactSubmissions"));
const SpecDetail = lazy(() => import("@/pages/SpecDetail"));
const Messages = lazy(() => import("@/pages/Messages"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const ProjectDetail = lazy(() => import("@/pages/ProjectDetail"));
const BlogCreate = lazy(() => import("@/pages/BlogCreate"));
const BlogDetail = lazy(() => import("@/pages/BlogDetail"));
const PortfolioCreate = lazy(() => import("@/pages/PortfolioCreate"));
const TestimonialCreate = lazy(() => import("@/pages/TestimonialCreate"));
const ServiceCreate = lazy(() => import("@/pages/ServiceCreate"));
const TeamCreate = lazy(() => import("@/pages/TeamCreate"));
const TeamDetail = lazy(() => import("@/pages/TeamDetail"));
const Roles = lazy(() => import("@/pages/Roles"));
const RoleCreate = lazy(() => import("@/pages/RoleCreate"));
const RoleDetail = lazy(() => import("@/pages/RoleDetail"));
const ProjectCreate = lazy(() => import("@/pages/ProjectCreate"));
const ClientCreate = lazy(() => import("@/pages/ClientCreate"));
const AuditLog = lazy(() => import("@/pages/AuditLog"));
const FeatureFlags = lazy(() => import("@/pages/FeatureFlags"));
const StatusManager = lazy(() => import("@/pages/StatusManager"));
const ChangelogManager = lazy(() => import("@/pages/ChangelogManager"));
const KnowledgeBase = lazy(() => import("@/pages/KnowledgeBase"));
const Glossary = lazy(() => import("@/pages/Glossary"));
const Newsletter = lazy(() => import("@/pages/Newsletter"));
const FeedbackInbox = lazy(() => import("@/pages/FeedbackInbox"));
const Diagnostics = lazy(() => import("@/pages/Diagnostics"));
const Rfp = lazy(() => import("@/pages/Rfp"));
const Bookings = lazy(() => import("@/pages/Bookings"));
const Tickets = lazy(() => import("@/pages/Tickets"));
const PrivacyRequests = lazy(() => import("@/pages/PrivacyRequests"));
const ProjectIntakes = lazy(() => import("@/pages/ProjectIntakes"));
import CommandPalette from "@/components/shared/CommandPalette";
import KeyboardNav from "@/components/shared/KeyboardNav";
import CursorTrail from "@/components/shared/CursorTrail";
import SoundToggle from "@/components/shared/SoundToggle";
import ErrorBoundary from "@/components/shared/ErrorBoundary";

/** Shown while a lazy route chunk loads outside the admin chrome. */
function RouteFallback() {
  return (
    <Box
      role="status"
      aria-live="polite"
      aria-label="Loading"
      sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <CircularProgress size={28} />
    </Box>
  );
}

const SPLASH_KEY = "neurodyne_admin_splash_shown";

export default function App() {
  const [splashDone, setSplashDone] = useState(
    () => sessionStorage.getItem(SPLASH_KEY) === "true",
  );

  const handleSplashComplete = () => {
    sessionStorage.setItem(SPLASH_KEY, "true");
    setSplashDone(true);
  };

  return (
    <ThemeProvider>
      <ErrorBoundary>
      {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}
      <CursorTrail />
      <SoundToggle />
      <AuthProvider>
        <BrowserRouter>
          <CommandPalette />
          <KeyboardNav />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="clients" element={<Clients />} />
                  <Route path="clients/new" element={<ClientCreate />} />
                  <Route path="clients/:id" element={<ClientDetail />} />
                  <Route path="pipeline" element={<Pipeline />} />
                  <Route path="project-intakes" element={<ProjectIntakes />} />
                  <Route path="projects" element={<Projects />} />
                  <Route path="projects/new" element={<ProjectCreate />} />
                  <Route path="projects/:id" element={<ProjectDetail />} />
                  <Route path="specifications" element={<Specifications />} />
                  <Route path="specifications/:id" element={<SpecDetail />} />
                  <Route path="team" element={<Team />} />
                  <Route path="team/new" element={<TeamCreate />} />
                  <Route path="team/:id" element={<TeamDetail />} />
                  <Route path="tasks" element={<Tasks />} />
                  <Route path="finance" element={<Finance />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="blog" element={<BlogPosts />} />
                  <Route path="blog/new" element={<BlogCreate />} />
                  <Route path="blog/:id" element={<BlogDetail />} />
                  <Route path="portfolio" element={<Portfolio />} />
                  <Route path="portfolio/new" element={<PortfolioCreate />} />
                  <Route path="testimonials" element={<Testimonials />} />
                  <Route path="testimonials/new" element={<TestimonialCreate />} />
                  <Route path="services" element={<Services />} />
                  <Route path="services/new" element={<ServiceCreate />} />
                  <Route path="contact-submissions" element={<ContactSubmissions />} />
                  <Route path="messages" element={<Messages />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="roles" element={<Roles />} />
                  <Route path="roles/new" element={<RoleCreate />} />
                  <Route path="roles/:id" element={<RoleDetail />} />
                  <Route path="status" element={<StatusManager />} />
                  <Route path="feature-flags" element={<FeatureFlags />} />
                  <Route path="audit-log" element={<AuditLog />} />
                  <Route path="feedback" element={<FeedbackInbox />} />
                  <Route path="diagnostics" element={<Diagnostics />} />
                  <Route path="rfp" element={<Rfp />} />
                  <Route path="bookings" element={<Bookings />} />
                  <Route path="tickets" element={<Tickets />} />
                  <Route path="knowledge-base" element={<KnowledgeBase />} />
                  <Route path="glossary" element={<Glossary />} />
                  <Route path="newsletter" element={<Newsletter />} />
                  <Route path="privacy-requests" element={<PrivacyRequests />} />
                  <Route path="changelog" element={<ChangelogManager />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
