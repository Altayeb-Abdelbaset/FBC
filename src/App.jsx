import { Toaster } from "@/components/ui/toaster"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Workers from './pages/Workers';
import Attendance from './pages/Attendance';
import AttendanceHistory from './pages/AttendanceHistory';
import InviteUsers from './pages/InviteUsers';
// استيراد الحارس الجديد
import AdminGuard from "@/components/guards/AdminGuard"; 

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* الصفحات العامة */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* مسارات التطبيق المحمية */}
      <Route element={<AppLayout />}>
        {/* صفحة الحضور متاحة للكل */}
        <Route path="/attendance" element={<Attendance />} />

        {/* الصفحات المحمية للأدمن فقط باستخدام AdminGuard */}
        <Route path="/" element={<AdminGuard><Dashboard /></AdminGuard>} />
        <Route path="/workers" element={<AdminGuard><Workers /></AdminGuard>} />
        <Route path="/history" element={<AdminGuard><AttendanceHistory /></AdminGuard>} />
        <Route path="/invite" element={<AdminGuard><InviteUsers /></AdminGuard>} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AuthenticatedApp />
      </Router>
      <Toaster />
    </AuthProvider>
  )
}

export default App;