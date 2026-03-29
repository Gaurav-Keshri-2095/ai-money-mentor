import React, { useState } from 'react';
import { Plus, Trash2, CreditCard, Landmark, Wallet, Loader2 } from 'lucide-react';
import { accountsAPI } from '../services/api';

const iconMap = { Savings: Wallet, Current: Landmark, 'Credit Card': CreditCard };

const AccountsPage = ({ accounts, setAccounts }) => {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', account_type: 'Savings', balance: '' });

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.balance) return;
    
    setIsSubmitting(true);
    try {
      const data = { 
        ...form, 
        balance: parseFloat(form.balance) 
      };
      const result = await accountsAPI.create(data);
      
      setAccounts(prev => [...prev, { ...data, id: result.id, type: data.account_type }]);
      setForm({ name: '', account_type: 'Savings', balance: '' });
      setShowForm(false);
    } catch (err) {
      alert("Failed to add account: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this account?")) return;
    
    try {
      await accountsAPI.delete(id);
      setAccounts(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert("Failed to delete account: " + err.message);
    }
  };

  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#013366] tracking-tight mb-1">Accounts</h1>
          <p className="text-gray-500 text-sm font-medium">Total Balance: <span className="font-bold text-[#013366]">₹{totalBalance.toLocaleString('en-IN')}</span></p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-[#ed1c24] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-red-700 transition cursor-pointer shadow-sm">
          <Plus size={16} /> Add Account
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Account Name</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. SBI Savings" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#013366]" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
            <select value={form.account_type} onChange={e => setForm({...form, account_type: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#013366] cursor-pointer">
              <option value="Savings">Savings</option>
              <option value="Current">Current</option>
              <option value="Credit Card">Credit Card</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Balance (₹)</label>
            <input type="number" value={form.balance} onChange={e => setForm({...form, balance: e.target.value})} placeholder="100000" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#013366]" required />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={isSubmitting} className="bg-[#013366] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-900 transition cursor-pointer disabled:opacity-50 flex items-center gap-2">
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              Save
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-600 px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition cursor-pointer">Cancel</button>
          </div>
        </form>
      )}

      {accounts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center text-gray-400 text-sm">
          No accounts yet. Add your first bank account to start tracking.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.map(a => {
            const Icon = iconMap[a.type || a.account_type] || Wallet;
            return (
              <div key={a.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 text-[#013366] p-2.5 rounded-lg"><Icon size={20} /></div>
                    <div>
                      <p className="font-bold text-gray-800">{a.name}</p>
                      <p className="text-xs text-gray-400 font-bold uppercase">{a.type || a.account_type}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(a.id)} className="text-gray-300 hover:text-red-500 transition cursor-pointer"><Trash2 size={16} /></button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">₹</span>
                  <div className="text-2xl font-bold text-[#013366] w-full py-1">
                    {(a.balance || 0).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AccountsPage;
