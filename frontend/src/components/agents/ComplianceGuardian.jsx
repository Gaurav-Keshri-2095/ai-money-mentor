import React from 'react';
import { Shield, AlertTriangle } from 'lucide-react';

const ComplianceGuardian = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4 flex items-center gap-3">
        <Shield size={20} className="text-yellow-300" />
        <h3 className="text-white font-bold text-sm uppercase tracking-wider">🛡️ Compliance Guardian</h3>
      </div>

      <div className="p-6">
        {/* Disclaimer Banner */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-yellow-600" />
            <p className="text-xs font-bold text-yellow-700 uppercase tracking-wider">Important Disclaimers</p>
          </div>
          <ul className="space-y-3">
            {data?.notes?.map((note, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5 shrink-0" />
                <p className="text-xs text-yellow-800 font-medium leading-relaxed">{note}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* SEBI Note */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-start gap-3">
          <Shield size={16} className="text-gray-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-gray-700 mb-1">SEBI Compliance Notice</p>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              This AI-generated financial analysis is for informational and educational purposes only. 
              It does not constitute investment advice from a SEBI-registered Investment Adviser (RIA). 
              Always consult with a qualified financial advisor before making investment decisions. 
              Past performance does not guarantee future results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceGuardian;
