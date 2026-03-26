import React, { useState } from 'react';

// Layout
import Sidebar from './components/layout/Sidebar';
import TopHeader from './components/layout/TopHeader';

// Home
import ETHeader from './components/home/ETHeader';
import MyMoneyMentor from './components/home/MyMoneyMentor';

// Pages
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import AccountsPage from './pages/AccountsPage';
import BudgetPage from './pages/BudgetPage';
import GoalsPage from './pages/GoalsPage';
import DebtsPage from './pages/DebtsPage';
import SettingsPage from './pages/SettingsPage';
import AIMentorPage from './pages/AIMentorPage';

const App = () => {
  // --- ROUTING STATE ---
  const [view, setView] = useState('home'); // 'home' | 'auth' | 'app'
  const [activePage, setActivePage] = useState('dashboard');

  // --- SHARED DATA STATE ---
  const [transactions, setTransactions] = useState([
    { id: 1, date: '2026-03-25', description: 'Monthly Salary', amount: 150000, type: 'income', category: 'Salary' },
    { id: 2, date: '2026-03-25', description: 'Rent Payment', amount: 35000, type: 'expense', category: 'Housing' },
    { id: 3, date: '2026-03-26', description: 'Grocery Shopping', amount: 4500, type: 'expense', category: 'Food' },
    { id: 4, date: '2026-03-26', description: 'Uber Rides', amount: 1200, type: 'expense', category: 'Transport' },
    { id: 5, date: '2026-03-27', description: 'Freelance Project', amount: 25000, type: 'income', category: 'Freelance' },
  ]);

  const [accounts, setAccounts] = useState([
    { id: 1, name: 'SBI Savings', type: 'Savings', balance: 325000 },
    { id: 2, name: 'HDFC Current', type: 'Current', balance: 100000 },
  ]);

  const [budgets, setBudgets] = useState({
    Housing: 40000,
    Food: 10000,
    Transport: 5000,
  });

  const [goals, setGoals] = useState([
    { id: 1, name: 'Emergency Fund', target: 500000, saved: 175000 },
  ]);

  const [debts, setDebts] = useState([
    { id: 1, name: 'Education Loan', total: 800000, emi: 15000, remaining: 520000 },
  ]);

  const [settings, setSettings] = useState({
    name: 'ujjawal',
    currency: '₹ (INR)',
    notifications: true,
  });

  // --- AUTH VIEW ---
  if (view === 'auth') {
    return (
      <AuthPage
        onLogin={() => { setView('app'); setActivePage('dashboard'); }}
        onBack={() => setView('home')}
      />
    );
  }

  // --- DASHBOARD APP VIEW ---
  if (view === 'app') {
    const renderPage = () => {
      switch (activePage) {
        case 'dashboard':
          return <DashboardPage transactions={transactions} accounts={accounts} />;
        case 'transactions':
          return <TransactionsPage transactions={transactions} setTransactions={setTransactions} />;
        case 'ai-mentor':
          return <AIMentorPage transactions={transactions} accounts={accounts} budgets={budgets} goals={goals} debts={debts} />;
        case 'accounts':
          return <AccountsPage accounts={accounts} setAccounts={setAccounts} />;
        case 'budget':
          return <BudgetPage budgets={budgets} setBudgets={setBudgets} transactions={transactions} />;
        case 'goals':
          return <GoalsPage goals={goals} setGoals={setGoals} />;
        case 'debts':
          return <DebtsPage debts={debts} setDebts={setDebts} />;
        case 'settings':
          return (
            <SettingsPage
              settings={settings}
              setSettings={setSettings}
              allData={{ transactions, accounts, budgets, goals, debts, settings }}
            />
          );
        default:
          return <DashboardPage transactions={transactions} accounts={accounts} />;
      }
    };

    return (
      <div className="flex h-screen bg-[#f3f4f6] font-sans overflow-hidden">
        <Sidebar
          activePage={activePage}
          onNavigate={setActivePage}
          onBackHome={() => setView('home')}
        />
        <main className="flex-1 flex flex-col overflow-y-auto">
          <TopHeader userName={settings.name} onBackHome={() => setView('home')} />
          {renderPage()}
        </main>
      </div>
    );
  }

  // --- HOME VIEW (ET Landing) ---
  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans">
      <ETHeader
        onSignIn={() => setView('auth')}
        onMentor={() => setView('auth')}
        onHome={() => setView('home')}
      />

      <main className="max-w-7xl mx-auto grid grid-cols-12 gap-8 p-6 mt-4">
        {/* News Placeholders */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm border-t-4 border-red-600">
            <h2 className="text-2xl font-bold mb-6 font-serif border-b pb-4 text-gray-800">Top Market Stories</h2>
            {[1, 2, 3].map(i => (
              <div key={i} className={`flex gap-6 ${i < 3 ? 'mb-8 pb-6 border-b border-gray-100' : ''}`}>
                <div className="w-1/3 aspect-video bg-gray-200 rounded animate-pulse"></div>
                <div className="w-2/3 space-y-3">
                  <div className={`h-4 w-20 rounded animate-pulse ${i === 1 ? 'bg-red-100' : i === 2 ? 'bg-blue-100' : 'bg-green-100'}`}></div>
                  <div className="h-6 bg-gray-200 w-full rounded animate-pulse"></div>
                  <div className="h-6 bg-gray-200 w-5/6 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-100 w-full rounded animate-pulse mt-4"></div>
                  <div className="h-4 bg-gray-100 w-2/3 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Mentor Widget */}
        <div className="col-span-12 lg:col-span-4">
          <div className="sticky top-28">
            <MyMoneyMentor onOpenDashboard={() => setView('auth')} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;