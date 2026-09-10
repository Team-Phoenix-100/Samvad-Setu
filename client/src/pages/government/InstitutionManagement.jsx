import React, { useEffect } from 'react';
import { Building2, Check, X } from 'lucide-react';
import { useGovInstitutionStore } from '../../store/govInstitutionStore';
import { useToastStore } from '../../store/toastStore';

export default function InstitutionManagement() {
  const { institutions, loading, fetchInstitutions, verifyItem } = useGovInstitutionStore();
  const { showToast } = useToastStore();

  useEffect(() => {
    fetchInstitutions();
  }, [fetchInstitutions]);

  const handleVerify = async (id, approved) => {
    try {
      await verifyItem(id, approved, approved ? '' : 'Does not meet criteria');
      showToast(`Institution ${approved ? 'verified' : 'rejected'}`, 'success');
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-display flex items-center gap-2">
        <Building2 className="text-[#2F9E8F]" /> Institution Registry
      </h1>

      <div className="bg-[#16272B] rounded-xl border border-[#233E44] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0F1B1E] text-[#9BA8A6] border-b border-[#233E44]">
            <tr>
              <th className="p-4 font-medium">Institution Name</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Reg. Number</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#233E44]">
            {loading ? (
              <tr><td colSpan="5" className="p-8 text-center text-[#9BA8A6]">Loading registry...</td></tr>
            ) : institutions.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-[#9BA8A6]">No institutions found.</td></tr>
            ) : institutions.map((inst) => (
              <tr key={inst.id} className="hover:bg-[#233E44]/30 transition-colors">
                <td className="p-4 font-bold text-white">{inst.name}</td>
                <td className="p-4">{inst.type}</td>
                <td className="p-4 font-mono text-xs">{inst.registrationNumber}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    inst.verificationStatus === 'active' ? 'bg-[#2F9E8F]/20 text-[#2F9E8F]' :
                    inst.verificationStatus === 'pending_verification' ? 'bg-[#E8A33D]/20 text-[#E8A33D]' :
                    'bg-[#C1443B]/20 text-[#C1443B]'
                  }`}>
                    {inst.verificationStatus.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  {inst.verificationStatus === 'pending_verification' && (
                    <>
                      <button onClick={() => handleVerify(inst.id, true)} className="p-1.5 bg-[#2F9E8F]/20 text-[#2F9E8F] rounded hover:bg-[#2F9E8F] hover:text-[#0F1B1E] transition">
                        <Check size={16} />
                      </button>
                      <button onClick={() => handleVerify(inst.id, false)} className="p-1.5 bg-[#C1443B]/20 text-[#C1443B] rounded hover:bg-[#C1443B] hover:text-white transition">
                        <X size={16} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
