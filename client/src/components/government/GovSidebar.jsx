import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShieldAlert, Building2, ClipboardList, LogOut } from 'lucide-react';
import { useGovModerationStore } from '../../store/govModerationStore';
import { useGovInstitutionStore } from '../../store/govInstitutionStore';

export default function GovSidebar() {
  const { unreadCount } = useGovModerationStore();
  const { pendingCount } = useGovInstitutionStore();

  const links = [
    { name: 'Dashboard', path: '/government/dashboard', icon: LayoutDashboard },
    { name: 'Moderation Queue', path: '/government/moderation', icon: ShieldAlert, badge: unreadCount },
    { name: 'Institutions', path: '/government/institutions', icon: Building2, badge: pendingCount },
    { name: 'Audit Log', path: '/government/audit-log', icon: ClipboardList },
  ];

  return (
    <div className="w-64 flex-shrink-0 bg-[#16272B] border-r border-[#233E44] flex flex-col">
      <div className="p-6 border-b border-[#233E44]">
        <h1 className="text-2xl font-bold font-display text-[#F2EFE9]">Samvad<span className="text-[#E8A33D]">Setu</span></h1>
        <p className="text-xs font-mono text-[#2F9E8F] mt-1">DHTE Admin Panel</p>
      </div>
      
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                isActive 
                  ? 'bg-[#E8A33D]/10 text-[#E8A33D] border border-[#E8A33D]/20' 
                  : 'text-[#9BA8A6] hover:bg-[#233E44]/50 hover:text-[#F2EFE9]'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <link.icon size={18} />
              {link.name}
            </div>
            {link.badge > 0 && (
              <span className="bg-[#C1443B] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {link.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[#233E44]">
        <button className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[#C1443B] hover:bg-[#C1443B]/10 rounded-lg w-full transition-colors">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
