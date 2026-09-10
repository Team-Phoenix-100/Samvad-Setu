import React, { useState } from 'react';
import { CheckCircle2, Download, FileCheck, LockKeyhole } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function HandoverCertification() {
  const [corporateSigned, setCorporateSigned] = useState(false);
  const [ulbSigned, setUlbSigned] = useState(false);

  const downloadCertificate = () => {
    const certificate = `MCA SECTION 135 CSR-1 IMPACT CERTIFICATE\n\nSamvad Setu Civic Commons Programme\nProject: Solar Water Pump Malfunction in Secondary School\nCorporate contributor: Tata Steel Foundation\nImplementing HEI: Birsa Institute of Technology, Sindri\nULB: Ranchi Municipal Corporation\n\nImpact: Permanent civic handover completed after field pilot.\nCSR taxonomy: MCA Schedule VII item_iv, item_ii\nTranche 3: Released after corporate and ULB sign-off.\nIssued: ${new Date().toLocaleDateString('en-IN')}`;
    const url = URL.createObjectURL(new Blob([certificate], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'samvad-setu-mca-section-135-csr-1-certificate.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const complete = corporateSigned && ulbSigned;

  return (
    <div className="min-h-screen bg-[#0F1B1E] text-[#F2EFE9] p-6 max-w-5xl mx-auto space-y-7">
      <header className="border-b border-[#1D3238] pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-[#2F9E8F] mb-2"><FileCheck size={14} /> FINAL HANDOVER & AUDIT</div>
        <h1 className="text-3xl font-bold font-display">Civic handover certification</h1>
        <p className="text-sm text-[#9BA8A6] mt-2">Complete both sign-offs to release Tranche 3 and issue the CSR impact record.</p>
      </header>
      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-[#16262A] border border-[#1D3238] rounded-xl p-6 space-y-4"><h2 className="font-bold">Corporate auditor</h2><p className="text-sm text-[#9BA8A6]">Confirm the prototype met its funded pilot milestones and public-use license terms.</p><Button variant={corporateSigned ? 'outline' : 'primary'} className="w-full" onClick={() => setCorporateSigned(true)} disabled={corporateSigned}><CheckCircle2 size={16} /> {corporateSigned ? 'Corporate sign-off complete' : 'Sign corporate audit'}</Button></div>
        <div className="bg-[#16262A] border border-[#1D3238] rounded-xl p-6 space-y-4"><h2 className="font-bold">ULB engineer</h2><p className="text-sm text-[#9BA8A6]">Confirm site clearance, field performance, and permanent civic handover.</p><Button variant={ulbSigned ? 'outline' : 'primary'} className="w-full" onClick={() => setUlbSigned(true)} disabled={ulbSigned}><CheckCircle2 size={16} /> {ulbSigned ? 'ULB sign-off complete' : 'Sign ULB handover'}</Button></div>
      </div>
      <div className="bg-[#16262A] border border-[#1D3238] rounded-xl p-6 space-y-4"><div className="flex items-center gap-2"><LockKeyhole size={18} className="text-[#E8A33D]" /><h2 className="font-bold">Escrow release</h2></div><div className="flex items-center justify-between text-sm"><span className="text-[#9BA8A6]">Tranche 3 · Final handover</span><span className={complete ? 'text-[#2F9E8F]' : 'text-[#E8A33D]'}>{complete ? 'READY TO RELEASE · 30%' : 'LOCKED · 30%'}</span></div>{complete && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1D3238] pt-4"><p className="text-sm text-[#2F9E8F] flex items-center gap-2"><CheckCircle2 size={16} /> Permanent civic handover certified.</p><Button variant="primary" onClick={downloadCertificate}><Download size={16} /> Download CSR-1 certificate</Button></div>}</div>
    </div>
  );
}
