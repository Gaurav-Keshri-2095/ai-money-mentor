import React, { useState, useRef, useEffect } from 'react';
import { Zap, Send, MessageSquare, Users, ChevronDown, Sparkles, Loader2, RefreshCw } from 'lucide-react';

// Agent Components
import MoneyHealthAgent from '../components/agents/MoneyHealthAgent';
import TaxWizardAgent from '../components/agents/TaxWizardAgent';
import PortfolioXRayAgent from '../components/agents/PortfolioXRayAgent';
import FIREPlannerAgent from '../components/agents/FIREPlannerAgent';
import ComplianceGuardian from '../components/agents/ComplianceGuardian';

// API Client
import { analysisAPI, chatAPI, getAuthToken } from '../services/api';

// Fallback Mock Data (used when backend is not available)
import { profiles as mockProfiles } from '../data/mockProfiles';

const AIMentorPage = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [mockProfileIdx, setMockProfileIdx] = useState(0);
  
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm your AI Money Mentor 🤖. Ask me about saving, investing, taxes, or any personal finance topic." }
  ]);
  const [input, setInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const chatEnd = useRef(null);

  // Load analysis on mount
  useEffect(() => {
    if (getAuthToken()) {
      loadAnalysis();
    } else {
      // No auth — use mock data
      loadMockData(0);
    }
  }, []);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analysisAPI.runFull();
      setProfile(result);
      setUsingMockData(false);
    } catch (err) {
      console.warn('API unavailable, using mock data:', err.message);
      loadMockData(0);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockData = (idx) => {
    setProfile(mockProfiles[idx]);
    setMockProfileIdx(idx);
    setUsingMockData(true);
  };

  const handleProfileSwitch = (idx) => {
    if (usingMockData) {
      loadMockData(idx);
    }
    setShowProfileMenu(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsChatLoading(true);

    try {
      if (getAuthToken()) {
        // Use LLM-powered chat
        const response = await chatAPI.send(input.trim());
        setMessages(prev => [...prev, { role: 'bot', text: response.text }]);
      } else {
        // Fallback to local response
        const botMsg = { role: 'bot', text: getLocalResponse(input.trim()) };
        setMessages(prev => [...prev, botMsg]);
      }
    } catch (err) {
      const botMsg = { role: 'bot', text: getLocalResponse(input.trim()) };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Fallback local responses when API is down
  const getLocalResponse = (msg) => {
    const lower = msg.toLowerCase();
    const tips = [
      { q: 'save', a: 'Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Automate your SIP on salary day.' },
      { q: 'mutual fund', a: 'Start with a Nifty 50 index fund via SIP. Keep a 5+ year horizon. Avoid NFOs and sector funds.' },
      { q: 'tax', a: 'Maximize Section 80C (₹1.5L via ELSS/PPF), 80D (health insurance), and HRA.' },
      { q: 'emergency', a: 'Keep 6 months of expenses in a liquid fund or high-yield savings account.' },
      { q: 'debt', a: 'Pay off high-interest debt first. Never let EMIs exceed 40% of take-home pay.' },
      { q: 'invest', a: 'Start with: 1) Emergency fund 2) Term insurance 3) Health insurance 4) Index fund SIP.' },
      { q: 'retire', a: 'FIRE formula: Annual expenses × 28-33. ₹10K/month at 25 can become ₹3.5 Cr by 55 at 12% CAGR.' },
      { q: 'insurance', a: 'Term insurance = 10-15x income. Health = ₹10L+ cover. Avoid ULIPs and endowment plans.' },
    ];
    const match = tips.find(t => lower.includes(t.q));
    if (match) return match.a;
    if (lower.includes('hello') || lower.includes('hi')) return "Hello! I'm your AI Money Mentor. Ask about saving, investing, tax planning, or any topic.";
    if (lower.includes('thank')) return "You're welcome! Consistency beats intensity in personal finance. Keep going! 💪";
    return "I can help with: saving, mutual funds, tax planning, emergency funds, debt, investing, retirement, insurance. Ask me anything!";
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#013366] mx-auto mb-4" size={40} />
          <p className="text-gray-500 font-semibold">Running AI analysis pipeline...</p>
          <p className="text-xs text-gray-400 mt-1">Orchestrator → Agents → Analyzer → Compliance</p>
        </div>
      </div>
    );
  }

  const scoreColor = profile.overallScore >= 80 ? '#22c55e' : profile.overallScore >= 60 ? '#f59e0b' : '#ef4444';
  const circumference = 2 * Math.PI * 40;
  const strokeDash = (profile.overallScore / 100) * circumference;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full relative pb-24">
      {/* ── Page Header ── */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight mb-1 flex items-center gap-3 text-gray-900">
              <Zap className="text-yellow-500" size={28} /> AI Money Mentor
            </h1>
            <p className="text-gray-500 text-sm font-medium">
              Multi-agent financial analysis powered by AI
              {usingMockData && (
                <span className="ml-2 text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">DEMO MODE</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            {!usingMockData && (
              <button
                onClick={loadAnalysis}
                disabled={isLoading}
                className="p-2 bg-white border border-gray-200 rounded-xl hover:border-[#013366] transition cursor-pointer"
              >
                <RefreshCw size={16} className={`text-[#013366] ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}

            {/* Profile Selector */}
            {usingMockData && (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 bg-white border-2 border-gray-200 rounded-xl px-4 py-3 hover:border-[#013366] transition cursor-pointer shadow-sm"
                >
                  <Users size={18} className="text-[#013366]" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-800">{profile.name}</p>
                    <p className="text-[10px] text-gray-500 font-semibold">{profile.label}</p>
                  </div>
                  <ChevronDown size={14} className="text-gray-400 ml-2" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-64 overflow-hidden">
                    {mockProfiles.map((p, i) => (
                      <button
                        key={p.id}
                        onClick={() => handleProfileSwitch(i)}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition cursor-pointer text-left ${i === mockProfileIdx ? 'bg-blue-50 border-l-4 border-[#013366]' : 'border-l-4 border-transparent'}`}
                      >
                        <div>
                          <p className="text-sm font-bold text-gray-800">{p.name}</p>
                          <p className="text-[10px] text-gray-500 font-semibold">{p.label} — Score: {p.overallScore}/100</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <p className="text-sm text-red-600 font-medium">{error}</p>
          <button onClick={loadAnalysis} className="text-xs font-bold text-red-600 underline cursor-pointer">Retry</button>
        </div>
      )}

      {/* ── Overall Score Banner ── */}
      <div className="bg-gradient-to-r from-[#013366] to-[#01508a] rounded-2xl p-6 mb-8 text-white flex flex-col md:flex-row items-center gap-6 shadow-lg">
        <div className="relative flex-shrink-0">
          <svg width="100" height="100" viewBox="0 0 90 90">
            <circle cx="45" cy="45" r="40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
            <circle
              cx="45" cy="45" r="40" fill="none"
              stroke={scoreColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - strokeDash}
              transform="rotate(-90 45 45)"
              style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-white">{profile.overallScore}</span>
            <span className="text-[9px] font-bold text-blue-200 uppercase">/100</span>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Overall Money Health Score</p>
          <h2 className="text-2xl font-black mb-1">{profile.overallScore}/100 <span className="text-lg font-bold opacity-80">({profile.scoreVerdict})</span></h2>
          <p className="text-sm text-blue-100 opacity-80">
            📊 Your AI Money Mentor Action Plan: Optimizing {profile.name}'s Cash Flow
          </p>
        </div>

        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-[9px] font-bold text-blue-200 uppercase">Income</p>
            <p className="text-lg font-black">₹{(profile.salary / 100000).toFixed(1)}L</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-bold text-blue-200 uppercase">Monthly Exp</p>
            <p className="text-lg font-black">₹{(profile.monthlyExpenses / 1000).toFixed(0)}K</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-bold text-blue-200 uppercase">Age</p>
            <p className="text-lg font-black">{profile.age}</p>
          </div>
        </div>
      </div>

      {/* ── Agent Sections ── */}
      <div className="space-y-8">
        <MoneyHealthAgent
          data={profile.moneyHealth}
          score={profile.overallScore}
          verdict={profile.scoreVerdict}
        />
        <TaxWizardAgent data={profile.taxWizard} />
        <PortfolioXRayAgent data={profile.portfolioXRay} />
        <FIREPlannerAgent data={profile.firePlanner} />
        <ComplianceGuardian data={profile.compliance} />
      </div>

      {/* ── Floating Chatbot ── */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#013366] rounded-full shadow-xl flex items-center justify-center text-white hover:bg-[#01508a] transition z-50 cursor-pointer"
      >
        {showChat ? '✕' : <MessageSquare size={22} />}
      </button>

      {showChat && (
        <div className="fixed bottom-24 right-6 w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden" style={{ height: '480px' }}>
          <div className="bg-[#013366] px-5 py-3 flex items-center gap-2">
            <Sparkles size={16} className="text-yellow-400" />
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">
              {getAuthToken() ? 'AI Financial Advisor' : 'Money Tips Chatbot'}
            </h3>
            {getAuthToken() && <span className="text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-bold ml-auto">LIVE</span>}
          </div>

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
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <Loader2 className="animate-spin text-gray-400" size={16} />
                </div>
              </div>
            )}
            <div ref={chatEnd} />
          </div>

          <div className="px-4 py-2 border-t border-gray-100 flex gap-2 overflow-x-auto no-scrollbar">
            {['Save more', 'Mutual fund', 'Tax tips', 'Emergency fund', 'Retirement'].map(chip => (
              <button
                key={chip}
                onClick={() => setInput(chip)}
                className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap hover:bg-[#013366] hover:text-white transition cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about saving, investing, tax..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#013366] transition"
            />
            <button 
              type="submit" 
              disabled={isChatLoading}
              className="bg-[#ed1c24] text-white p-2.5 rounded-xl hover:bg-red-700 transition cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIMentorPage;
