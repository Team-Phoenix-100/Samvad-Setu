import React from 'react';
import { Bell } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function GovTopbar() {
  const { user } = useAuthStore();

  return (
    <header className="h-16 flex-shrink-0 bg-[#16272B] border-b border-[#233E44] flex items-center justify-between px-6 z-10 sticky top-0">
      <div className="flex items-center">
        <h2 className="text-sm font-medium text-muted-custom">Department of Higher & Technical Education</h2>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-muted-custom hover:text-primary-custom transition-colors rounded-full hover:bg-[#233E44]">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#E8A33D] rounded-full border border-[#16272B]"></span>
        </button>
        
        <div className="h-8 w-px bg-[#233E44]"></div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold text-primary-custom">{user?.name || 'DHTE Admin'}</p>
            <p className="text-[10px] font-mono text-accent-secondary uppercase tracking-wider">Government Official</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#E8A33D] flex items-center justify-center text-[#0F1B1E] font-bold font-display border-2 border-[#233E44]">
            {user?.name ? user.name.charAt(0) : 'D'}
          </div>
        </div>
      </div>
    </header>
  );
}
