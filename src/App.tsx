import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.tsx";
import Login from "./pages/Login.tsx";
import JourneySetup from "./pages/JourneySetup.tsx";
import Listening from "./pages/Listening.tsx";
import Alert from "./pages/Alert.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import LoadingScreen from "./components/LoadingScreen.tsx";

/**
 * Route protector wrapper.
 * Redirects anonymous users to the login screen.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Verifying authentication..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/journey"
            element={
              <ProtectedRoute>
                <JourneySetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/listening"
            element={
              <ProtectedRoute>
                <Listening />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <ProtectedRoute>
                <Alert />
              </ProtectedRoute>
            }
          />

          {/* Fallback Catchall */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
