import React from 'react';
import { Wallet, TrendingUp, TrendingDown, ArrowRightLeft, Receipt, PiggyBank } from 'lucide-react';

const DashboardPage = ({ transactions, accounts }) => {
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savings = totalIncome - totalExpense;
  const recent = [...transactions].reverse().slice(0, 5);

  const fmt = (n) => {
    if (n >= 100000) return '₹' + (n / 100000).toFixed(2) + 'L';
    if (n >= 1000) return '₹' + (n / 1000).toFixed(1) + 'K';
    return '₹' + n.toLocaleString('en-IN');
  };

  const cards = [
    { label: 'Balance', value: fmt(totalBalance), icon: Wallet, color: '#013366', bg: 'bg-blue-50', border: 'border-l-[#013366]' },
    { label: 'Total Income', value: fmt(totalIncome), icon: ArrowRightLeft, color: '#16a34a', bg: 'bg-green-50', border: 'border-l-green-500' },
    { label: 'Total Expenses', value: fmt(totalExpense), icon: Receipt, color: '#ed1c24', bg: 'bg-red-50', border: 'border-l-[#ed1c24]' },
    { label: 'Net Savings', value: fmt(savings), icon: PiggyBank, color: savings >= 0 ? '#ca8a04' : '#ed1c24', bg: savings >= 0 ? 'bg-yellow-50' : 'bg-red-50', border: savings >= 0 ? 'border-l-yellow-500' : 'border-l-red-500' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#013366] tracking-tight mb-1" style={{ color: '#000000' }}>Dashboard</h1>
        <p className="text-gray-500 text-sm font-medium">Your complete financial overview at a glance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} className={`bg-white p-5 rounded-xl shadow-sm border-l-4 ${c.border} border border-gray-100 flex justify-between items-start`}>
              <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">{c.label}</p>
                <h3 className="text-2xl font-bold text-gray-800 tracking-tight">{c.value}</h3>
              </div>
              <div className={`${c.bg} p-3 rounded-xl`}>
                <Icon size={22} style={{ color: c.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 font-serif">Recent Transactions</h3>
        </div>
        {recent.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">No transactions yet. Add your first transaction from the Transactions page.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Description</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recent.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-3 text-gray-600 font-medium">{t.date}</td>
                  <td className="px-6 py-3 text-gray-800 font-semibold">{t.description}</td>
                  <td className="px-6 py-3"><span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">{t.category}</span></td>
                  <td className={`px-6 py-3 text-right font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
