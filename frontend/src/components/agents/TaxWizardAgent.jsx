import React from 'react';
import { Scale, TrendingDown, ArrowRight, CheckCircle } from 'lucide-react';

const fmt = (n) => '₹' + (n || 0).toLocaleString('en-IN');

const TaxWizardAgent = ({ data }) => {
  if (!data) return null;
  const used80C = data.claimed80C || 0;
  const max80C = data.max80C || 150000;
  const pct80C = Math.round((used80C / max80C) * 100) || 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#7c3aed] to-[#9333ea] px-6 py-4 flex items-center gap-3">
        <Scale size={20} className="text-yellow-300" />
        <h3 className="text-white font-bold text-sm uppercase tracking-wider">⚖️ Tax Wizard Agent</h3>
      </div>

      <div className="p-6">
        {/* Regime Comparison Table */}
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Old vs New Regime Comparison</p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Old Regime */}
          <div className={`rounded-xl p-5 border-2 ${data.recommendation === 'old' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gray-800">Old Regime</span>
              {data.recommendation === 'old' && (
                <span className="text-[9px] font-bold text-white bg-purple-600 px-2 py-0.5 rounded-full uppercase">Recommended</span>
              )}
            </div>
            <p className="text-3xl font-black text-gray-800 mb-1">{fmt(data.oldRegimeTax)}</p>
            <p className="text-[10px] text-gray-500 font-semibold">Estimated tax payable</p>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Deductions Available</p>
              <p className="text-xs text-gray-700 font-semibold">80C, 80D, HRA, 24(b)</p>
            </div>
          </div>

          {/* New Regime */}
          <div className={`rounded-xl p-5 border-2 ${data.recommendation === 'new' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gray-800">New Regime</span>
              {data.recommendation === 'new' && (
                <span className="text-[9px] font-bold text-white bg-purple-600 px-2 py-0.5 rounded-full uppercase">Recommended</span>
              )}
            </div>
            <p className="text-3xl font-black text-gray-800 mb-1">{fmt(data.newRegimeTax)}</p>
            <p className="text-[10px] text-gray-500 font-semibold">Estimated tax payable</p>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Deductions Available</p>
              <p className="text-xs text-gray-700 font-semibold">Standard Deduction only</p>
            </div>
          </div>
        </div>

        {/* Savings Highlight Card */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 mb-6 text-center">
          <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-1">💰 Potential Tax Savings</p>
          <p className="text-4xl font-black text-green-700">{fmt(data.savings)}</p>
          <p className="text-xs text-green-600 font-medium mt-1">
            {data.recommendation === 'new'
              ? 'By switching to New Tax Regime'
              : 'By maximizing deductions in Old Regime'}
          </p>
        </div>

        {/* 80C Utilization */}
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Section 80C Utilization</p>
        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-700">{fmt(used80C)} / {fmt(max80C)}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pct80C >= 80 ? 'bg-green-100 text-green-700' : pct80C >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
              {pct80C}% used
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all duration-1000"
              style={{
                width: `${pct80C}%`,
                backgroundColor: pct80C >= 80 ? '#22c55e' : pct80C >= 50 ? '#f59e0b' : '#ef4444',
              }}
            />
          </div>
          <p className="text-[10px] text-gray-500 font-semibold mt-2">
            Remaining: {fmt(data.remaining80C)} — Deploy into ELSS / PPF before March 31
          </p>
        </div>

        {/* Deductions Table */}
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Deduction Details</p>
        <div className="border border-gray-100 rounded-xl overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase text-gray-500">Section</th>
                <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase text-gray-500">Claimed</th>
                <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase text-gray-500">Limit</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase text-gray-500">Instruments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.deductions?.map((d, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-bold text-gray-800">{d.section}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-gray-700">{fmt(d.claimed)}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-gray-400">{fmt(d.limit)}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">{d.items}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Recommended Actions</p>
        <div className="space-y-3">
          {data?.actions?.map((a, i) => (
            <div key={i} className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <CheckCircle size={16} className="text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-gray-800 mb-1">{a.title}</p>
                  <p className="text-xs text-gray-600">{a.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaxWizardAgent;
