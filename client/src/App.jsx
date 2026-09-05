import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ComponentLibrary from "./pages/dev/ComponentLibrary";
import Landing from "./pages/public/Landing";
import Login from "./pages/public/Login";
import Signup from "./pages/public/Signup";
import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import SubmitProblem from "./pages/citizen/SubmitProblem";
import ProblemDetail from "./pages/public/ProblemDetail";
import HeiDashboard from "./pages/hei/HeiDashboard";
import HeiProblemReview from "./pages/hei/HeiProblemReview";
import PublicMap from "./pages/public/PublicMap";
import IndustryDashboard from "./pages/industry/IndustryDashboard";
import IndustryBrowse from "./pages/industry/IndustryBrowse";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminProblems from "./pages/admin/AdminProblems";
import HeiTracking from "./pages/hei/HeiTracking";
import IndustryTracking from "./pages/industry/IndustryTracking";
import Toast from "./components/ui/Toast";
import SidebarLayout from "./components/layout/SidebarLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import PublicLayout from "./components/layout/PublicLayout";
import Profile from "./pages/citizen/Profile";
import Settings from "./pages/citizen/Settings";

// Temporary placeholder wrapper for project pages during Phase 1 setup[cite: 1]
const PageStub = ({ title, category }) => (
  <div className="min-h-screen bg-[#0F1B1E] text-[#F2EFE9] p-8">
    <div className="max-w-4xl mx-auto space-y-4 border border-[#1D3238] p-6 rounded-lg bg-[#16262A]">
      <span className="text-xs font-mono uppercase tracking-widest text-[#E8A33D] bg-[#E8A33D]/10 px-2 py-1 rounded">
        {category}
      </span>
      <h1 className="text-3xl font-bold font-display">{title}</h1>
      <p className="text-[#9BA8A6]">
        Route configured successfully. Implement page components inside{" "}
        <code className="text-[#2F9E8F]">src/pages/</code>.
      </p>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        {/* Design System Preview Route (Section 0.2)[cite: 1] */}
        <Route path="/dev/components" element={<ComponentLibrary />} />

        {/* Public Module Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route
            path="/how-it-works"
            element={<PageStub title="How It Works" category="Public (P1)" />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/map" element={<PublicMap />} />
        </Route>

        {/* Citizen Module Routes (Section 1)[cite: 1] */}
        <Route element={<ProtectedRoute allowedRoles={['citizen']} />}>
          <Route element={<SidebarLayout />}>
            <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
            <Route path="/citizen/submit" element={<SubmitProblem />} />
            <Route
              path="/citizen/notifications"
              element={
                <PageStub title="Citizen Notifications" category="Citizen (P1)" />
              }
            />
            <Route path="/citizen/profile" element={<Profile />} />
            <Route path="/citizen/settings" element={<Settings />} />
          </Route>
        </Route>
        
        {/* Public view of problem (wrapped in Sidebar for dynamic role UI) */}
        <Route element={<SidebarLayout />}>
          <Route path="/problem/:id" element={<ProblemDetail />} />
        </Route>

        {/* HEI / Faculty Module Routes */}
        <Route element={<ProtectedRoute allowedRoles={['hei', 'hei_admin']} />}>
          <Route element={<SidebarLayout />}>
            <Route path="/hei/dashboard" element={<HeiDashboard />} />
            <Route path="/hei/review" element={<HeiProblemReview />} />
            <Route path="/hei/tracking" element={<HeiTracking />} />
            <Route
              path="/hei/team-formation"
              element={
                <PageStub
                  title="Team Formation"
                  category="Faculty/HEI Admin (P1)"
                />
              }
            />
            <Route
              path="/hei/workspace"
              element={
                <PageStub
                  title="Project Workspace"
                  category="Faculty / Students (P0)"
                />
              }
            />
            <Route
              path="/hei/analytics"
              element={
                <PageStub title="HEI Analytics" category="Faculty/HEI Admin (P2)" />
              }
            />
          </Route>
        </Route>

        {/* Industry / CSR Module Routes */}
        <Route element={<ProtectedRoute allowedRoles={['industry_csr', 'industry_admin']} />}>
          <Route element={<SidebarLayout />}>
            <Route path="/industry/dashboard" element={<IndustryDashboard />} />
            <Route path="/industry/browse" element={<IndustryBrowse />} />
            <Route path="/industry/tracking" element={<IndustryTracking />} />
            <Route
              path="/industry/pledge"
              element={
                <PageStub title="Pledge Support Flow" category="Industry (P0)" />
              }
            />
            <Route
              path="/industry/csr-report"
              element={
                <PageStub title="CSR Compliance Report" category="Industry (P1)" />
              }
            />
          </Route>
        </Route>

        {/* Government / DHTE Module Routes (Section 1)[cite: 1] */}
        <Route element={<ProtectedRoute allowedRoles={['government_admin', 'admin', 'govt_admin', 'platform_admin']} />}>
          <Route element={<SidebarLayout />}>
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/problems" element={<AdminProblems />} />
            <Route path="/admin/profile" element={<Profile />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route
              path="/admin/moderation"
              element={
                <PageStub
                  title="Problem Moderation Queue"
                  category="DHTE Admin (P1)"
                />
              }
            />
            <Route
              path="/admin/institutions"
              element={
                <PageStub
                  title="Institution & Industry Management"
                  category="DHTE Admin (P2)"
                />
              }
            />
          </Route>
        </Route>

        {/* Fallback 404 Route[cite: 1] */}
        <Route
          path="*"
          element={
            <PageStub title="404 - Page Not Found" category="Public (P1)" />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
