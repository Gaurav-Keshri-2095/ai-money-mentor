import React, { useState, useEffect } from 'react';
import { 
  authAPI, getAuthToken, clearAuthToken,
  transactionsAPI, accountsAPI, goalsAPI, debtsAPI
} from './services/api';

// Layout
import Sidebar from './components/layout/Sidebar';
import TopHeader from './components/layout/TopHeader';

// Home
import ETHeader from './components/home/ETHeader';

// Pages
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import AccountsPage from './pages/AccountsPage';
import BudgetPage from './pages/BudgetPage';
import GoalsPage from './pages/GoalsPage';
import DebtsPage from './pages/DebtsPage';
import SettingsPage from './pages/SettingsPage';

// Agent Pages
import MoneyHealthPage from './pages/MoneyHealthPage';
import TaxWizardPage from './pages/TaxWizardPage';
import PortfolioXRayPage from './pages/PortfolioXRayPage';
import FirePlannerPage from './pages/FirePlannerPage';
import AIChatPage from './pages/AIChatPage';

import { Loader2 } from 'lucide-react';

const App = () => {
  // --- ROUTING STATE ---
  const [view, setView] = useState('home'); // 'home' | 'auth' | 'app'
  const [activePage, setActivePage] = useState('dashboard');
  const [isInitializing, setIsInitializing] = useState(true);

  // --- SHARED DATA STATE ---
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [goals, setGoals] = useState([]);
  const [debts, setDebts] = useState([]);
  const [budgets, setBudgets] = useState({
    Housing: 40000,
    Food: 10000,
    Transport: 5000,
  });

  const [settings, setSettings] = useState({
    name: 'ujjawal',
    currency: '₹ (INR)',
    notifications: true,
  });

  const loadData = async () => {
    try {
      const [txs, accs, gs, dbs] = await Promise.all([
        transactionsAPI.getAll(),
        accountsAPI.getAll(),
        goalsAPI.getAll(),
        debtsAPI.getAll()
      ]);
      setTransactions(txs);
      setAccounts(accs);
      setGoals(gs);
      setDebts(dbs);
    } catch (err) {
      console.error("Failed to load initial data", err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (getAuthToken()) {
        try {
          const user = await authAPI.getProfile();
          setSettings(prev => ({ ...prev, name: user.name }));
          await loadData();
          setView('app');
        } catch (err) {
          clearAuthToken();
        }
      }
      setIsInitializing(false);
    };
    initAuth();
  }, []);

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f3f4f6]">
        <Loader2 className="animate-spin text-[#013366]" size={40} />
      </div>
    );
  }

  const handleLogout = () => {
    clearAuthToken();
    setView('home');
  };

  const handleLogin = async (user) => {
    setSettings(prev => ({ ...prev, name: user.name }));
    setIsInitializing(true);
    await loadData();
    setIsInitializing(false);
    setView('app'); 
    setActivePage('dashboard'); 
  };

  // --- AUTH VIEW ---
  if (view === 'auth') {
    return (
      <AuthPage
        onLogin={handleLogin}
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
        case 'accounts':
          return <AccountsPage accounts={accounts} setAccounts={setAccounts} />;
        case 'budget':
          return <BudgetPage budgets={budgets} setBudgets={setBudgets} transactions={transactions} />;
        case 'goals':
          return <GoalsPage goals={goals} setGoals={setGoals} />;
        case 'debts':
          return <DebtsPage debts={debts} setDebts={setDebts} />;
        
        // Agent Pages
        case 'money-health':
          return <MoneyHealthPage />;
        case 'tax-wizard':
          return <TaxWizardPage />;
        case 'portfolio-xray':
          return <PortfolioXRayPage />;
        case 'fire-planner':
          return <FirePlannerPage />;
        case 'ai-chat':
          return <AIChatPage onRefreshData={loadData} />;

        case 'settings':
          return (
            <SettingsPage
              settings={settings}
              setSettings={setSettings}
              allData={{ transactions, accounts, budgets, goals, debts, settings }}
              onLogout={handleLogout}
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

      <main className="flex-1 w-full relative h-[calc(100vh-140px)]">
        <iframe 
          src="/ET_clean.html" 
          className="w-full h-full border-0 absolute inset-0 z-0"
          title="Economic Times News"
        />
      </main>
    </div>
  );
};

export default App;