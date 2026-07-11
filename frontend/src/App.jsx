import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import ErrorBoundary from "./components/common/ErrorBoundary";
import Loader from "./components/common/Loader";
import ProtectedRoute from "./components/common/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import AuthLayout from "./pages/auth/AuthLayout";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import AdminOverview from "./pages/admin/AdminOverview";
import ManageResource from "./pages/admin/ManageResource";
import ProfilePage from "./pages/user/ProfilePage";
import NotificationsPage from "./pages/user/NotificationsPage";
import SettingsPage from "./pages/user/SettingsPage";
import UserListPage from "./pages/user/UserListPage";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const ProjectDetailPage = lazy(() => import("./pages/ProjectDetailPage"));
const BlogsPage = lazy(() => import("./pages/BlogsPage"));
const BlogDetailPage = lazy(() => import("./pages/BlogDetailPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:slug" element={<ProjectDetailPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/blogs/:slug" element={<BlogDetailPage />} />
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<ProfilePage />} />
              <Route path="saved" element={<UserListPage title="Saved projects" description="Projects saved for deeper review." type="savedProjects" />} />
              <Route path="favorites" element={<UserListPage title="Favorite projects" description="Projects marked as favorites." type="favoriteProjects" />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route path="/admin" element={<DashboardLayout admin />}>
              <Route index element={<AdminOverview />} />
              <Route path="users" element={<ManageResource type="users" />} />
              <Route path="projects" element={<ManageResource type="projects" />} />
              <Route path="blogs" element={<ManageResource type="blogs" />} />
              <Route path="skills" element={<ManageResource type="skills" />} />
              <Route path="certificates" element={<ManageResource type="certificates" />} />
              <Route path="testimonials" element={<ManageResource type="testimonials" />} />
              <Route path="messages" element={<ManageResource type="messages" />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
