import React from 'react';
import { Download } from 'lucide-react';

const SettingsPage = ({ settings, setSettings, allData }) => {
  const currencyOptions = ['₹ (INR)', '$ (USD)', '€ (EUR)', '£ (GBP)'];

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'money-mentor-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#013366] tracking-tight mb-1" style={{ color: '#000000' }}>Settings</h1>
        <p className="text-gray-500 text-sm font-medium">Manage your preferences</p>
      </div>

      <div className="space-y-6">
        {/* Name */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Display Name</label>
          <input
            type="text"
            value={settings.name}
            onChange={e => setSettings(prev => ({ ...prev, name: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#013366] transition"
            placeholder="Your name"
          />
        </div>

        {/* Currency */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Currency</label>
          <div className="flex gap-3 flex-wrap">
            {currencyOptions.map(c => (
              <button
                key={c}
                onClick={() => setSettings(prev => ({ ...prev, currency: c }))}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition cursor-pointer ${settings.currency === c ? 'bg-[#013366] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Email Notifications */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Email Notifications</label>
              <p className="text-xs text-gray-400">Receive weekly spending summaries</p>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, notifications: !prev.notifications }))}
              className={`w-12 h-6 rounded-full relative transition cursor-pointer ${settings.notifications ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${settings.notifications ? 'left-6' : 'left-0.5'}`}></div>
            </button>
          </div>
        </div>

        {/* Export */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">Export All Data</label>
              <p className="text-xs text-gray-400">Download your transactions, accounts, goals, and debts as JSON</p>
            </div>
            <button onClick={handleExport} className="bg-[#013366] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-900 transition cursor-pointer">
              <Download size={16} /> Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
