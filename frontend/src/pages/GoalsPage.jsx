import React, { useState } from 'react';
import { Plus, Trash2, Target } from 'lucide-react';

const GoalsPage = ({ goals, setGoals }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', target: '', saved: '0' });
  const [addAmounts, setAddAmounts] = useState({});

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.name || !form.target) return;
    setGoals(prev => [...prev, { id: Date.now(), name: form.name, target: parseFloat(form.target), saved: parseFloat(form.saved) || 0 }]);
    setForm({ name: '', target: '', saved: '0' });
    setShowForm(false);
  };

  const handleDelete = (id) => setGoals(prev => prev.filter(g => g.id !== id));

  const handleAddSavings = (id) => {
    const amt = parseFloat(addAmounts[id]);
    if (!amt || amt <= 0) return;
    setGoals(prev => prev.map(g => g.id === id ? { ...g, saved: Math.min(g.saved + amt, g.target) } : g));
    setAddAmounts(prev => ({ ...prev, [id]: '' }));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#013366] tracking-tight mb-1" style={{ color: '#000000' }}>Goals</h1>
          <p className="text-gray-500 text-sm font-medium">Track your savings goals</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-[#ed1c24] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-red-700 transition cursor-pointer shadow-sm">
          <Plus size={16} /> Add Goal
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Goal Name</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Emergency Fund" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#013366]" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target Amount (₹)</label>
            <input type="number" min="1" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} placeholder="500000" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#013366]" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Already Saved (₹)</label>
            <input type="number" min="0" value={form.saved} onChange={e => setForm({ ...form, saved: e.target.value })} placeholder="0" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#013366]" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-[#013366] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-900 transition cursor-pointer">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition cursor-pointer">Cancel</button>
          </div>
        </form>
      )}

      {goals.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center text-gray-400 text-sm">No goals yet. Create your first savings goal!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {goals.map(g => {
            const pct = Math.round((g.saved / g.target) * 100);
            const done = g.saved >= g.target;
            return (
              <div key={g.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${done ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-[#013366]'}`}><Target size={20} /></div>
                    <div>
                      <p className="font-bold text-gray-800">{g.name}</p>
                      <p className="text-xs text-gray-400 font-bold">{pct}% complete</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(g.id)} className="text-gray-300 hover:text-red-500 transition cursor-pointer"><Trash2 size={16} /></button>
                </div>

                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-gray-600">₹{g.saved.toLocaleString('en-IN')}</span>
                  <span className="text-gray-400">₹{g.target.toLocaleString('en-IN')}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${done ? 'bg-green-500' : 'bg-[#013366]'}`} style={{ width: `${pct}%` }}></div>
                </div>

                {!done && (
                  <div className="flex gap-2">
                    <input
                      type="number" min="1"
                      placeholder="Add amount"
                      value={addAmounts[g.id] || ''}
                      onChange={e => setAddAmounts(prev => ({ ...prev, [g.id]: e.target.value }))}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#013366]"
                    />
                    <button onClick={() => handleAddSavings(g.id)} className="bg-[#013366] text-white px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-blue-900 transition">+ Add</button>
                  </div>
                )}
                {done && <p className="text-center text-green-600 font-bold text-sm">🎉 Goal Reached!</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GoalsPage;
