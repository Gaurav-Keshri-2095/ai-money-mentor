import React, { useState } from 'react';
import { Rocket, TrendingUp, ArrowRight, Newspaper } from 'lucide-react';

const fmt = (n) => '₹' + (n || 0).toLocaleString('en-IN');
const fmtCr = (n) => {
  if (!n) return '₹0';
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(1) + ' Cr';
  if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + ' L';
  return fmt(n);
};

const FIREPlannerAgent = ({ data }) => {
  if (!data) return null;
  const initialStepUp = data.optimizedTrajectory?.stepUp || 10;
  const [stepUp, setStepUp] = useState(initialStepUp);

  const currentAge = data.currentAge || 25;
  const hitAge = data.currentTrajectory?.hitAge || 60;
  const probability = data.currentTrajectory?.probability || 50;

  // Simple projection: adjust hitAge based on stepUp %
  const baseYears = Math.max(hitAge - currentAge, 1);
  const optimizedYears = Math.max(
    Math.round(baseYears * (1 - (stepUp / 100) * 0.8)),
    Math.round(baseYears * 0.55)
  );
  const projectedAge = Math.min(Math.max(currentAge + optimizedYears, currentAge), 100);
  const projectedProb = Math.min(50 + stepUp * 3, 95);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#dc2626] to-[#f97316] px-6 py-4 flex items-center gap-3">
        <Rocket size={20} className="text-yellow-300" />
        <h3 className="text-white font-bold text-sm uppercase tracking-wider">🚀 FIRE Planner Agent</h3>
      </div>

      <div className="p-6">
        {/* Target Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Current Age</p>
            <p className="text-xl font-black text-gray-800">{currentAge}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Monthly SIP</p>
            <p className="text-xl font-black text-gray-800">{fmt(data.monthlySIP)}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Current Corpus</p>
            <p className="text-xl font-black text-gray-800">{fmtCr(data.currentCorpus)}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Target Corpus</p>
            <p className="text-xl font-black text-[#013366]">{fmtCr(data.targetCorpus)}</p>
          </div>
        </div>

        {/* Trajectory Comparison */}
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Trajectory Analysis</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Current */}
          <div className="border-2 border-gray-200 rounded-xl p-5 bg-gray-50/50">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Current Trajectory</p>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-5xl font-black text-gray-700">{hitAge}</span>
              <span className="text-sm font-bold text-gray-500 mb-2">years old</span>
            </div>
            {/* Progress bar to target */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div
                className="h-3 rounded-full bg-gray-400 transition-all duration-1000"
                style={{ width: `${probability}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 font-semibold">{probability}% probability of hitting target</p>
          </div>

          {/* Optimized */}
          <div className="border-2 border-green-300 rounded-xl p-5 bg-green-50/50 relative">
            <span className="absolute -top-2 right-3 text-[9px] font-bold text-white bg-green-600 px-2 py-0.5 rounded-full uppercase">Optimized</span>
            <p className="text-[10px] font-bold text-green-600 uppercase mb-2">With {stepUp}% Annual Step-Up</p>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-5xl font-black text-green-700">{projectedAge}</span>
              <span className="text-sm font-bold text-green-600 mb-2">years old</span>
            </div>
            {/* Progress bar to target */}
            <div className="w-full bg-green-200 rounded-full h-3 mb-2">
              <div
                className="h-3 rounded-full bg-green-500 transition-all duration-500"
                style={{ width: `${projectedProb}%` }}
              />
            </div>
            <p className="text-xs text-green-600 font-semibold">{projectedProb}% probability of hitting target</p>
          </div>
        </div>

        {/* Interactive Step-Up Slider */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">🎛️ Adjust SIP Step-Up Rate</p>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={stepUp}
              onChange={(e) => setStepUp(Number(e.target.value))}
              className="flex-1 accent-[#013366] h-2 cursor-pointer"
            />
            <span className="text-2xl font-black text-[#013366] min-w-[60px] text-center">{stepUp}%</span>
          </div>
          <p className="text-[10px] text-blue-600 font-semibold mt-2">
            Matching your expected salary increments for inflation-adjusted growth
          </p>
        </div>

        {/* Milestone Timeline */}
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">FIRE Milestones</p>
        <div className="relative mb-6">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
          {[
            { age: currentAge, label: 'Start', value: fmtCr(data.currentCorpus), color: 'bg-blue-500' },
            { age: currentAge + Math.round((projectedAge - currentAge) * 0.33), label: '1/3 to FIRE', value: fmtCr((data.targetCorpus || 0) * 0.33), color: 'bg-yellow-500' },
            { age: currentAge + Math.round((projectedAge - currentAge) * 0.66), label: '2/3 to FIRE', value: fmtCr((data.targetCorpus || 0) * 0.66), color: 'bg-orange-500' },
            { age: projectedAge, label: '🔥 FIRE!', value: fmtCr(data.targetCorpus), color: 'bg-green-500' },
          ].map((m, i) => (
            <div key={i} className="flex items-center gap-4 mb-4 relative">
              <div className={`w-8 h-8 ${m.color} rounded-full flex items-center justify-center text-white text-xs font-black z-10 shrink-0`}>
                {m.age}
              </div>
              <div className="bg-gray-50 rounded-lg px-4 py-2 border border-gray-100 flex-1">
                <p className="text-xs font-bold text-gray-800">{m.label}</p>
                <p className="text-[10px] text-gray-500 font-semibold">{m.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* News Impact (if available) */}
        {data.newsImpact && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Newspaper size={16} className="text-indigo-500" />
              <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">📰 Market Context</p>
            </div>
            <p className="text-sm font-bold text-gray-800 mb-2">{data.newsImpact.headline}</p>
            <div className="flex items-start gap-1.5 bg-white/60 rounded-lg p-2.5 border border-indigo-100">
              <ArrowRight size={12} className="text-indigo-700 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-indigo-700">{data.newsImpact.relevance}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FIREPlannerAgent;
