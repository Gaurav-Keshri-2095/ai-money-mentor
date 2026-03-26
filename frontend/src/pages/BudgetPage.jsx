import React, { useState } from 'react';

const defaultCategories = ['Housing', 'Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Education', 'Other'];

const BudgetPage = ({ budgets, setBudgets, transactions }) => {
  const [editCat, setEditCat] = useState(null);
  const [editVal, setEditVal] = useState('');

  const expensesByCategory = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
  });

  const handleSetBudget = (category) => {
    if (!editVal || parseFloat(editVal) <= 0) return;
    setBudgets(prev => ({ ...prev, [category]: parseFloat(editVal) }));
    setEditCat(null);
    setEditVal('');
  };

  const handleRemoveBudget = (category) => {
    setBudgets(prev => {
      const copy = { ...prev };
      delete copy[category];
      return copy;
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#013366] tracking-tight mb-1" style={{ color: '#000000' }}>Budget</h1>
        <p className="text-gray-500 text-sm font-medium">Set spending limits per category and track your progress</p>
      </div>

      <div className="space-y-4">
        {defaultCategories.map(cat => {
          const budget = budgets[cat] || 0;
          const spent = expensesByCategory[cat] || 0;
          const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
          const over = budget > 0 && spent > budget;

          return (
            <div key={cat} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-800">{cat}</span>
                  {over && <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded uppercase">Over Budget</span>}
                </div>
                <div className="flex items-center gap-3">
                  {budget > 0 ? (
                    <>
                      <span className="text-sm font-bold text-gray-600">₹{spent.toLocaleString('en-IN')} <span className="text-gray-400">/ ₹{budget.toLocaleString('en-IN')}</span></span>
                      <button onClick={() => handleRemoveBudget(cat)} className="text-xs text-gray-400 hover:text-red-500 cursor-pointer transition font-bold">Remove</button>
                    </>
                  ) : editCat === cat ? (
                    <div className="flex items-center gap-2">
                      <input type="number" min="1" value={editVal} onChange={e => setEditVal(e.target.value)} placeholder="Budget amount" className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-32 focus:outline-none focus:border-[#013366]" autoFocus />
                      <button onClick={() => handleSetBudget(cat)} className="bg-[#013366] text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-blue-900 transition">Set</button>
                      <button onClick={() => { setEditCat(null); setEditVal(''); }} className="text-gray-400 text-xs font-bold cursor-pointer hover:text-gray-600">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditCat(cat); setEditVal(''); }} className="text-xs font-bold text-[#013366] hover:underline cursor-pointer">+ Set Budget</button>
                  )}
                </div>
              </div>
              {budget > 0 && (
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${over ? 'bg-[#ed1c24]' : pct > 75 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetPage;
