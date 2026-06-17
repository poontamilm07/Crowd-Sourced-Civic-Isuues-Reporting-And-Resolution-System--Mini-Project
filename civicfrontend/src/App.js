import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Public Pages
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import OtpVerify from './pages/OtpVerify';

// Citizen Pages
import CitizenDashboard from
  './pages/citizen/CitizenDashboard';
import ReportIssue from
  './pages/citizen/ReportIssue';
import MyIssues from
  './pages/citizen/MyIssues';
import TrackIssue from
  './pages/citizen/TrackIssue';
import PublicIssues from
  './pages/citizen/PublicIssues';
import CitizenProfile from
  './pages/citizen/CitizenProfile';

// Admin Pages
import AdminDashboard from
  './pages/admin/AdminDashboard';
import ManageUsers from
  './pages/admin/ManageUsers';
import ManageIssues from
  './pages/admin/ManageIssues';
import Analytics from
  './pages/admin/Analytics';

// Authority Pages
import AuthorityDashboard from
  './pages/authority/AuthorityDashboard';
import AssignedIssues from
  './pages/authority/AssignedIssues';
import AuthorityProfile from
  './pages/authority/AuthorityProfile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
        />
        <Routes>

          {/* ── Public Routes ── */}
          <Route
            path="/"
            element={<Landing />}
          />
          <Route
            path="/register"
            element={<Register />}
          />
          <Route
            path="/login"
            element={<Login />}
          />
          <Route
            path="/verify-otp"
            element={<OtpVerify />}
          />

          {/* ── Citizen Routes ── */}
          <Route
            path="/citizen/dashboard"
            element={
              <ProtectedRoute
                allowedRole="CITIZEN"
              >
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/report-issue"
            element={
              <ProtectedRoute
                allowedRole="CITIZEN"
              >
                <ReportIssue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/my-issues"
            element={
              <ProtectedRoute
                allowedRole="CITIZEN"
              >
                <MyIssues />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/track-issue"
            element={
              <ProtectedRoute
                allowedRole="CITIZEN"
              >
                <TrackIssue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/public-issues"
            element={
              <ProtectedRoute
                allowedRole="CITIZEN"
              >
                <PublicIssues />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/profile"
            element={
              <ProtectedRoute
                allowedRole="CITIZEN"
              >
                <CitizenProfile />
              </ProtectedRoute>
            }
          />

          {/* ── Admin Routes ── */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute
                allowedRole="ADMIN"
              >
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/manage-users"
            element={
              <ProtectedRoute
                allowedRole="ADMIN"
              >
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/manage-issues"
            element={
              <ProtectedRoute
                allowedRole="ADMIN"
              >
                <ManageIssues />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute
                allowedRole="ADMIN"
              >
                <Analytics />
              </ProtectedRoute>
            }
          />

          {/* ── Authority Routes ── */}
          <Route
            path="/authority/dashboard"
            element={
              <ProtectedRoute
                allowedRole="AUTHORITY"
              >
                <AuthorityDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/authority/assigned-issues"
            element={
              <ProtectedRoute
                allowedRole="AUTHORITY"
              >
                <AssignedIssues />
              </ProtectedRoute>
            }
          />
          <Route
            path="/authority/profile"
            element={
              <ProtectedRoute
                allowedRole="AUTHORITY"
              >
                <AuthorityProfile />
              </ProtectedRoute>
            }
          />

          {/* ── Fallback Route ── */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
