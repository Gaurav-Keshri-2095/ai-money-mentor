import React from 'react';
import { Search, AlertTriangle, ArrowRight, ArrowRightLeft } from 'lucide-react';

const fmt = (n) => '₹' + (n || 0).toLocaleString('en-IN');

const PortfolioXRayAgent = ({ data }) => {
  if (!data) return null;
  const funds = data.funds || [];
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0891b2] to-[#06b6d4] px-6 py-4 flex items-center gap-3">
        <Search size={20} className="text-yellow-300" />
        <h3 className="text-white font-bold text-sm uppercase tracking-wider">🔎 MF Portfolio X-Ray Agent</h3>
      </div>

      <div className="p-6">
        {/* Fund Holdings Table */}
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Your Fund Holdings</p>
        <div className="border border-gray-100 rounded-xl overflow-hidden mb-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase text-gray-500">Fund Name</th>
                <th className="px-3 py-2.5 text-center text-[10px] font-bold uppercase text-gray-500">Plan</th>
                <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase text-gray-500">AUM</th>
                <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase text-gray-500">TER</th>
                <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase text-gray-500">Direct TER</th>
                <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase text-gray-500">10yr Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {funds.map((f, i) => (
                <tr key={i} className={`hover:bg-gray-50 ${f.terDiff > 0 ? 'bg-red-50/40' : ''}`}>
                  <td className="px-3 py-2.5">
                    <p className="font-bold text-gray-800 text-xs">{f.name}</p>
                    <p className="text-[10px] text-gray-400">{f.category}</p>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${f.plan === 'Direct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {f.plan}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold text-gray-700 text-xs">{fmt(f.aum)}</td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`font-bold text-xs ${f.terDiff > 0 ? 'text-red-600' : 'text-green-600'}`}>{f.ter}%</span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold text-xs text-green-600">{f.directTer}%</td>
                  <td className="px-3 py-2.5 text-right">
                    {f.tenYearLoss > 0 ? (
                      <span className="text-xs font-bold text-red-600">-{fmt(f.tenYearLoss)}</span>
                    ) : (
                      <span className="text-xs font-bold text-green-600">✓ Optimal</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TER Impact Visualization */}
        {funds.some(f => f.terDiff > 0) && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
            <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-3">💸 Expense Ratio Impact</p>
            {funds.filter(f => f.terDiff > 0).map((f, i) => (
              <div key={i} className="mb-3 last:mb-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-gray-700">{f.name}</span>
                      <span className="text-xs font-bold text-red-600">{f.ter}% → {f.directTer}%</span>
                    </div>
                    <div className="flex gap-1 items-center">
                      <div className="flex-1 bg-red-200 rounded-full h-2.5">
                        <div className="h-2.5 rounded-full bg-red-500" style={{ width: `${(f.ter / 2) * 100}%` }} />
                      </div>
                      <ArrowRightLeft size={12} className="text-gray-400" />
                      <div className="flex-1 bg-green-200 rounded-full h-2.5">
                        <div className="h-2.5 rounded-full bg-green-500" style={{ width: `${(f.directTer / 2) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-red-700 font-semibold">
                  10-year loss: <span className="font-black">{fmt(f.tenYearLoss)}</span> in compounding
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Overlap Analysis */}
        {data.overlapAnalysis && (
          <>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">📊 Fund Overlap Analysis</p>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-gray-800">{data.overlapAnalysis.fund1} ↔ {data.overlapAnalysis.fund2}</p>
                  <p className="text-[10px] text-gray-500 font-semibold">Stock-level overlap detection</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black text-orange-600">{data.overlapAnalysis.overlapPercent}%</p>
                  <p className="text-[9px] font-bold text-orange-500 uppercase">Overlap</p>
                </div>
              </div>

              {/* Overlap Bar */}
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
                <div
                  className="h-4 rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-end pr-2 transition-all duration-1000"
                  style={{ width: `${data.overlapAnalysis.overlapPercent}%` }}
                >
                  <span className="text-[9px] font-bold text-white">{data.overlapAnalysis.overlapPercent}%</span>
                </div>
              </div>

              {/* Top Overlapping Stocks */}
              <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Top Overlapping Stocks</p>
              <div className="grid grid-cols-2 gap-2">
                {data.overlapAnalysis.overlappingStocks?.map((s, i) => (
                  <div key={i} className="bg-white rounded-lg p-2 border border-orange-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700">{s.name}</span>
                    <div className="flex gap-1.5">
                      <span className="text-[10px] font-semibold text-orange-600">{s.weight1}%</span>
                      <span className="text-[10px] text-gray-300">|</span>
                      <span className="text-[10px] font-semibold text-orange-600">{s.weight2}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Secondary overlap */}
            {data.overlapAnalysis.secondOverlap && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                <AlertTriangle size={16} className="text-yellow-500 shrink-0" />
                <p className="text-xs text-yellow-800 font-semibold">
                  Secondary overlap: <span className="font-bold">{data.overlapAnalysis.secondOverlap.fund1}</span> and <span className="font-bold">{data.overlapAnalysis.secondOverlap.fund2}</span> show <span className="font-black text-yellow-900">{data.overlapAnalysis.secondOverlap.overlapPercent}%</span> overlap.
                </p>
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Recommended Actions</p>
        <div className="space-y-3">
          {data.actions?.map((a, i) => (
            <div key={i} className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={16} className="text-cyan-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-gray-800 mb-1">{a.title}</p>
                  <p className="text-xs text-gray-600 mb-1">{a.description}</p>
                  {a.impact && (
                    <p className="text-xs text-red-600 font-semibold mb-2">Impact: {a.impact}</p>
                  )}
                  <div className="flex items-start gap-1.5 bg-white/60 rounded-lg p-2.5 border border-gray-100">
                    <ArrowRight size={12} className="text-cyan-700 shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-cyan-700">{a.action}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioXRayAgent;
