import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Filter } from 'lucide-react';
import { useGovModerationStore } from '../../store/govModerationStore';

export default function ModerationQueue() {
  const { queue, totalCount, loading, fetchQueue, clearUnread } = useGovModerationStore();

  useEffect(() => {
    fetchQueue();
    clearUnread();
  }, [fetchQueue, clearUnread]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2">
            <AlertTriangle className="text-[#E8A33D]" /> Moderation Queue
          </h1>
          <p className="text-[#9BA8A6] text-sm mt-1">{totalCount} items awaiting review</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#16272B] border border-[#233E44] rounded-lg text-sm hover:bg-[#233E44] transition-colors">
          <Filter size={16} /> Filters
        </button>
      </div>

      <div className="bg-[#16272B] rounded-xl border border-[#233E44] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0F1B1E] text-[#9BA8A6] border-b border-[#233E44]">
            <tr>
              <th className="p-4 font-medium">Issue Title</th>
              <th className="p-4 font-medium">AI Category</th>
              <th className="p-4 font-medium">Confidence</th>
              <th className="p-4 font-medium">Reason</th>
              <th className="p-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#233E44]">
            {loading ? (
              <tr><td colSpan="5" className="p-8 text-center text-[#9BA8A6]">Loading queue...</td></tr>
            ) : queue.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-[#9BA8A6]">Queue is empty.</td></tr>
            ) : queue.map((prob) => (
              <tr key={prob.id} className="hover:bg-[#233E44]/30 transition-colors">
                <td className="p-4 font-medium">{prob.title}</td>
                <td className="p-4">{prob.aiMetadata?.category}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                    (prob.aiMetadata?.confidence || 0) < 0.5 ? 'bg-[#C1443B]/20 text-[#C1443B]' : 'bg-[#E8A33D]/20 text-[#E8A33D]'
                  }`}>
                    {Math.round((prob.aiMetadata?.confidence || 0) * 100)}%
                  </span>
                </td>
                <td className="p-4 text-xs font-mono text-[#9BA8A6]">{prob.aiMetadata?.flagReason}</td>
                <td className="p-4">
                  <Link to={`/government/moderation/${prob.id}`} className="text-[#2F9E8F] hover:text-[#E8A33D] font-medium text-sm transition-colors">
                    Review →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
