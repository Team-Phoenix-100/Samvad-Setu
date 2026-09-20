import React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";
import SignalDot from "../../components/ui/SignalDot";
import Button from "../../components/ui/Button";
import { useAuthStore } from "../../store/authStore";
import { useToastStore } from "../../store/toastStore";

const loginSchema = z.object({
  identifier: z.string().min(3, "Identifier must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  
  const { login, isLoading, error } = useAuthStore();
  const { showToast } = useToastStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = async (data) => {
    const success = await login(data.identifier, data.password);

    if (success) {
      showToast("Successfully signed in! Redirecting...", "success");
      const userRole = useAuthStore.getState().user?.role;
      
      if (returnTo) {
        navigate(returnTo);
      } else if (userRole === "hei" || userRole === "hei_admin") {
        navigate("/hei/dashboard");
      } else if (userRole === "industry_csr" || userRole === "industry_admin") {
        navigate("/industry/dashboard");
      } else if (userRole === "government_admin" || userRole === "govt_admin" || userRole === "platform_admin") {
        navigate("/admin/analytics");
      } else {
        navigate("/citizen/dashboard");
      }
    } else {
      const errorMessage = useAuthStore.getState().error || "Invalid credentials. Please try again.";
      showToast(errorMessage, "error");
    }
  };

  return (
    <div className="bg-base text-primary-custom min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px] card-premium elevate-lg p-6 sm:p-8 relative overflow-hidden"
      >
        {/* Decorative Background Element */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2F9E8F] via-[#E8A33D] to-[#C1443B]" />

        <div className="space-y-3 text-center mb-8">
          <div className="flex justify-center mb-4">
             <div className="w-12 h-12 bg-surface-raised rounded-2xl flex items-center justify-center border border-[#E8A33D]/20 shadow-[0_0_15px_rgba(232,163,61,0.15)] relative">
               <SignalDot status="unresolved" size="lg" />
             </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-primary-custom">Welcome Back</h1>
          <p className="text-sm text-muted-custom leading-relaxed">
            Enter your credentials to access your dashboard. Your role is securely auto-detected.
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            className="mb-6 p-3 bg-[#C1443B]/10 border border-[#C1443B]/30 rounded-lg text-accent-urgent text-sm text-center font-medium"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-muted-custom uppercase tracking-wider">
              Email or Phone
            </label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-custom group-focus-within:text-accent-primary transition-colors" size={18} />
              <input
                {...register("identifier")}
                type="text"
                placeholder="citizen@mail.com or +91 9876543210"
                className={`w-full bg-base border ${errors.identifier ? 'border-[#C1443B]' : 'border-surface-raised'} rounded-xl py-3 pl-11 pr-4 text-sm text-primary-custom focus:outline-none focus:border-[#E8A33D] focus:ring-1 focus:ring-[#E8A33D] transition-all`}
              />
            </div>
            {errors.identifier && <p className="text-xs text-accent-urgent mt-1 font-medium">{errors.identifier.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold text-muted-custom uppercase tracking-wider">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-custom group-focus-within:text-accent-primary transition-colors" size={18} />
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className={`w-full bg-base border ${errors.password ? 'border-[#C1443B]' : 'border-surface-raised'} rounded-xl py-3 pl-11 pr-4 text-sm text-primary-custom focus:outline-none focus:border-[#E8A33D] focus:ring-1 focus:ring-[#E8A33D] transition-all`}
              />
            </div>
            {errors.password && <p className="text-xs text-accent-urgent mt-1 font-medium">{errors.password.message}</p>}
          </div>

          <Button
            variant="primary"
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 mt-2 font-bold text-sm rounded-xl shadow-[0_0_20px_rgba(232,163,61,0.15)] group relative overflow-hidden"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Authenticating...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2 group-hover:gap-3 transition-all">
                Login <ArrowRight size={18} />
              </span>
            )}
          </Button>
        </form>

        <div className="my-8 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-surface-raised"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-surface px-4 text-muted-custom font-mono">OR CONTINUE WITH</span>
          </div>
        </div>

        <button
          type="button"
          className="w-full bg-surface-raised/50 hover:bg-surface-raised text-primary-custom border border-[#2F9E8F]/30 hover:border-[#2F9E8F]/60 text-sm py-3 rounded-xl font-medium flex items-center justify-center gap-3 transition-all"
        >
          <ShieldCheck size={18} className="text-accent-secondary" />
          DigiLocker (Govt SSO)
        </button>

        <p className="text-center text-sm text-muted-custom mt-8">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-accent-primary font-bold hover:underline underline-offset-4 transition-all"
          >
            Create Account
          </Link>
        </p>
      </motion.main>
    </div>
  );
}
