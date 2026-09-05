import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Users,
  GraduationCap,
  Building2,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import SignalDot from "../../components/ui/SignalDot";
import Button from "../../components/ui/Button";
import { useToastStore } from "../../store/toastStore";

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role") || "citizen";
  const { showToast } = useToastStore();

  const [role, setRole] = useState(initialRole);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "prefer-not-to-say",
    address: "",
    city: "",
    state: "Jharkhand",
    district: "",
    pinCode: "",
    password: "",
    confirmPassword: "",
    orgName: "",
    regId: "",
    consent: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (role !== "citizen") {
      showToast("Institutional registration will be enabled in the next verification phase.", "success");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }
    if (!/^\d{6}$/.test(formData.pinCode)) {
      showToast("Enter a valid 6-digit PIN code.", "error");
      return;
    }

    localStorage.setItem("samvad-setu-registration-draft", JSON.stringify({
      ...formData,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      role: "citizen",
    }));
    showToast("Profile details saved. You can now sign in once backend registration is connected.", "success");
    navigate("/login");
  };

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const goToNextStep = () => {
    if (step === 1 && (!formData.firstName || !formData.lastName || !formData.email || !formData.phone)) {
      showToast("Complete your name, email, and phone number first.", "error");
      return;
    }
    if (step === 2 && (!formData.dateOfBirth || !formData.address || !formData.city || !formData.district || !formData.pinCode)) {
      showToast("Complete your date of birth and address details first.", "error");
      return;
    }
    if (step === 2 && !formData.consent) {
      showToast("Please accept the privacy notice before continuing.", "error");
      return;
    }
    if (step < 3) setStep((current) => current + 1);
  };

  const goToPreviousStep = () => setStep((current) => Math.max(1, current - 1));

  return (
    <div className="bg-[#0F1B1E] text-[#F2EFE9] flex flex-col items-center justify-center py-12 px-6 flex-1">

      <main className="max-w-lg mx-auto w-full bg-[#16262A] p-8 rounded-xl border border-[#1D3238] space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold font-display">Create an Account</h1>
          <p className="text-xs text-[#9BA8A6]">
            Create your civic profile. Registration is currently frontend-only.
          </p>
        </div>

        {/* Step 1: Role Selector Cards (Section 3.3)[cite: 1] */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setRole("citizen")}
            className={`p-3 rounded-lg border text-center text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
              role === "citizen"
                ? "bg-[#1D3238] border-[#E8A33D] text-[#E8A33D]"
                : "bg-[#0F1B1E] border-[#1D3238] text-[#9BA8A6]"
            }`}
          >
            <Users size={18} />
            Citizen
          </button>

          <button
            type="button"
            onClick={() => setRole("university")}
            className={`p-3 rounded-lg border text-center text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
              role === "university"
                ? "bg-[#1D3238] border-[#2F9E8F] text-[#2F9E8F]"
                : "bg-[#0F1B1E] border-[#1D3238] text-[#9BA8A6]"
            }`}
          >
            <GraduationCap size={18} />
            University
          </button>

          <button
            type="button"
            onClick={() => setRole("industry")}
            className={`p-3 rounded-lg border text-center text-xs font-semibold flex flex-col items-center gap-2 transition-all ${
              role === "industry"
                ? "bg-[#1D3238] border-[#E8A33D] text-[#E8A33D]"
                : "bg-[#0F1B1E] border-[#1D3238] text-[#9BA8A6]"
            }`}
          >
            <Building2 size={18} />
            Industry / CSR
          </button>
        </div>

        {/* Institutional Pending Verification Notice (Section 3.3)[cite: 1] */}
        {role !== "citizen" && (
          <div className="p-3 bg-[#1D3238] border border-[#2F9E8F]/40 rounded-lg flex items-start gap-2 text-xs text-[#9BA8A6]">
            <ShieldAlert size={16} className="text-[#2F9E8F] shrink-0 mt-0.5" />
            <span>
              Institutional accounts require verification by DHTE Administrators
              prior to claiming or funding projects[cite: 1].
            </span>
          </div>
        )}

        <div className="flex items-center gap-2" aria-label="Registration progress">
          {["Basic details", "Profile & location", "Security"].map((label, index) => (
            <div key={label} className="flex-1 space-y-1">
              <div className={`h-1.5 rounded-full ${step >= index + 1 ? "bg-[#E8A33D]" : "bg-[#1D3238]"}`} />
              <p className={`text-[10px] font-mono ${step === index + 1 ? "text-[#E8A33D]" : "text-[#9BA8A6]"}`}>{index + 1}. {label}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-bold font-display">Basic details</h2>
                <p className="text-xs text-[#9BA8A6] mt-1">Tell us how we should identify and contact you.</p>
              </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[['firstName', 'First Name'], ['lastName', 'Last Name']].map(([key, label]) => (
              <div className="space-y-1" key={key}>
                <label className="text-xs font-mono text-[#9BA8A6]">{label}</label>
                <input type="text" required placeholder={label} value={formData[key]} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} className="w-full bg-[#0F1B1E] border border-[#1D3238] rounded-lg py-2.5 px-4 text-sm text-[#F2EFE9] focus:outline-none focus:border-[#E8A33D]" />
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {[['email', 'Email Address', 'email'], ['phone', 'Phone Number', 'tel']].map(([key, label, type]) => (
              <div className="space-y-1" key={key}>
                <label className="text-xs font-mono text-[#9BA8A6]">{label}</label>
                <input type={type} required placeholder={label} value={formData[key]} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} className="w-full bg-[#0F1B1E] border border-[#1D3238] rounded-lg py-2.5 px-4 text-sm text-[#F2EFE9] focus:outline-none focus:border-[#E8A33D]" />
              </div>
            ))}
          </div>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-bold font-display">Profile & location</h2>
                <p className="text-xs text-[#9BA8A6] mt-1">Add your demographic and address details for local civic services.</p>
              </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1"><label className="text-xs font-mono text-[#9BA8A6]">Date of Birth</label><input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className="w-full bg-[#0F1B1E] border border-[#1D3238] rounded-lg py-2.5 px-4 text-sm text-[#F2EFE9]" /></div>
            <div className="space-y-1"><label className="text-xs font-mono text-[#9BA8A6]">Gender</label><select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full bg-[#0F1B1E] border border-[#1D3238] rounded-lg py-2.5 px-4 text-sm text-[#F2EFE9]"><option value="prefer-not-to-say">Prefer not to say</option><option>Female</option><option>Male</option><option>Other</option></select></div>
          </div>

          <div className="space-y-1"><label className="text-xs font-mono text-[#9BA8A6]">Address</label><textarea required rows="2" placeholder="House number, street, village or ward" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full bg-[#0F1B1E] border border-[#1D3238] rounded-lg py-2.5 px-4 text-sm text-[#F2EFE9]" /></div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[['city', 'City / Town'], ['district', 'District'], ['state', 'State'], ['pinCode', 'PIN Code']].map(([key, label]) => <div className="space-y-1" key={key}><label className="text-xs font-mono text-[#9BA8A6]">{label}</label><input type={key === 'pinCode' ? 'text' : 'text'} required value={formData[key]} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} placeholder={label} className="w-full bg-[#0F1B1E] border border-[#1D3238] rounded-lg py-2.5 px-4 text-sm text-[#F2EFE9]" /></div>)}
          </div>
            </section>
          )}

          {step === 3 && (
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-bold font-display">Secure your account</h2>
                <p className="text-xs text-[#9BA8A6] mt-1">Create a password to finish your frontend registration.</p>
              </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[['password', 'Create Password'], ['confirmPassword', 'Confirm Password']].map(([key, label]) => <div className="space-y-1" key={key}><label className="text-xs font-mono text-[#9BA8A6]">{label}</label><input type="password" required minLength="8" placeholder={label} value={formData[key]} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} className="w-full bg-[#0F1B1E] border border-[#1D3238] rounded-lg py-2.5 px-4 text-sm text-[#F2EFE9]" /></div>)}
          </div>
            </section>
          )}

          {step === 2 && role !== "citizen" && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#9BA8A6]">
                  Organisation Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Birsa Agricultural University"
                  value={formData.orgName}
                  onChange={(e) =>
                    setFormData({ ...formData, orgName: e.target.value })
                  }
                  className="w-full bg-[#0F1B1E] border border-[#1D3238] rounded-lg py-2.5 px-4 text-sm text-[#F2EFE9] focus:outline-none focus:border-[#2F9E8F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[#9BA8A6]">
                  AISHE Code / CIN / Registration Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., U-0205"
                  value={formData.regId}
                  onChange={(e) =>
                    setFormData({ ...formData, regId: e.target.value })
                  }
                  className="w-full bg-[#0F1B1E] border border-[#1D3238] rounded-lg py-2.5 px-4 text-sm text-[#F2EFE9] focus:outline-none focus:border-[#2F9E8F]"
                />
              </div>
            </>
          )}

          {step === 2 && <div className="flex items-start gap-2 pt-2">
            <input
              type="checkbox"
              id="consent"
              checked={formData.consent}
              onChange={(e) => updateField("consent", e.target.checked)}
              className="mt-1 accent-[#E8A33D]"
            />
            <label htmlFor="consent" className="text-xs text-[#9BA8A6] leading-relaxed">
              We'll use your submission and location to route your problem. We never sell your data (DPDP Act Compliant).
            </label>
          </div>}

          {step === 3 && <>
          <Button
            variant="primary"
            type="submit"
            className="w-full py-2.5"
          >
            Complete Registration <ArrowRight size={16} />
          </Button>
          </>}

          {step < 3 && (
            <Button type="button" variant="primary" className="w-full py-2.5" onClick={goToNextStep}>
              Continue to {step === 1 ? "Profile & location" : "Security"} <ArrowRight size={16} />
            </Button>
          )}

          {step > 1 && (
            <Button type="button" variant="outline" className="w-full py-2.5" onClick={goToPreviousStep}>
              Back to {step === 3 ? "Profile & location" : "Basic details"}
            </Button>
          )}
        </form>

        <p className="text-center text-xs text-[#9BA8A6]">
          Already registered?{" "}
          <Link
            to="/login"
            className="text-[#E8A33D] font-semibold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </main>

    </div>
  );
}
