import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AppProvider, useApp } from "./context/AppContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminTasks from "./pages/admin/AdminTasks";
import AdminEmployees from "./pages/admin/AdminEmployees";
import AdminReports from "./pages/admin/AdminReports";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import EmpOverview from "./pages/employee/EmpOverview";
import EmpTasks from "./pages/employee/EmpTasks";
import EmpReports from "./pages/employee/EmpReports";
import EmpAnalytics from "./pages/employee/EmpAnalytics";

function ProtectedRoute({ children, adminOnly = false }) {
  const { currentUser, loading } = useApp();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]"><span className="w-8 h-8 border-2 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin" /></div>;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (adminOnly && currentUser.role !== "Admin") return <Navigate to="/dashboard" replace />;
  if (!adminOnly && currentUser.role === "Admin") return <Navigate to="/admin" replace />;
  return children;
}

function AppRoutes() {
  const { currentUser } = useApp();
  return (
    <Routes>
      <Route path="/login" element={!currentUser ? <Login /> : <Navigate to={currentUser.role === "Admin" ? "/admin" : "/dashboard"} replace />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><Layout /></ProtectedRoute>}>
        <Route index element={<AdminOverview />} />
        <Route path="tasks" element={<AdminTasks />} />
        <Route path="employees" element={<AdminEmployees />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>

      {/* Employee Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<EmpOverview />} />
        <Route path="tasks" element={<EmpTasks />} />
        <Route path="reports" element={<EmpReports />} />
        <Route path="analytics" element={<EmpAnalytics />} />
      </Route>

      <Route path="*" element={<Navigate to={currentUser ? (currentUser.role === "Admin" ? "/admin" : "/dashboard") : "/login"} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: "var(--card-base)", color: "var(--text-base)", border: "1px solid var(--border-base)", fontSize: "13px", fontWeight: "600" },
            success: { iconTheme: { primary: "#10b981", secondary: "white" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "white" } }
          }}
        />
      </BrowserRouter>
    </AppProvider>
  );
}
