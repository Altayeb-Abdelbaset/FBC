import React from 'react';
import { supabase } from "@/lib/supabaseClient";
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardCheck, History, Menu, X, LogOut, UserPlus } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext'; 

const adminNavItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Workers', path: '/workers', icon: Users },
  { label: 'Attendance', path: '/attendance', icon: ClipboardCheck },
  { label: 'History', path: '/history', icon: History },
  { label: 'Invite Users', path: '/invite', icon: UserPlus },
];

const userNavItems = [
  { label: 'Attendance', path: '/attendance', icon: ClipboardCheck },
];

const handleLogout = async () => {
  await supabase.auth.signOut();
  window.location.href = "/login";
};

export default function Sidebar({ isOpen, onToggle }) {
  const location = useLocation();
  const { userProfile } = useAuth();

  // التعديل هنا: استخدام toLowerCase() لضمان مطابقة الـ role مهما كان مكتوب في الداتابيز
  const isAdmin = userProfile?.role?.toLowerCase() === 'admin';
  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onToggle} />
      )}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-card shadow-md border border-border"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <aside className={`fixed top-0 left-0 h-full w-64 bg-sidebar text-sidebar-foreground z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="px-6 py-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h1 className="font-heading font-bold text-base text-sidebar-foreground">FBC</h1>
                <p className="text-[11px] text-sidebar-foreground/50 tracking-wide uppercase">
                  {userProfile?.email || 'User'}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => { if (window.innerWidth < 1024) onToggle(); }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  }`}
                >
                  <item.icon className="w-[18px] h-[18px]" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="px-3 py-4 border-t border-sidebar-border">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all w-full"
            >
              <LogOut className="w-[18px] h-[18px]" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}