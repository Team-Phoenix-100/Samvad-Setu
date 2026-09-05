import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";
import SignalDot from "../../components/ui/SignalDot";
import Button from "../../components/ui/Button";
import { useAuthStore } from "../../store/authStore";
import { useToastStore } from "../../store/toastStore";

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();
  const [formData, setFormData] = useState({ identifier: "", password: "" });

  const { showToast } = useToastStore();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Send credentials to Express backend via authStore
    const success = await login(formData.identifier, formData.password);

    if (success) {
      showToast("Successfully signed in! Redirecting...", "success");

      // 2. Fetch the verified role returned by the server from state
      const userRole = useAuthStore.getState().user?.role;

      // 3. Route user to their corresponding role dashboard
      if (userRole === "hei" || userRole === "hei_admin") {
        navigate("/hei/dashboard");
      } else if (userRole === "industry_csr" || userRole === "industry_admin") {
        navigate("/industry/dashboard");
      } else if (userRole === "government_admin" || userRole === "govt_admin") {
        navigate("/admin/analytics");
      } else {
        navigate("/citizen/dashboard");
      }
    } else {
      // 4. Display server error message in toast
      const errorMessage =
        useAuthStore.getState().error ||
        "Invalid credentials. Please try again.";
      showToast(errorMessage, "error");
    }
  };

  return (
    <div className="bg-[#0F1B1E] text-[#F2EFE9] flex flex-col items-center justify-center py-12 px-6 flex-1">

      <main className="max-w-md mx-auto w-full bg-[#16262A] p-8 rounded-xl border border-[#1D3238] space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold font-display">Welcome Back</h1>
          <p className="text-xs text-[#9BA8A6]">
            Enter your credentials to access your dashboard. Role is
            auto-detected on sign-in.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono text-[#9BA8A6]">
              Email or Phone Number
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-3 text-[#9BA8A6]"
                size={18}
              />
              <input
                type="text"
                required
                placeholder="citizen@mail.com or +91 9876543210"
                value={formData.identifier}
                onChange={(e) =>
                  setFormData({ ...formData, identifier: e.target.value })
                }
                className="w-full bg-[#0F1B1E] border border-[#1D3238] rounded-lg py-2.5 pl-10 pr-4 text-sm text-[#F2EFE9] focus:outline-none focus:border-[#E8A33D]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-[#9BA8A6]">Password</label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-3 text-[#9BA8A6]"
                size={18}
              />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full bg-[#0F1B1E] border border-[#1D3238] rounded-lg py-2.5 pl-10 pr-4 text-sm text-[#F2EFE9] focus:outline-none focus:border-[#E8A33D]"
              />
            </div>
          </div>

          <Button
            variant="primary"
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 disabled:opacity-50"
          >
            {isLoading ? (
              "Authenticating..."
            ) : (
              <>
                Sign In <ArrowRight size={16} />
              </>
            )}
          </Button>
        </form>

        {/* Government SSO Placeholder (Section 3.2) */}
        <div className="pt-4 border-t border-[#1D3238] space-y-3">
          <button
            type="button"
            className="w-full bg-[#1D3238] hover:bg-[#28434a] text-[#F2EFE9] border border-[#2F9E8F]/30 text-xs py-2.5 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <ShieldCheck size={16} className="text-[#2F9E8F]" />
            Sign in with DigiLocker (Government SSO)
          </button>
        </div>

        <p className="text-center text-xs text-[#9BA8A6]">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-[#E8A33D] font-semibold hover:underline"
          >
            Create Account
          </Link>
        </p>
      </main>

    </div>
  );
}
