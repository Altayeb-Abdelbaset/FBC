import { useAuth } from '@/lib/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminGuard({ children }) {
  const { userProfile, loading } = useAuth();

  // 1. انتظار الـ Context لحد ما يخلص تحميل بيانات اليوزر
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // 2. التحقق من الصلاحية (تحويل الـ role لـ lowercase لتجنب مشاكل الحروف)
  const isAdmin = userProfile?.role?.toLowerCase() === 'admin';

  // 3. لو مش أدمن، توجيه لصفحة الحضور
  if (!isAdmin) {
    return <Navigate to="/attendance" replace />;
  }

  // 4. لو هو أدمن، يعرض المحتوى
  return children;
}