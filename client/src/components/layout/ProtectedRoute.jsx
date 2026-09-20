import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, token, fetchProfile } = useAuthStore();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token && !user) {
        await fetchProfile();
      }
      setIsVerifying(false);
    };
    verifyUser();
  }, [token, user, fetchProfile]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <Loader2 className="animate-spin text-accent-primary" size={48} />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on their actual role if they try to access an unauthorized route
    if (user.role === "hei" || user.role === "hei_admin") return <Navigate to="/hei/dashboard" replace />;
    if (user.role === "industry_csr" || user.role === "industry_admin") return <Navigate to="/industry/dashboard" replace />;
    if (user.role === "government_admin" || user.role === "admin" || user.role === "govt_admin" || user.role === "platform_admin") return <Navigate to="/admin/analytics" replace />;
    return <Navigate to="/citizen/dashboard" replace />;
  }

  return <Outlet />;
}
