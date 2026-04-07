import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Loader from "@/components/common/Loader";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";

const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const Feed = lazy(() => import("@/pages/Feed"));
const Profile = lazy(() => import("@/pages/Profile"));
const SubmitNews = lazy(() => import("@/pages/SubmitNews"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Verify = lazy(() => import("@/pages/Verify"));

function ProtectedRoute({ children }) {
  const { isAuthenticated, bootstrapping } = useAuth();

  if (bootstrapping) {
    return <Loader fullScreen label="Restoring your session" />;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, bootstrapping } = useAuth();

  if (bootstrapping) {
    return <Loader fullScreen label="Preparing Tez News" />;
  }

  return isAuthenticated ? <Navigate to="/feed" replace /> : children;
}

export default function App() {
  return (
    <Suspense fallback={<Loader fullScreen label="Loading interface" />}>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicOnlyRoute>
              <Signup />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/feed" replace />} />
          <Route path="feed" element={<Feed />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="submit" element={<SubmitNews />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="/verify" element={<Verify />} />
        <Route path="*" element={<Navigate to="/feed" replace />} />
      </Routes>
    </Suspense>
  );
}
