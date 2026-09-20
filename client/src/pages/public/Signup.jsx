import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  GraduationCap,
  Building2,
  ShieldAlert,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import Button from "../../components/ui/Button";
import { useToastStore } from "../../store/toastStore";
import { useAuthStore } from "../../store/authStore";

// Zod validation schema
const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  pinCode: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm your password"),
  orgName: z.string().optional(),
  regId: z.string().optional(),
  consent: z.boolean().refine(val => val === true, {
    message: "You must accept the privacy notice"
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") || "citizen";
  
  const { showToast } = useToastStore();
  const { signup, isLoading, error } = useAuthStore();

  const [role, setRole] = useState(initialRole);
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "", lastName: "", email: "", phone: "",
      dateOfBirth: "", gender: "prefer-not-to-say",
      address: "", city: "", state: "Jharkhand", district: "", pinCode: "",
      password: "", confirmPassword: "",
      orgName: "", regId: "",
      consent: false,
    },
    mode: "onChange"
  });

  const onSubmit = async (data) => {
    let dbRole = role;
    if (role === "university") dbRole = "hei";
    if (role === "industry") dbRole = "industry_csr";

    const payload = {
      ...data,
      name: `${data.firstName} ${data.lastName}`.trim(),
      role: dbRole,
      institutionName: role === "university" ? data.orgName : "",
      companyName: role === "industry" ? data.orgName : "",
    };

    const success = await signup(payload);

    if (success) {
      showToast("Account created successfully! Redirecting...", "success");
      if (role === "citizen") navigate("/citizen/dashboard");
      else if (role === "university") navigate("/hei/dashboard");
      else navigate("/industry/dashboard");
    } else {
      const errorMessage = useAuthStore.getState().error || "Registration failed. Please try again.";
      showToast(errorMessage, "error");
    }
  };

  const goToNextStep = async () => {
    let fieldsToValidate = [];
    if (step === 1) fieldsToValidate = ['firstName', 'lastName', 'email', 'phone'];
    if (step === 2) {
      fieldsToValidate = ['dateOfBirth', 'address', 'city', 'district', 'pinCode', 'consent'];
      if (role !== 'citizen') fieldsToValidate.push('orgName', 'regId');
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid && step < 3) {
      setStep(current => current + 1);
    }
  };

  const goToPreviousStep = () => setStep((current) => Math.max(1, current - 1));

  const slideVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  return (
    <div className="bg-base text-primary-custom min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[520px] card-premium elevate-lg p-6 sm:p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2F9E8F] via-[#E8A33D] to-[#C1443B]" />

        <div className="space-y-2 text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-primary-custom">Create an Account</h1>
          <p className="text-sm text-muted-custom leading-relaxed">
            Create your civic profile to connect with institutions and industry.
          </p>
        </div>
        
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-3 bg-[#C1443B]/10 border border-[#C1443B]/30 rounded-lg text-accent-urgent text-sm text-center font-medium">
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-6">
          <button type="button" onClick={() => setRole("citizen")} className={`p-3 rounded-xl border text-center text-xs font-semibold flex flex-col items-center gap-2 transition-all ${role === "citizen" ? "bg-surface-raised border-[#E8A33D] text-accent-primary shadow-[0_0_15px_rgba(232,163,61,0.15)]" : "bg-base border-surface-raised text-muted-custom hover:border-surface-raised/80"}`}>
            <Users size={20} />
            Citizen
          </button>
          <button type="button" onClick={() => setRole("university")} className={`p-3 rounded-xl border text-center text-xs font-semibold flex flex-col items-center gap-2 transition-all ${role === "university" ? "bg-surface-raised border-[#2F9E8F] text-accent-secondary shadow-[0_0_15px_rgba(47,158,143,0.15)]" : "bg-base border-surface-raised text-muted-custom hover:border-surface-raised/80"}`}>
            <GraduationCap size={20} />
            University
          </button>
          <button type="button" onClick={() => setRole("industry")} className={`p-3 rounded-xl border text-center text-xs font-semibold flex flex-col items-center gap-2 transition-all ${role === "industry" ? "bg-surface-raised border-[#E8A33D] text-accent-primary shadow-[0_0_15px_rgba(232,163,61,0.15)]" : "bg-base border-surface-raised text-muted-custom hover:border-surface-raised/80"}`}>
            <Building2 size={20} />
            Industry / CSR
          </button>
        </div>

        {role !== "citizen" && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-surface-raised/50 border border-[#2F9E8F]/40 rounded-xl flex items-start gap-3 text-xs text-muted-custom">
            <ShieldAlert size={18} className="text-accent-secondary shrink-0" />
            <span className="leading-relaxed">
              Institutional accounts require verification by DHTE Administrators prior to claiming or funding projects.
            </span>
          </motion.div>
        )}

        <div className="flex items-center gap-2 mb-8">
          {["Basic details", "Location", "Security"].map((label, index) => (
            <div key={label} className="flex-1 space-y-2">
              <div className={`h-1.5 rounded-full transition-colors duration-300 ${step >= index + 1 ? "bg-[#E8A33D]" : "bg-surface-raised"}`} />
              <p className={`text-[10px] font-mono tracking-wider uppercase ${step === index + 1 ? "text-accent-primary font-bold" : "text-muted-custom"}`}>{index + 1}. {label}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.section key="step1" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold font-display text-primary-custom">Basic details</h2>
                  <p className="text-sm text-muted-custom mt-1">Tell us how we should identify and contact you.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[['firstName', 'First Name'], ['lastName', 'Last Name']].map(([key, label]) => (
                    <div className="space-y-1.5" key={key}>
                      <label className="text-xs font-mono font-semibold text-muted-custom">{label}</label>
                      <input {...register(key)} type="text" placeholder={label} className={`w-full bg-base border ${errors[key] ? 'border-[#C1443B]' : 'border-surface-raised'} rounded-xl py-3 px-4 text-sm text-primary-custom focus:outline-none focus:border-[#E8A33D] focus:ring-1 focus:ring-[#E8A33D] transition-all`} />
                      {errors[key] && <p className="text-[10px] text-accent-urgent mt-1">{errors[key].message}</p>}
                    </div>
                  ))}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[['email', 'Email Address', 'email'], ['phone', 'Phone Number', 'tel']].map(([key, label, type]) => (
                    <div className="space-y-1.5" key={key}>
                      <label className="text-xs font-mono font-semibold text-muted-custom">{label}</label>
                      <input {...register(key)} type={type} placeholder={label} className={`w-full bg-base border ${errors[key] ? 'border-[#C1443B]' : 'border-surface-raised'} rounded-xl py-3 px-4 text-sm text-primary-custom focus:outline-none focus:border-[#E8A33D] focus:ring-1 focus:ring-[#E8A33D] transition-all`} />
                      {errors[key] && <p className="text-[10px] text-accent-urgent mt-1">{errors[key].message}</p>}
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {step === 2 && (
              <motion.section key="step2" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold font-display text-primary-custom">Profile & location</h2>
                  <p className="text-sm text-muted-custom mt-1">Add your demographic and address details.</p>
                </div>
                
                {role !== "citizen" && (
                  <div className="grid sm:grid-cols-2 gap-4 bg-base/50 p-4 rounded-xl border border-surface-raised mb-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-muted-custom">Organisation Name</label>
                      <input {...register("orgName")} type="text" placeholder="e.g., BAU" className={`w-full bg-base border ${errors.orgName ? 'border-[#C1443B]' : 'border-surface-raised'} rounded-xl py-2.5 px-3 text-sm text-primary-custom focus:outline-none focus:border-[#2F9E8F] transition-all`} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-semibold text-muted-custom">Reg. Number (CIN/AISHE)</label>
                      <input {...register("regId")} type="text" placeholder="e.g., U-0205" className={`w-full bg-base border ${errors.regId ? 'border-[#C1443B]' : 'border-surface-raised'} rounded-xl py-2.5 px-3 text-sm text-primary-custom focus:outline-none focus:border-[#2F9E8F] transition-all`} />
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className="text-xs font-mono font-semibold text-muted-custom">Date of Birth</label><input {...register("dateOfBirth")} type="date" className="w-full bg-base border border-surface-raised rounded-xl py-3 px-4 text-sm text-primary-custom focus:outline-none focus:border-[#E8A33D]" /></div>
                  <div className="space-y-1.5"><label className="text-xs font-mono font-semibold text-muted-custom">Gender</label><select {...register("gender")} className="w-full bg-base border border-surface-raised rounded-xl py-3 px-4 text-sm text-primary-custom focus:outline-none focus:border-[#E8A33D]"><option value="prefer-not-to-say">Prefer not to say</option><option>Female</option><option>Male</option><option>Other</option></select></div>
                </div>

                <div className="space-y-1.5"><label className="text-xs font-mono font-semibold text-muted-custom">Address</label><textarea {...register("address")} rows="2" placeholder="House number, street, village or ward" className="w-full bg-base border border-surface-raised rounded-xl py-3 px-4 text-sm text-primary-custom focus:outline-none focus:border-[#E8A33D]" /></div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[['city', 'City'], ['district', 'District'], ['state', 'State'], ['pinCode', 'PIN Code']].map(([key, label]) => <div className="space-y-1.5 sm:col-span-1 col-span-2" key={key}><label className="text-xs font-mono font-semibold text-muted-custom">{label}</label><input {...register(key)} type="text" placeholder={label} className="w-full bg-base border border-surface-raised rounded-xl py-3 px-3 text-sm text-primary-custom focus:outline-none focus:border-[#E8A33D]" /></div>)}
                </div>

                <div className="flex items-start gap-3 p-4 bg-base rounded-xl border border-surface-raised mt-2">
                  <div className="relative flex items-start pt-0.5">
                    <input {...register("consent")} type="checkbox" id="consent" className="w-4 h-4 rounded border-surface-raised bg-transparent accent-[#E8A33D]" />
                  </div>
                  <label htmlFor="consent" className="text-xs text-muted-custom leading-relaxed cursor-pointer">
                    We'll use your submission to route civic issues. We never sell your data (DPDP Act Compliant).
                    {errors.consent && <span className="block text-accent-urgent mt-1 font-medium">{errors.consent.message}</span>}
                  </label>
                </div>
              </motion.section>
            )}

            {step === 3 && (
              <motion.section key="step3" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold font-display text-primary-custom">Secure your account</h2>
                  <p className="text-sm text-muted-custom mt-1">Create a strong password to finish registration.</p>
                </div>
                <div className="space-y-4">
                  {[['password', 'Create Password'], ['confirmPassword', 'Confirm Password']].map(([key, label]) => (
                    <div className="space-y-1.5" key={key}>
                      <label className="text-xs font-mono font-semibold text-muted-custom">{label}</label>
                      <input {...register(key)} type="password" placeholder={label} className={`w-full bg-base border ${errors[key] ? 'border-[#C1443B]' : 'border-surface-raised'} rounded-xl py-3 px-4 text-sm text-primary-custom focus:outline-none focus:border-[#E8A33D] focus:ring-1 focus:ring-[#E8A33D] transition-all`} />
                      {errors[key] && <p className="text-[10px] text-accent-urgent mt-1">{errors[key].message}</p>}
                    </div>
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          <div className="pt-6 flex gap-3">
            {step > 1 && (
              <Button type="button" variant="outline" className="py-3 px-4 rounded-xl border-surface-raised hover:bg-surface-raised/50" onClick={goToPreviousStep}>
                <ArrowLeft size={18} />
              </Button>
            )}
            
            {step < 3 ? (
              <Button type="button" variant="primary" className="flex-1 py-3.5 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(232,163,61,0.1)] group" onClick={goToNextStep}>
                <span className="flex items-center justify-center gap-2 group-hover:gap-3 transition-all">
                  Continue <ArrowRight size={18} />
                </span>
              </Button>
            ) : (
              <Button type="submit" variant="primary" disabled={isLoading} className="flex-1 py-3.5 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(232,163,61,0.15)] group relative overflow-hidden">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2 group-hover:gap-3 transition-all">
                    Complete Registration <ArrowRight size={18} />
                  </span>
                )}
              </Button>
            )}
          </div>
        </form>

        <p className="text-center text-sm text-muted-custom mt-8">
          Already registered?{" "}
          <Link to="/login" className="text-accent-primary font-bold hover:underline underline-offset-4 transition-all">
            Sign In
          </Link>
        </p>
      </motion.main>
    </div>
  );
}
