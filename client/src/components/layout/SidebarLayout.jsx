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
    <div className="min-h-screen bg-[#0F1B1E] text-[#F2EFE9] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#16262A] border-r border-[#1D3238] hidden md:flex flex-col">
        <div className="p-6 border-b border-[#1D3238]">
          <h2 className="text-2xl font-bold font-display text-[#E8A33D]">Samvad Setu</h2>
          <p className="text-xs text-[#9BA8A6] mt-1 tracking-wider uppercase">{getPortalTitle()}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#1D3238] text-[#E8A33D] font-medium border border-[#1D3238]'
                    : 'text-[#9BA8A6] hover:bg-[#1D3238]/50 hover:text-[#F2EFE9] border border-transparent'
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#1D3238]">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-[#0F1B1E] rounded-lg border border-[#1D3238]">
            <div className="w-8 h-8 rounded-full bg-[#1D3238] flex items-center justify-center text-[#E8A33D] font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#F2EFE9] truncate">{user?.name || 'Citizen User'}</p>
              <p className="text-xs text-[#9BA8A6] truncate">{user?.email || 'citizen@example.com'}</p>
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
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0F1B1E]">
        {/* Mobile Header */}
        <div className="md:hidden bg-[#16262A] border-b border-[#1D3238] p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Menu className="text-[#9BA8A6]" size={24} />
            <h2 className="text-lg font-bold font-display text-[#E8A33D]">Samvad Setu</h2>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#1D3238] flex items-center justify-center text-[#E8A33D] font-bold text-sm">
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
