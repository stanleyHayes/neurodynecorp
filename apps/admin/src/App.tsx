import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import { ThemeProvider } from "@/theme/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import AdminLayout from "@/components/layout/AdminLayout";
import SplashScreen from "@/components/splash/SplashScreen";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import Clients from "@/pages/Clients";
import Pipeline from "@/pages/Pipeline";
import Specifications from "@/pages/Specifications";
import Team from "@/pages/Team";
import Tasks from "@/pages/Tasks";
import Finance from "@/pages/Finance";
import Settings from "@/pages/Settings";
import Analytics from "@/pages/Analytics";
import ClientDetail from "@/pages/ClientDetail";
import BlogPosts from "@/pages/BlogPosts";
import Testimonials from "@/pages/Testimonials";
import Services from "@/pages/Services";
import Portfolio from "@/pages/Portfolio";
import ContactSubmissions from "@/pages/ContactSubmissions";
import SpecDetail from "@/pages/SpecDetail";
import Messages from "@/pages/Messages";
import Notifications from "@/pages/Notifications";
import ProjectDetail from "@/pages/ProjectDetail";
import BlogCreate from "@/pages/BlogCreate";
import BlogDetail from "@/pages/BlogDetail";
import PortfolioCreate from "@/pages/PortfolioCreate";
import TestimonialCreate from "@/pages/TestimonialCreate";
import ServiceCreate from "@/pages/ServiceCreate";
import TeamCreate from "@/pages/TeamCreate";
import TeamDetail from "@/pages/TeamDetail";
import Roles from "@/pages/Roles";
import RoleCreate from "@/pages/RoleCreate";
import RoleDetail from "@/pages/RoleDetail";
import ProjectCreate from "@/pages/ProjectCreate";
import ClientCreate from "@/pages/ClientCreate";
import AuditLog from "@/pages/AuditLog";
import FeatureFlags from "@/pages/FeatureFlags";
import StatusManager from "@/pages/StatusManager";
import ChangelogManager from "@/pages/ChangelogManager";
import KnowledgeBase from "@/pages/KnowledgeBase";
import Glossary from "@/pages/Glossary";
import Newsletter from "@/pages/Newsletter";
import FeedbackInbox from "@/pages/FeedbackInbox";
import Diagnostics from "@/pages/Diagnostics";
import Rfp from "@/pages/Rfp";
import Bookings from "@/pages/Bookings";
import Tickets from "@/pages/Tickets";
import PrivacyRequests from "@/pages/PrivacyRequests";
import ProjectIntakes from "@/pages/ProjectIntakes";
import CommandPalette from "@/components/shared/CommandPalette";
import KeyboardNav from "@/components/shared/KeyboardNav";
import CursorTrail from "@/components/shared/CursorTrail";
import SoundToggle from "@/components/shared/SoundToggle";
import ErrorBoundary from "@/components/shared/ErrorBoundary";

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
      <BrowserRouter>
        <CommandPalette />
        <KeyboardNav />
        <AuthProvider>
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
        </AuthProvider>
      </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
