import React, { useState } from 'react';
import { ShieldCheck, Zap, Calculator, FileText, X } from 'lucide-react';

const MyMoneyMentor = ({ onOpenDashboard }) => {
  const [showFireModal, setShowFireModal] = useState(false);
  const [fireData, setFireData] = useState({ age: 25, expenses: 50000, targetAge: 45 });
  const [result, setResult] = useState(null);

  // FIRE CALCULATION LOGIC
  const calculateFIRE = () => {
    const inflation = 0.06; // 6% average Indian inflation
    const swr = 0.035;      // 3.5% Safe Withdrawal Rate (Conservative for India)
    const yearsToRetire = fireData.targetAge - fireData.age;
    
    // Future Expenses = Current * (1 + inflation) ^ years
    const futureAnnualExp = (fireData.expenses * 12) * Math.pow(1 + inflation, yearsToRetire);
    const fireNumber = futureAnnualExp / swr;
    
    setResult({
      corpus: Math.round(fireNumber / 10000000), // In Crores
      futureMonthly: Math.round(futureAnnualExp / 12)
    });
  };

  return (
    <>
      <div className="bg-white border-none shadow-2xl overflow-hidden rounded-xl font-sans">
        <div className="bg-[#013366] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="fill-yellow-400 text-yellow-400" size={20} />
            <span className="font-black text-sm tracking-widest uppercase">AI Money Mentor</span>
          </div>
          <span className="text-[10px] bg-red-600 px-2 py-0.5 rounded font-bold">BETA</span>
        </div>
        
        <div className="p-6 space-y-4 text-[#333]">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-tighter">I can help you with:</p>
          
          <button 
            onClick={() => setShowFireModal(true)}
            className="w-full flex items-center gap-4 p-4 border-2 border-gray-100 rounded-xl hover:border-[#013366] hover:bg-blue-50 transition text-left group cursor-pointer"
          >
            <div className="bg-blue-100 p-2 rounded-lg text-[#013366] group-hover:bg-[#013366] group-hover:text-white transition">
              <Calculator size={20} />
            </div>
            <div>
              <span className="block font-bold text-sm">FIRE Path Planner</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Retire Early Roadmap</span>
            </div>
          </button>

          <button onClick={onOpenDashboard} className="w-full flex items-center gap-4 p-4 border-2 border-gray-100 rounded-xl hover:border-green-600 hover:bg-green-50 transition text-left group cursor-pointer">
            <div className="bg-green-100 p-2 rounded-lg text-green-600 group-hover:bg-green-600 group-hover:text-white transition">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="block font-bold text-sm">Money Health Score</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Open Full Dashboard</span>
            </div>
          </button>

          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
            <p className="text-[11px] text-yellow-800 leading-relaxed font-medium italic">
              "AI Insight: Your SIP in Nifty 50 has outperformed your Gold holdings by 12% this year. Consider rebalancing."
            </p>
          </div>
        </div>
      </div>

      {/* FIRE MODAL (FUNCTIONALITY) */}
      {showFireModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 text-[#333] font-sans">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative shadow-2xl">
            <button onClick={() => setShowFireModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black cursor-pointer">
              <X />
            </button>
            
            <h3 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
              <Calculator className="text-[#013366]" /> FIRE Planner
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Current Age</label>
                <input 
                  type="number" 
                  className="w-full border-b-2 border-gray-200 py-2 focus:border-[#013366] outline-none font-bold text-lg"
                  value={fireData.age}
                  onChange={(e) => setFireData({...fireData, age: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Monthly Expenses (₹)</label>
                <input 
                  type="number" 
                  className="w-full border-b-2 border-gray-200 py-2 focus:border-[#013366] outline-none font-bold text-lg"
                  value={fireData.expenses}
                  onChange={(e) => setFireData({...fireData, expenses: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Target Retirement Age</label>
                <input 
                  type="number" 
                  className="w-full border-b-2 border-gray-200 py-2 focus:border-[#013366] outline-none font-bold text-lg"
                  value={fireData.targetAge}
                  onChange={(e) => setFireData({...fireData, targetAge: e.target.value})}
                />
              </div>
              
              <button 
                onClick={calculateFIRE}
                className="w-full bg-[#013366] text-white py-4 rounded-xl font-bold uppercase tracking-widest mt-4 hover:shadow-lg transition cursor-pointer"
              >
                Calculate My Number
              </button>

              {result && (
                <div className="mt-6 bg-blue-50 p-6 rounded-xl border border-blue-100 text-center animate-bounce-in">
                  <p className="text-sm font-bold text-blue-900 uppercase">Your FIRE Number</p>
                  <h4 className="text-4xl font-black text-[#013366]">₹{result.corpus} Crores</h4>
                  <p className="text-[10px] text-blue-700 mt-2 italic font-bold">
                    Adjusted for 6% inflation. Your future monthly expenses will be ₹{result.futureMonthly.toLocaleString()}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyMoneyMentor;
