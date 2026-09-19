import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ToastProvider } from './context/ToastContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';

// Public Pages
import { Home } from './pages/Home.js';
import { Register } from './pages/Register.js';
import { RegistrationSuccess } from './pages/RegistrationSuccess.js';
import { VerifyApplication } from './pages/VerifyApplication.js';
import { WhatsAppJoin } from './pages/WhatsAppJoin.js';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin.js';
import { AdminDashboard } from './pages/admin/AdminDashboard.js';
import { AdminApplications } from './pages/admin/AdminApplications.js';
import { AdminReports } from './pages/admin/AdminReports.js';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs.js';
import { Loader2 } from 'lucide-react';

// Protected Route Guard for Admin Section
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-police-700 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Verifying Admin Session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

// 404 Fallback Page
const NotFoundPage: React.FC = () => (
  <div className="container mx-auto px-4 py-24 text-center space-y-4">
    <h1 className="text-6xl font-black text-police-900 font-mono">404</h1>
    <h2 className="text-xl font-bold text-slate-800">Official Page Not Found</h2>
    <p className="text-xs text-slate-500 max-w-md mx-auto">
      The requested URL was not found on the Alwar Police Cyber Security Internship portal.
    </p>
    <div className="pt-4">
      <a
        href="/"
        className="px-6 py-2.5 bg-police-800 hover:bg-police-900 text-white text-xs font-bold rounded-xl shadow transition-colors"
      >
        Return to Home Page
      </a>
    </div>
  </div>
);

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Student Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/registration-success" element={<RegistrationSuccess />} />
                <Route path="/verify/:applicationId" element={<VerifyApplication />} />
                <Route path="/verify/check" element={<VerifyApplication />} />
                <Route path="/whatsapp" element={<WhatsAppJoin />} />
                <Route path="/whatsapp-group" element={<WhatsAppJoin />} />

                {/* Admin Auth Route */}
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Protected Admin Routes */}
                <Route
                  path="/admin"
                  element={<Navigate to="/admin/dashboard" replace />}
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedAdminRoute>
                      <AdminDashboard />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/applications"
                  element={
                    <ProtectedAdminRoute>
                      <AdminApplications />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedAdminRoute>
                      <AdminReports />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin/audit-logs"
                  element={
                    <ProtectedAdminRoute>
                      <AdminAuditLogs />
                    </ProtectedAdminRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
