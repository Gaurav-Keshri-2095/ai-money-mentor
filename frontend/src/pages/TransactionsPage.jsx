import React, { useState } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { transactionsAPI } from '../services/api';

const categories = ['Housing', 'Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Education', 'Salary', 'Freelance', 'Other'];

const TransactionsPage = ({ transactions, setTransactions }) => {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    description: '', 
    amount: '', 
    transaction_type: 'expense', 
    category: 'Food' 
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.description || !form.amount) return;
    
    setIsSubmitting(true);
    try {
      const data = { 
        ...form, 
        amount: parseFloat(form.amount) 
      };
      const result = await transactionsAPI.create(data);
      
      // Update local state with the new transaction including the ID from backend
      setTransactions(prev => [...prev, { ...data, id: result.id }]);
      
      setForm({ 
        date: new Date().toISOString().split('T')[0], 
        description: '', 
        amount: '', 
        transaction_type: 'expense', 
        category: 'Food' 
      });
      setShowForm(false);
    } catch (err) {
      alert("Failed to add transaction: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    
    try {
      await transactionsAPI.delete(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      alert("Failed to delete transaction: " + err.message);
    }
  };

  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.type === filter || t.transaction_type === filter);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#013366] tracking-tight mb-1" style={{ color: '#000000' }}>Transactions</h1>
          <p className="text-gray-500 text-sm font-medium">{transactions.length} total transactions</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-[#ed1c24] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-red-700 transition cursor-pointer shadow-sm">
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#013366]" required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
            <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="e.g. Grocery shopping" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#013366]" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount (₹)</label>
            <input type="number" min="1" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="5000" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#013366]" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
            <select value={form.transaction_type} onChange={e => setForm({ ...form, transaction_type: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#013366] cursor-pointer">
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#013366] cursor-pointer">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="md:col-span-6 flex gap-3">
            <button type="submit" disabled={isSubmitting} className="bg-[#013366] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-900 transition cursor-pointer disabled:opacity-50 flex items-center gap-2">
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              Save
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition cursor-pointer">Cancel</button>
          </div>
        </form>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {['all', 'income', 'expense'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition cursor-pointer ${filter === f ? 'bg-[#013366] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#013366]'}`}>
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">No transactions found. Click "Add Transaction" to get started.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Description</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-left">Type</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...filtered].reverse().map(t => {
                const type = (t.type || t.transaction_type || '').toLowerCase();
                return (
                  <tr key={t.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3 text-gray-600 font-medium">{t.date}</td>
                    <td className="px-6 py-3 text-gray-800 font-semibold">{t.description}</td>
                    <td className="px-6 py-3"><span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">{t.category}</span></td>
                    <td className="px-6 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${type === 'income' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                        {type.toUpperCase()}
                      </span>
                    </td>
                    <td className={`px-6 py-3 text-right font-bold ${type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <button onClick={() => handleDelete(t.id)} className="text-gray-400 hover:text-red-600 transition cursor-pointer">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;
