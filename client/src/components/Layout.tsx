import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  CheckSquare,
  FileText,
  Package,
  Shield,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['ADMIN', 'MANAGER', 'AGENT', 'VIEWER'] },
    { path: '/contacts', icon: Users, label: 'Contacts', roles: ['ADMIN', 'MANAGER', 'AGENT', 'VIEWER'] },
    { path: '/opportunities', icon: TrendingUp, label: 'Opportunities', roles: ['ADMIN', 'MANAGER', 'AGENT', 'VIEWER'] },
    { path: '/activities', icon: CheckSquare, label: 'Activities', roles: ['ADMIN', 'MANAGER', 'AGENT', 'VIEWER'] },
    { path: '/ncr', icon: FileText, label: 'NCR', roles: ['ADMIN', 'QA', 'MANAGER'] },
    { path: '/documents', icon: FileText, label: 'Documents', roles: ['ADMIN', 'QA', 'MANAGER', 'AGENT', 'VIEWER'] },
    { path: '/suppliers', icon: Package, label: 'Suppliers', roles: ['ADMIN', 'QA', 'MANAGER'] },
    { path: '/compliance', icon: Shield, label: 'POPIA', roles: ['ADMIN', 'QA', 'MANAGER'] },
  ];

  const visibleNavItems = navItems.filter(item => hasRole(...item.roles));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <h1 className="text-xl font-bold text-gray-900">Muponi CRM</h1>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="p-4 space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 w-full p-4 border-t">
            <div className="mb-3 px-4">
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </aside>

        <div className="flex-1 lg:ml-64">
          <header className="bg-white border-b h-16 flex items-center px-6">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-4">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {visibleNavItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </h2>
          </header>

          <main className="p-6">
            {children}
          </main>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
