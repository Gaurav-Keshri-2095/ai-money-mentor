import React from 'react';
import {
  LayoutDashboard, ArrowRightLeft, CreditCard,
  Tags, Receipt, Target, Landmark, Settings,
  HelpCircle, Zap
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'ai-mentor', label: 'AI Mentor', icon: Zap },
  { id: 'transactions', label: 'Transactions', icon: ArrowRightLeft },
  { id: 'accounts', label: 'Accounts', icon: CreditCard },
  { id: 'budget', label: 'Budget', icon: Receipt },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'debts', label: 'Debts', icon: Landmark },
];

const Sidebar = ({ activePage, onNavigate, onBackHome }) => {
  return (
    <aside className="w-64 bg-[#013366] text-white flex flex-col justify-between hidden md:flex shrink-0 shadow-xl z-20">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={onBackHome}>
          <span className="bg-[#ed1c24] text-white font-serif font-bold text-xl px-2 py-1 tracking-tighter">
            ET
          </span>
          <span className="font-serif font-bold text-xl tracking-tight">Money Mentor</span>
        </div>

        <div>
          <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-3 px-2">Main</p>
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition cursor-pointer outline-none ${
                    isActive
                      ? 'bg-blue-800 border-l-4 border-[#ed1c24] text-white rounded-r-lg font-semibold'
                      : 'text-blue-200 hover:text-white hover:bg-blue-800 rounded-lg border-l-4 border-transparent'
                  }`}
                >
                  <Icon size={18} /> {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-4 rounded-xl border border-blue-500 mb-4">
          <p className="text-xs font-bold text-yellow-300 uppercase mb-1">✨ Premium Upgrade</p>
          <p className="text-[10px] text-blue-100 mb-3">Unlock advanced AI features</p>
          <button className="w-full bg-white text-[#013366] text-xs font-bold py-1.5 rounded cursor-pointer hover:bg-gray-100 transition">Subscribe</button>
        </div>
        <nav className="space-y-1 border-t border-blue-800 pt-4">
          <button
            onClick={() => onNavigate('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium transition cursor-pointer outline-none ${
              activePage === 'settings' ? 'text-white bg-blue-800 rounded-lg' : 'text-blue-200 hover:text-white hover:bg-blue-800 rounded-lg'
            }`}
          >
            <Settings size={18} /> Settings
          </button>
          <button className="w-full flex items-center gap-3 text-blue-200 hover:text-white hover:bg-blue-800 px-3 py-2 text-sm font-medium transition cursor-pointer rounded-lg outline-none">
            <HelpCircle size={18} /> Support
          </button>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
