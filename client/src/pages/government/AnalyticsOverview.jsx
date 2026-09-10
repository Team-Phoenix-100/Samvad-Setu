import React, { useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, CheckCircle, Building2, Briefcase } from 'lucide-react';
import { useGovAnalyticsStore } from '../../store/govAnalyticsStore';

const COLORS = ['#E8A33D', '#2F9E8F', '#C1443B', '#4A90E2', '#9B59B6'];

export default function AnalyticsOverview() {
  const { summary, domainDistribution, districtBreakdown, fetchSummary, fetchDomainDistribution, fetchDistrictBreakdown } = useGovAnalyticsStore();

  useEffect(() => {
    fetchSummary();
    fetchDomainDistribution();
    fetchDistrictBreakdown();
  }, [fetchSummary, fetchDomainDistribution, fetchDistrictBreakdown]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-display">Statewide Analytics Dashboard</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Issues', value: summary?.totalProblems || 0, icon: Users, color: 'text-blue-400' },
          { title: 'Resolved', value: summary?.resolvedProblems || 0, icon: CheckCircle, color: 'text-[#2F9E8F]' },
          { title: 'Active HEIs', value: summary?.activeHEIs || 0, icon: Building2, color: 'text-[#E8A33D]' },
          { title: 'Industry Partners', value: summary?.activeIndustry || 0, icon: Briefcase, color: 'text-purple-400' }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-[#16272B] p-6 rounded-xl border border-[#233E44] flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-[#0F1B1E] ${kpi.color}`}>
              <kpi.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-[#9BA8A6]">{kpi.title}</p>
              <p className="text-2xl font-bold font-mono">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Distribution */}
        <div className="bg-[#16272B] p-6 rounded-xl border border-[#233E44]">
          <h2 className="text-lg font-bold mb-4">Domain Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={domainDistribution || []} dataKey="count" nameKey="domain" cx="50%" cy="50%" outerRadius={80} label>
                  {(domainDistribution || []).map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: '#0F1B1E', borderColor: '#233E44' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* District Breakdown */}
        <div className="bg-[#16272B] p-6 rounded-xl border border-[#233E44]">
          <h2 className="text-lg font-bold mb-4">District Volume</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtBreakdown || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#233E44" vertical={false} />
                <XAxis dataKey="district" stroke="#9BA8A6" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9BA8A6" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip cursor={{fill: '#233E44', opacity: 0.4}} contentStyle={{ backgroundColor: '#0F1B1E', borderColor: '#233E44' }} />
                <Bar dataKey="count" fill="#2F9E8F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
