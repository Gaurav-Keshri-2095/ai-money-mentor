import React, { useState } from 'react';
import { Plus, Trash2, Landmark, Loader2 } from 'lucide-react';
import { debtsAPI } from '../services/api';

const DebtsPage = ({ debts, setDebts }) => {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', total_amount: '', emi: '', remaining: '', interest_rate: '0' });

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.total_amount || !form.emi) return;

    setIsSubmitting(true);
    try {
      const total = parseFloat(form.total_amount);
      const data = {
        ...form,
        total_amount: total,
        emi: parseFloat(form.emi),
        remaining: parseFloat(form.remaining) || total,
        interest_rate: parseFloat(form.interest_rate) || 0
      };
      const result = await debtsAPI.create(data);
      
      setDebts(prev => [...prev, {
        id: result.id,
        name: data.name,
        total: data.total_amount,
        emi: data.emi,
        remaining: data.remaining,
        rate: data.interest_rate
      }]);
      setForm({ name: '', total_amount: '', emi: '', remaining: '', interest_rate: '0' });
      setShowForm(false);
    } catch (err) {
      alert("Failed to add debt: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this debt record?")) return;
    
    try {
      await debtsAPI.delete(id);
      setDebts(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      alert("Failed to delete debt: " + err.message);
    }
  };

  const handlePayEMI = (id) => {
    // Note: No backend PATCH for debts yet, so this is local only
    setDebts(prev => prev.map(d => {
      if (d.id !== id) return d;
      const newRemaining = Math.max(d.remaining - d.emi, 0);
      return { ...d, remaining: newRemaining };
    }));
  };

  const totalDebt = debts.reduce((s, d) => s + (d.remaining || 0), 0);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#013366] tracking-tight mb-1" style={{ color: '#000000' }}>Debts</h1>
          <p className="text-gray-500 text-sm font-medium">Total Outstanding: <span className="font-bold text-[#ed1c24]">₹{totalDebt.toLocaleString('en-IN')}</span></p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-[#ed1c24] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-red-700 transition cursor-pointer shadow-sm">
          <Plus size={16} /> Add Debt
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Loan Name</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Home Loan" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#013366]" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Amount (₹)</label>
            <input type="number" min="1" value={form.total_amount} onChange={e => setForm({ ...form, total_amount: e.target.value })} placeholder="2000000" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#013366]" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">EMI (₹)</label>
            <input type="number" min="1" value={form.emi} onChange={e => setForm({ ...form, emi: e.target.value })} placeholder="25000" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#013366]" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Remaining (₹)</label>
            <input type="number" min="0" value={form.remaining} onChange={e => setForm({ ...form, remaining: e.target.value })} placeholder="Same as total" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#013366]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Interest Rate (%)</label>
            <input type="number" step="0.1" value={form.interest_rate} onChange={e => setForm({ ...form, interest_rate: e.target.value })} placeholder="8.5" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#013366]" />
          </div>
          <div className="md:col-span-5 flex gap-3">
            <button type="submit" disabled={isSubmitting} className="bg-[#013366] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-900 transition cursor-pointer disabled:opacity-50 flex items-center gap-2">
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              Save
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition cursor-pointer">Cancel</button>
          </div>
        </form>
      )}

      {debts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center text-gray-400 text-sm">No debts tracked. Add a loan or credit to start managing repayments.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {debts.map(d => {
            const total = d.total || d.total_amount || 0;
            const remaining = d.remaining || d.remaining_amount || 0;
            const emi = d.emi || 0;
            const paid = total - remaining;
            const pct = total > 0 ? Math.round((paid / total) * 100) : 0;
            const done = remaining <= 0;
            return (
              <div key={d.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${done ? 'bg-green-50 text-green-600' : 'bg-red-50 text-[#ed1c24]'}`}><Landmark size={20} /></div>
                    <div>
                      <p className="font-bold text-gray-800">{d.name}</p>
                      <p className="text-xs text-gray-400 font-bold">EMI: ₹{emi.toLocaleString('en-IN')}/mo • Rate: {d.rate || d.interest_rate}%</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(d.id)} className="text-gray-300 hover:text-red-500 transition cursor-pointer"><Trash2 size={16} /></button>
                </div>

                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-green-600">Paid ₹{paid.toLocaleString('en-IN')}</span>
                  <span className="text-gray-400">of ₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${done ? 'bg-green-500' : 'bg-[#ed1c24]'}`} style={{ width: `${pct}%` }}></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-600">Remaining: <span className="text-[#ed1c24]">₹{remaining.toLocaleString('en-IN')}</span></span>
                  {!done ? (
                    <button onClick={() => handlePayEMI(d.id)} className="bg-[#013366] text-white px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-blue-900 transition">Pay EMI</button>
                  ) : (
                    <span className="text-green-600 font-bold text-sm">✅ Paid Off!</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DebtsPage;
