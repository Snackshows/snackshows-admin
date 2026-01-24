import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { Loading } from "./components/common/Loading";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard/Dashboard";


// Lazy load all pages for better performance
const Login = lazy(() => import("./pages/Login"));
const Users = lazy(() => import("./pages/users/Users"));
const FilmCategory = lazy(() => import("./pages/FilmCategory"));
const FilmList = lazy(() => import("./pages/FilmList"));
const EpisodeList = lazy(() => import("./pages/EpisodeList"));
const Content = lazy(() => import("./pages/Content"));
const Employee = lazy(() => import("./pages/Employee"));
const VIPPlan = lazy(() => import("./pages/VIPPlan"));
const OrderHistory = lazy(() => import("./pages/OrderHistory"));
const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const EmployeeProfile = lazy(() => import("./pages/EmployeeProfile"));
const Language = lazy(() => import("./pages/Language"));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen message="Loading..." />;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const Logout = () => {
  const { logout } = useAuth();
  React.useEffect(() => {
    logout();
    window.location.href = "/login";
  }, [logout]);
  return null;
};

// Loading fallback component
const PageLoader = () => <Loading fullScreen message="Loading page..." />;

function AppRoutes() {
  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <Suspense fallback={<PageLoader />}>
                <Login />
              </Suspense>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route
                        path="/"
                        element={<Navigate to="/dashboard" replace />}
                      />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/users" element={<Users />} />
                      <Route
                        path="/user-profile/:id"
                        element={<UserProfile />}
                      />
                      <Route path="/employee" element={<Employee />} />
                      <Route
                        path="/employee-profile/:id"
                        element={<EmployeeProfile />}
                      />{" "}
                      {/* ← ADD THIS LINE */}
                      <Route path="/language" element={<Language />} />
                      <Route path="/film-category" element={<FilmCategory />} />
                      <Route path="/film-list" element={<FilmList />} />
                      <Route path="/episode-list" element={<EpisodeList />} />
                      <Route path="/content" element={<Content />} />
                      <Route path="/vip-plan" element={<VIPPlan />} />
                      <Route path="/order-history" element={<OrderHistory />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/logout" element={<Logout />} />
                      <Route
                        path="*"
                        element={<Navigate to="/dashboard" replace />}
                      />
                    </Routes>
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
