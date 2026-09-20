import React, { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { User, Mail, Phone, MapPin, Building, ShieldCheck, Loader2, LogOut, Calendar, Fingerprint, Flag, Navigation, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToastStore } from '../../store/toastStore';
import Button from '../../components/ui/Button';

export default function Profile() {
  const { user, fetchProfile, isLoading, logout } = useAuthStore();
  const { showToast } = useToastStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    showToast("Successfully logged out!", "success");
    navigate('/login');
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (isLoading && !user) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 text-muted-custom">
        <Loader2 className="animate-spin text-accent-primary" size={32} />
        <p>Loading profile data...</p>
      </div>
    );
  }

  const formatDOB = (dobStr) => {
    if (!dobStr) return 'Not provided';
    const date = new Date(dobStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getFullAddress = () => {
    const parts = [user?.address, user?.city, user?.district, user?.state, user?.pinCode].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Not provided';
  };

  return (
    <div className="min-h-screen bg-base text-primary-custom p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-surface-raised pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-primary-custom">Civic Profile</h1>
          <p className="text-sm text-muted-custom mt-1">Manage your identity, demographic data, and platform preferences.</p>
        </div>
        <Button variant="primary">Edit Profile</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Trust Score Card */}
        <div className="col-span-1 space-y-6">
          <div className="bg-surface border border-surface-raised rounded-xl p-6 flex flex-col items-center text-center space-y-4 shadow-lg">
            <div className="w-24 h-24 rounded-full bg-surface-raised border-2 border-[#E8A33D] flex items-center justify-center text-3xl text-accent-primary font-bold shadow-[0_0_15px_rgba(232,163,61,0.2)]">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-primary-custom">{user?.name || 'Citizen User'}</h2>
              <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-[#2F9E8F]/10 border border-[#2F9E8F]/30 rounded-full text-accent-secondary text-xs font-mono font-bold uppercase tracking-wider">
                <ShieldCheck size={14} /> {user?.role?.replace('_', ' ') || 'Citizen'}
              </div>
            </div>
            
            <div className="w-full pt-6 mt-2 border-t border-surface-raised">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-muted-custom flex items-center gap-2"><Activity size={16}/> Civic Trust Score</span>
                <span className="text-accent-primary font-bold font-mono">842</span>
              </div>
              <div className="w-full h-1.5 bg-surface-raised rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#2F9E8F] to-[#E8A33D] w-[84%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Information */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          
          {/* Identity Block */}
          <div className="bg-surface border border-surface-raised rounded-xl overflow-hidden shadow-lg">
            <div className="bg-surface-raised/50 px-6 py-4 border-b border-surface-raised">
              <h3 className="text-sm font-bold tracking-wider text-primary-custom uppercase">Digital Identity</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="flex items-start gap-4">
                <div className="p-2 bg-surface-raised rounded-lg text-muted-custom"><User size={18} /></div>
                <div>
                  <p className="text-[10px] font-mono font-bold uppercase text-muted-custom mb-1">Full Legal Name</p>
                  <p className="text-sm font-medium text-primary-custom">{user?.name || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-surface-raised rounded-lg text-muted-custom"><Fingerprint size={18} /></div>
                <div>
                  <p className="text-[10px] font-mono font-bold uppercase text-muted-custom mb-1">Gender</p>
                  <p className="text-sm font-medium text-primary-custom capitalize">{user?.gender?.replace(/-/g, ' ') || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-surface-raised rounded-lg text-muted-custom"><Calendar size={18} /></div>
                <div>
                  <p className="text-[10px] font-mono font-bold uppercase text-muted-custom mb-1">Date of Birth</p>
                  <p className="text-sm font-medium text-primary-custom">{formatDOB(user?.dateOfBirth)}</p>
                </div>
              </div>

              {user?.role === 'hei' || user?.role === 'industry_csr' ? (
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-surface-raised rounded-lg text-muted-custom"><Building size={18} /></div>
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase text-muted-custom mb-1">Organization / Registration ID</p>
                    <p className="text-sm font-medium text-primary-custom">{user?.institutionName || user?.companyName || 'Not provided'}</p>
                    {user?.regId && <p className="text-xs text-accent-primary font-mono mt-0.5">{user.regId}</p>}
                  </div>
                </div>
              ) : null}

            </div>
          </div>

          {/* Contact & Location Block */}
          <div className="bg-surface border border-surface-raised rounded-xl overflow-hidden shadow-lg">
            <div className="bg-surface-raised/50 px-6 py-4 border-b border-surface-raised">
              <h3 className="text-sm font-bold tracking-wider text-primary-custom uppercase">Contact & Geolocation</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="flex items-start gap-4">
                <div className="p-2 bg-surface-raised rounded-lg text-muted-custom"><Mail size={18} /></div>
                <div>
                  <p className="text-[10px] font-mono font-bold uppercase text-muted-custom mb-1">Email Address</p>
                  <p className="text-sm font-medium text-primary-custom">{user?.email || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-surface-raised rounded-lg text-muted-custom"><Phone size={18} /></div>
                <div>
                  <p className="text-[10px] font-mono font-bold uppercase text-muted-custom mb-1">Phone Number</p>
                  <p className="text-sm font-medium text-primary-custom">{user?.phone || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 md:col-span-2">
                <div className="p-2 bg-surface-raised rounded-lg text-muted-custom"><MapPin size={18} /></div>
                <div className="flex-1">
                  <p className="text-[10px] font-mono font-bold uppercase text-muted-custom mb-1">Registered Address</p>
                  <p className="text-sm font-medium text-primary-custom leading-relaxed">{getFullAddress()}</p>
                </div>
              </div>

            </div>
          </div>

          {/* Security Block */}
          <div className="bg-surface border border-surface-raised rounded-xl overflow-hidden shadow-lg">
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-red-400">Terminate Session</p>
                <p className="text-xs text-muted-custom mt-1">Securely sign out of this device.</p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="text-xs border-red-900/50 text-red-400 hover:bg-red-400/10 hover:border-red-400 transition-colors flex items-center gap-2"
              >
                <LogOut size={14} />
                Logout
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
