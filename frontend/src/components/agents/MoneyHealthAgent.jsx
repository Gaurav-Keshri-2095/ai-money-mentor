import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

const MoneyHealthAgent = ({ data, score, verdict }) => {
  const safeScore = Number.isFinite(score) ? score : 0;
  // Animated score gauge
  const circumference = 2 * Math.PI * 54;
  const strokeDash = (safeScore / 100) * circumference;
  const scoreColor = safeScore >= 80 ? '#22c55e' : safeScore >= 60 ? '#f59e0b' : '#ef4444';
  const severityStyles = {
    critical: { bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle, iconColor: 'text-red-500', badge: 'bg-red-600' },
    warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: AlertTriangle, iconColor: 'text-yellow-500', badge: 'bg-yellow-500' },
    success: { bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle, iconColor: 'text-green-500', badge: 'bg-green-600' },
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#013366] to-[#01508a] px-6 py-4 flex items-center gap-3">
        <ShieldCheck size={20} className="text-green-400" />
        <h3 className="text-white font-bold text-sm uppercase tracking-wider">💊 Money Health Agent</h3>
      </div>

      <div className="p-6">
        {/* Score + Breakdown */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
          {/* Circular Gauge */}
          <div className="relative flex-shrink-0">
            <svg width="140" height="140" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="54" fill="none"
                stroke={scoreColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - strokeDash}
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black" style={{ color: scoreColor }}>{score}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">/100</span>
            </div>
          </div>

          {/* Score Breakdown Bars */}
          <div className="flex-1 w-full space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Score Breakdown</p>
            {data?.breakdown?.map((item) => (
              <div key={item.label || Math.random()}>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span style={{ color: item.color }}>{item.score || 0}/{item.max || 100}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full transition-all duration-1000"
                    style={{ width: `${((item.score || 0) / (item.max || 100)) * 100}%`, backgroundColor: item.color || '#ccc' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Fund Status */}
        <div className={`p-4 rounded-xl border mb-6 ${(data?.emergencyMonths || 0) >= 6 ? 'bg-green-50 border-green-200' : (data?.emergencyMonths || 0) >= 3 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-gray-500">Emergency Fund</span>
            <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full text-white ${(data?.emergencyMonths || 0) >= 6 ? 'bg-green-500' : (data?.emergencyMonths || 0) >= 3 ? 'bg-yellow-500' : 'bg-red-500'}`}>
              {data?.emergencyMonths || 0} months
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.min(((data?.emergencyMonths || 0) / 6) * 100, 100)}%`,
                backgroundColor: (data?.emergencyMonths || 0) >= 6 ? '#22c55e' : (data?.emergencyMonths || 0) >= 3 ? '#f59e0b' : '#ef4444',
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-semibold text-gray-400 mt-1">
            <span>₹{((data?.savings || 0) / 1000).toFixed(0)}K saved</span>
            <span>Target: ₹{((data?.emergencyTarget || 0) / 1000).toFixed(0)}K (3 months)</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Savings Rate</p>
            <p className={`text-xl font-black ${(data?.savingsRate || 0) >= 20 ? 'text-green-600' : 'text-yellow-600'}`}>{data?.savingsRate || 0}%</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Debt Ratio</p>
            <p className={`text-xl font-black ${(data?.debtToIncome || 0) <= 30 ? 'text-green-600' : 'text-yellow-600'}`}>{data?.debtToIncome || 0}%</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Goal Progress</p>
            <p className={`text-xl font-black ${(data?.goalProgress || 0) >= 50 ? 'text-green-600' : 'text-blue-600'}`}>{data?.goalProgress || 0}%</p>
          </div>
        </div>

        {/* Action Cards */}
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Recommendations</p>
        <div className="space-y-3">
          {data?.actions?.map((a, i) => {
            const style = severityStyles[a.severity] || severityStyles.warning;
            const Icon = style.icon;
            return (
              <div key={i} className={`${style.bg} border ${style.border} rounded-xl p-4`}>
                <div className="flex items-start gap-3">
                  <Icon size={18} className={`${style.iconColor} shrink-0 mt-0.5`} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-gray-800">{a.title}</span>
                      <span className={`text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full uppercase ${style.badge}`}>
                        {a.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{a.description}</p>
                    <div className="flex items-start gap-1.5 bg-white/60 rounded-lg p-2.5 border border-gray-100">
                      <ArrowRight size={12} className="text-[#013366] shrink-0 mt-0.5" />
                      <p className="text-xs font-semibold text-[#013366]">{a.action}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MoneyHealthAgent;
