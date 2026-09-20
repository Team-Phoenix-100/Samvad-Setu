import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, Settings as SettingsIcon, LogOut, Menu, ShieldCheck, Building2, Briefcase } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';

export default function SidebarLayout() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const { showToast } = useToastStore();

  const handleLogout = async () => {
    await logout();
    showToast("Successfully logged out!", "success");
    navigate('/login');
  };

  const getNavItems = () => {
    const role = user?.role || 'citizen';
    const items = [];
    
    if (role === 'government_admin' || role === 'admin' || role === 'govt_admin' || role === 'platform_admin') {
      items.push({ name: 'Admin Analytics', path: '/admin/analytics', icon: ShieldCheck });
      items.push({ name: 'Problem Operations', path: '/admin/problems', icon: LayoutDashboard });
    } else if (role === 'hei' || role === 'hei_admin') {
      items.push({ name: 'HEI Dashboard', path: '/hei/dashboard', icon: Building2 });
      items.push({ name: 'Problem Tracking', path: '/hei/tracking', icon: LayoutDashboard });
    } else if (role === 'industry_csr' || role === 'industry_admin') {
      items.push({ name: 'Industry Dashboard', path: '/industry/dashboard', icon: Briefcase });
      items.push({ name: 'Problem Tracking', path: '/industry/tracking', icon: LayoutDashboard });
    } else {
      items.push({ name: 'Dashboard', path: '/citizen/dashboard', icon: LayoutDashboard });
    }
    
    let basePath = '/citizen';
    if (role === 'government_admin' || role === 'admin' || role === 'govt_admin' || role === 'platform_admin') basePath = '/admin';
    else if (role === 'hei' || role === 'hei_admin') basePath = '/hei';
    else if (role === 'industry_csr' || role === 'industry_admin') basePath = '/industry';

    items.push({ name: 'Profile', path: `${basePath}/profile`, icon: User });
    items.push({ name: 'Settings', path: `${basePath}/settings`, icon: SettingsIcon });
    
    return items;
  };

  const getPortalTitle = () => {
    const role = user?.role || 'citizen';
    if (role === 'government_admin' || role === 'admin' || role === 'govt_admin' || role === 'platform_admin') return 'Government Portal';
    if (role === 'hei' || role === 'hei_admin') return 'HEI Portal';
    if (role === 'industry_csr' || role === 'industry_admin') return 'Industry Portal';
    return 'Citizen Portal';
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-base text-primary-custom flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-surface-raised hidden md:flex flex-col">
        <div className="p-6 border-b border-surface-raised">
          <h2 className="text-2xl font-bold font-display text-accent-primary">Samvad Setu</h2>
          <p className="text-xs text-muted-custom mt-1 tracking-wider uppercase">{getPortalTitle()}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-surface-raised text-accent-primary font-medium border border-surface-raised'
                    : 'text-muted-custom hover:bg-surface-raised/50 hover:text-primary-custom border border-transparent'
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-surface-raised">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-base rounded-lg border border-surface-raised">
            <div className="w-8 h-8 rounded-full bg-surface-raised flex items-center justify-center text-accent-primary font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary-custom truncate">{user?.name || 'Citizen User'}</p>
              <p className="text-xs text-muted-custom truncate">{user?.email || 'citizen@example.com'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-400/10 hover:text-red-300 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-base">
        {/* Mobile Header */}
        <div className="md:hidden bg-surface border-b border-surface-raised p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Menu className="text-muted-custom" size={24} />
            <h2 className="text-lg font-bold font-display text-accent-primary">Samvad Setu</h2>
          </div>
          <div className="w-8 h-8 rounded-full bg-surface-raised flex items-center justify-center text-accent-primary font-bold text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto w-full">
          {/* We remove max-w and p-4 from here because CitizenDashboard already defines its own max-w and padding.
              We just provide a full width container and let the pages handle their own bounds, or provide a standard padding.
              Let's provide standard padding but let pages handle max-w. */}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
