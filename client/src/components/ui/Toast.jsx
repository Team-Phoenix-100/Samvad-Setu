import React from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { useToastStore } from "../../store/toastStore";

export default function Toast() {
  const { toast, hideToast } = useToastStore();

  if (!toast) return null;

  const isSuccess = toast.type === "success";

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4 transition-all duration-300 ease-out animate-in fade-in slide-in-from-top-4">
      <div
        className={`flex items-center justify-between p-4 rounded-xl border backdrop-blur-md shadow-2xl ${
          isSuccess
            ? "bg-[#16262A]/95 border-[#2F9E8F]/40 text-[#F2EFE9]"
            : "bg-[#16262A]/95 border-red-500/40 text-[#F2EFE9]"
        }`}
      >
        <div className="flex items-center gap-3">
          {isSuccess ? (
            <CheckCircle2 size={20} className="text-[#2F9E8F] shrink-0" />
          ) : (
            <AlertCircle size={20} className="text-red-400 shrink-0" />
          )}
          <span className="text-sm font-medium leading-tight">
            {toast.message}
          </span>
        </div>

        <button
          onClick={hideToast}
          className="p-1 text-[#9BA8A6] hover:text-[#F2EFE9] transition-colors rounded-lg"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
