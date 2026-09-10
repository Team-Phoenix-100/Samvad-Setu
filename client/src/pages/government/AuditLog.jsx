import React, { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import * as govApi from '../../api/govApi';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    govApi.getAuditLogs({ limit: 50 }).then(data => {
      setLogs(data.logs);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-display flex items-center gap-2">
        <ClipboardList className="text-[#9BA8A6]" /> Government Audit Log
      </h1>

      <div className="bg-[#16272B] rounded-xl border border-[#233E44] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0F1B1E] text-[#9BA8A6] border-b border-[#233E44]">
            <tr>
              <th className="p-4 font-medium">Timestamp</th>
              <th className="p-4 font-medium">Actor</th>
              <th className="p-4 font-medium">Action</th>
              <th className="p-4 font-medium">Target</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#233E44]">
            {loading ? (
              <tr><td colSpan="4" className="p-8 text-center text-[#9BA8A6]">Loading audit logs...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-[#9BA8A6]">No audit logs available.</td></tr>
            ) : logs.map((log) => (
              <tr key={log._id} className="hover:bg-[#233E44]/30 transition-colors">
                <td className="p-4 font-mono text-xs text-[#9BA8A6]">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="p-4 text-[#F2EFE9]">{log.actor?.name || 'Unknown'}</td>
                <td className="p-4 text-[#E8A33D] font-mono text-xs">{log.action}</td>
                <td className="p-4 text-[#2F9E8F] font-mono text-xs">{log.targetEntity}: {log.targetId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
