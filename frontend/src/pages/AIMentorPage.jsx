import React, { useState, useRef, useEffect } from 'react';
import { Zap, Send, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Lightbulb, MessageSquare } from 'lucide-react';

// Pre-built tips the bot can respond with
const tipBank = [
  { q: 'save more', a: 'Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Automate your SIP on salary day so savings happen first, not last.' },
  { q: 'mutual fund', a: 'For beginners, start with a Nifty 50 index fund via SIP. Keep a 5+ year horizon. Avoid NFOs and sector funds until you have a core portfolio.' },
  { q: 'tax', a: 'Maximize Section 80C (₹1.5L via ELSS/PPF), 80D (health insurance), and HRA. File ITR even if below threshold — it builds a financial history.' },
  { q: 'emergency fund', a: 'Keep 6 months of expenses in a liquid fund or high-yield savings account. This is non-negotiable before any investing.' },
  { q: 'debt', a: 'Pay off high-interest debt first (credit cards > personal loans). Never let EMIs exceed 40% of take-home pay.' },
  { q: 'budget', a: 'Track every rupee for one month first — awareness is the first step. Then set category limits and review weekly.' },
  { q: 'invest', a: 'Start with: 1) Emergency fund 2) Term insurance 3) Health insurance 4) Index fund SIP. In that order, no shortcuts.' },
  { q: 'retirement', a: 'Use the FIRE formula: Annual expenses × 28-33. Start SIPs early — ₹10K/month at 25 can become ₹3.5 Cr by 55 at 12% CAGR.' },
  { q: 'insurance', a: 'Get term insurance = 10-15x annual income. Health insurance = ₹10L+ cover. Avoid ULIPs and endowment plans — they mix insurance and investment poorly.' },
  { q: 'credit score', a: 'Pay all EMIs on time, keep credit utilization below 30%, don\'t apply for multiple cards at once. Check your CIBIL score quarterly for free.' },
  { q: 'gold', a: 'Limit gold to 5-10% of portfolio. Use Sovereign Gold Bonds (SGBs) for tax-free returns + 2.5% interest, not physical gold.' },
  { q: 'real estate', a: 'Don\'t buy property just because "rent is dead money." Compare EMI vs rent + SIP over 20 years — often renting + investing wins.' },
];

const defaultResponse = "I can help with: saving, mutual funds, tax planning, emergency funds, debt management, budgeting, investing, retirement, insurance, credit score, gold, and real estate. Ask me anything!";

function getResponse(input) {
  const lower = input.toLowerCase();
  const match = tipBank.find(t => lower.includes(t.q));
  if (match) return match.a;
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) return "Hello! I'm your AI Money Mentor. Ask me about saving, investing, tax planning, or any personal finance topic.";
  if (lower.includes('thank')) return "You're welcome! Remember — consistency beats intensity in personal finance. Keep going! 💪";
  return defaultResponse;
}

const AIMentorPage = ({ transactions, accounts, budgets, goals, debts }) => {
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm your AI Money Mentor 🤖. Ask me about saving, investing, taxes, or any personal finance topic. I'll also analyze your financial data below." }
  ]);
  const [input, setInput] = useState('');
  const chatEnd = useRef(null);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input.trim() };
    const botMsg = { role: 'bot', text: getResponse(input.trim()) };
    setMessages(prev => [...prev, userMsg, botMsg]);
    setInput('');
  };

  // --- ANALYSIS COMPUTATIONS ---
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const totalDebt = debts.reduce((s, d) => s + d.remaining, 0);
  const debtToIncome = totalIncome > 0 ? Math.round((totalDebt / (totalIncome * 12)) * 100) : 0;

  // Category breakdown
  const catSpend = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    catSpend[t.category] = (catSpend[t.category] || 0) + t.amount;
  });
  const topCategory = Object.entries(catSpend).sort((a, b) => b[1] - a[1])[0];

  // Budget alerts
  const overBudget = Object.entries(budgets).filter(([cat, limit]) => (catSpend[cat] || 0) > limit);

  // Goal progress
  const avgGoalProgress = goals.length > 0
    ? Math.round(goals.reduce((s, g) => s + (g.saved / g.target) * 100, 0) / goals.length)
    : 0;

  // Generate insights
  const insights = [];

  if (savingsRate >= 20) {
    insights.push({ type: 'success', icon: CheckCircle, text: `Savings rate is ${savingsRate}% — excellent! You're saving more than the recommended 20%.` });
  } else if (savingsRate >= 10) {
    insights.push({ type: 'warning', icon: AlertTriangle, text: `Savings rate is ${savingsRate}%. Try to reach 20% by reducing discretionary spending.` });
  } else {
    insights.push({ type: 'danger', icon: TrendingDown, text: `Savings rate is only ${savingsRate}%. This is critically low. Review your biggest expense categories immediately.` });
  }

  if (topCategory) {
    insights.push({ type: 'info', icon: Lightbulb, text: `Your biggest expense is "${topCategory[0]}" at ₹${topCategory[1].toLocaleString('en-IN')}. Look for ways to optimize here first.` });
  }

  if (overBudget.length > 0) {
    insights.push({ type: 'danger', icon: AlertTriangle, text: `You're over budget in ${overBudget.length} categor${overBudget.length > 1 ? 'ies' : 'y'}: ${overBudget.map(o => o[0]).join(', ')}. Time to course-correct.` });
  }

  if (debtToIncome > 50) {
    insights.push({ type: 'danger', icon: TrendingDown, text: `Debt-to-income ratio is ${debtToIncome}% — this is high. Focus on paying down high-interest debt before new investments.` });
  } else if (totalDebt > 0) {
    insights.push({ type: 'info', icon: Lightbulb, text: `Debt-to-income ratio is ${debtToIncome}%. Manageable, but keep reducing monthly. Consider the avalanche method for fastest payoff.` });
  }

  if (goals.length > 0) {
    insights.push({ type: avgGoalProgress >= 50 ? 'success' : 'info', icon: avgGoalProgress >= 50 ? CheckCircle : TrendingUp, text: `Average goal progress: ${avgGoalProgress}%. ${avgGoalProgress >= 50 ? 'Great momentum — keep it up!' : 'Increase monthly contributions to stay on track.'}` });
  }

  if (totalBalance > totalExpense * 6) {
    insights.push({ type: 'success', icon: CheckCircle, text: `You have ${Math.round(totalBalance / totalExpense)} months of expenses in your accounts. Your emergency fund looks solid!` });
  } else if (totalExpense > 0) {
    insights.push({ type: 'warning', icon: AlertTriangle, text: `You only have ${Math.round(totalBalance / totalExpense)} months of expenses saved. Aim for at least 6 months.` });
  }

  const typeColors = {
    success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-500' },
    warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: 'text-yellow-500' },
    danger: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-500' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-500' },
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#013366] tracking-tight mb-1 flex items-center gap-3" style={{ color: '#000000' }}>
          <Zap className="text-yellow-500" size={28} /> AI Mentor
        </h1>
        <p className="text-gray-500 text-sm font-medium">Personalized financial analysis and tips powered by AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT: Analysis Insights */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-[#013366] px-6 py-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-yellow-400" />
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">Financial Analysis</h3>
            </div>

            {/* Score Summary */}
            <div className="p-6 border-b border-gray-100">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Savings Rate</p>
                  <p className={`text-2xl font-black ${savingsRate >= 20 ? 'text-green-600' : savingsRate >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>{savingsRate}%</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Debt Ratio</p>
                  <p className={`text-2xl font-black ${debtToIncome <= 30 ? 'text-green-600' : debtToIncome <= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{debtToIncome}%</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Goal Progress</p>
                  <p className={`text-2xl font-black ${avgGoalProgress >= 50 ? 'text-green-600' : 'text-[#013366]'}`}>{avgGoalProgress}%</p>
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="p-6 space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Insights & Recommendations</p>
              {insights.length === 0 ? (
                <p className="text-sm text-gray-400">Add transactions and set budgets to see personalized insights.</p>
              ) : (
                insights.map((insight, i) => {
                  const colors = typeColors[insight.type];
                  const Icon = insight.icon;
                  return (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${colors.bg} ${colors.border}`}>
                      <Icon size={18} className={`${colors.icon} shrink-0 mt-0.5`} />
                      <p className={`text-sm font-medium ${colors.text}`}>{insight.text}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Chat Tips */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col" style={{ height: '560px' }}>
            <div className="bg-[#013366] px-6 py-4 flex items-center gap-2">
              <MessageSquare size={18} className="text-yellow-400" />
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">Money Tips Chatbot</h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed ${msg.role === 'user'
                      ? 'bg-[#013366] text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                    }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEnd} />
            </div>

            {/* Quick Chips */}
            <div className="px-4 py-2 border-t border-gray-100 flex gap-2 overflow-x-auto no-scrollbar">
              {['Save more', 'Mutual fund', 'Tax tips', 'Emergency fund', 'Retirement'].map(chip => (
                <button
                  key={chip}
                  onClick={() => { setInput(chip); }}
                  className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap hover:bg-[#013366] hover:text-white transition cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about saving, investing, tax..."
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#013366] transition"
              />
              <button type="submit" className="bg-[#ed1c24] text-white p-2.5 rounded-xl hover:bg-red-700 transition cursor-pointer shadow-sm">
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AIMentorPage;
