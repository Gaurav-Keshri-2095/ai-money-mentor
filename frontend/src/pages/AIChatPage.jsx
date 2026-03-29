import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Paperclip, Loader2, Sparkles, X, FileText,
  RotateCcw, ChevronDown, Bot, User, Mic, StopCircle
} from 'lucide-react';
import { chatAPI, documentsAPI, getAuthToken } from '../services/api';

const QUICK_CHIPS = [
  '📊 Analyze my savings rate',
  '💰 How to maximize 80C?',
  '🚀 FIRE number calculation',
  '📈 Best SIP strategy for me',
  '🏠 Should I prepay my loan?',
  '🛡️ Do I need term insurance?',
];

const LOCAL_REPLIES = {
  save: 'Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Automate your SIP on salary day.',
  mutual: 'Start with a Nifty 50 index fund via SIP. Keep a 5+ year horizon. Avoid NFOs and high-cost funds.',
  tax: 'Maximize Section 80C (₹1.5L via ELSS/PPF), 80D (health insurance premiums), and HRA exemption.',
  emergency: 'Keep 6 months of expenses in a liquid fund or high-yield savings account.',
  debt: 'Pay off high-interest debt first (credit card > personal loan > home loan). Never let EMIs exceed 40% of take-home.',
  invest: 'Start with: 1) Emergency fund 2) Term insurance 3) Health insurance 4) Index fund SIP.',
  retire: 'FIRE formula: Annual expenses × 28-33. ₹10K/month at 25 can become ₹3.5Cr by 55 at 12% CAGR.',
  insurance: 'Term insurance = 10-15× annual income. Health = ₹10L+ cover. Avoid ULIPs and endowment plans.',
  fire: 'FIRE (Financial Independence Retire Early): Save 25–33× your annual expenses. A ₹1 Cr/year lifestyle needs ₹3.3 Cr corpus.',
  '80c': 'Section 80C allows ₹1.5L deduction via: ELSS (87K min 3yr lock-in), PPF, EPF, LIC, NSC, home loan principal.',
  sip: 'SIPs build rupee-cost-averaging discipline. Start with index funds: Nifty 50 or Nifty Next 50. Increase 10% yearly.',
};

function getLocalResponse(msg) {
  const lower = msg.toLowerCase();
  for (const [key, reply] of Object.entries(LOCAL_REPLIES)) {
    if (lower.includes(key)) return reply;
  }
  if (lower.includes('hello') || lower.includes('hi')) return "Hello! I'm your AI Money Mentor 🤖. I have access to your full financial profile. Ask me anything!";
  if (lower.includes('thank')) return "You're welcome! Consistency beats intensity in personal finance. Keep going! 💪";
  return "I can help with: savings rate, SIP strategy, tax planning, FIRE number, debt management, term insurance, and investment allocation. What's on your mind?";
}

const MessageBubble = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-6`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
        isUser ? 'bg-[#013366]' : 'bg-gradient-to-br from-purple-600 to-blue-600'
      }`}>
        {isUser ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] group`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-[#013366] text-white rounded-tr-sm'
            : 'bg-white text-gray-800 rounded-tl-sm shadow-sm border border-gray-100'
        }`}>
          {msg.file && (
            <div className={`flex items-center gap-2 mb-2 pb-2 border-b ${isUser ? 'border-blue-400' : 'border-gray-200'}`}>
              <FileText size={14} />
              <span className="text-xs font-semibold">{msg.file}</span>
            </div>
          )}
          <span className="whitespace-pre-wrap">{msg.text}</span>
        </div>
        <p className={`text-[10px] text-gray-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {msg.time}
        </p>
      </div>
    </div>
  );
};

const AIChatPage = ({ onRefreshData }) => {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "👋 Hi! I'm your AI Money Mentor — powered by Llama 3.\n\nI have full access to your financial profile, including your salary, mutual funds, tax regime, and FIRE goals. Ask me anything, or upload a document like your Form 16 or bank statement for a deep analysis.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFilePreview(file.name);
    setUploadedFile(file);
  };

  const removeFile = () => {
    setFilePreview(null);
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text && !uploadedFile) return;

    const userMsg = {
      role: 'user',
      text: text || (uploadedFile ? `Please analyze this document: ${uploadedFile.name}` : ''),
      file: uploadedFile?.name,
      time: now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    const prevFile = uploadedFile;
    setFilePreview(null);
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    try {
      let context = null;

      // Upload file first if present
      if (prevFile && getAuthToken()) {
        setIsUploading(true);
        try {
          const uploadResult = await documentsAPI.upload(prevFile);
          
          if (uploadResult.success && uploadResult.summary && uploadResult.summary.length > 0) {
            const summaryText = `📄 **Import Success!**\n\nI've analyzed your document and updated your profiles:\n${uploadResult.summary.map(s => `• ${s}`).join('\n')}\n\nYou can now see these updates in your Dashboard and Transactions tabs.`;
            setMessages(prev => [...prev, { role: 'bot', text: summaryText, time: now() }]);
            
            // Refresh global data
            if (onRefreshData) onRefreshData();
          }
          
          context = `User uploaded a document (${prevFile.name}). Extracted data: ${JSON.stringify(uploadResult.extraction_result?.extracted_data || {})}`;
        } catch (err) {
          context = `User uploaded a file named: ${prevFile.name}. Scan unavailable.`;
        }
        setIsUploading(false);
      }

      let botText;
      if (getAuthToken()) {
        const response = await chatAPI.send(text || `Analyze document: ${prevFile?.name}`, context);
        botText = response.text;
      } else {
        botText = getLocalResponse(text);
      }

      setMessages(prev => [...prev, { role: 'bot', text: botText, time: now() }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: getLocalResponse(text),
        time: now(),
      }]);
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const handleChip = (chip) => {
    const clean = chip.replace(/^[\p{Emoji}\s]+/u, '').trim();
    setInput(clean);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = async () => {
    setMessages([{
      role: 'bot',
      text: "Chat cleared! I'm your AI Money Mentor. How can I help you today?",
      time: now(),
    }]);
    try { await chatAPI.clearHistory(); } catch {}
  };

  return (
    <div className="flex flex-col h-full bg-[#f7f8fc]" style={{ minHeight: 0 }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-base">AI Money Mentor</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-xs text-gray-500">
                {getAuthToken() ? 'Powered by Llama 3 · Your profile loaded' : 'Demo mode — sign in for personalized analysis'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleClear}
          title="Clear chat"
          className="p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer text-gray-400 hover:text-gray-700"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}

        {isLoading && (
          <div className="flex gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-white" />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-purple-500" />
                <span className="text-xs text-gray-500">
                  {isUploading ? 'Scanning document...' : 'Thinking...'}
                </span>
              </div>
              <div className="flex gap-1 mt-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick chips */}
      <div className="px-6 pb-2 flex gap-2 overflow-x-auto flex-shrink-0 scrollbar-hide">
        {QUICK_CHIPS.map(chip => (
          <button
            key={chip}
            onClick={() => handleChip(chip)}
            className="bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap hover:bg-[#013366] hover:text-white hover:border-[#013366] transition cursor-pointer flex-shrink-0 shadow-sm"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="flex-shrink-0 px-6 pb-6 pt-3">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          {/* File preview pill */}
          {filePreview && (
            <div className="px-4 pt-3 pb-1">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 text-xs font-medium text-blue-800">
                <FileText size={12} />
                <span className="truncate max-w-xs">{filePreview}</span>
                <button onClick={removeFile} className="hover:text-red-600 ml-1 cursor-pointer">
                  <X size={12} />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-end gap-2 p-3">
            {/* File upload */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-gray-400 hover:text-[#013366] hover:bg-gray-100 transition cursor-pointer flex-shrink-0"
              title="Upload Form 16, bank statement, CAS..."
            >
              <Paperclip size={20} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.txt,.csv"
              onChange={handleFileSelect}
            />

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your finances, upload a Form 16, bank statement..."
              rows={1}
              style={{ resize: 'none', minHeight: '40px', maxHeight: '120px' }}
              className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent leading-relaxed py-2 overflow-y-auto"
            />

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && !uploadedFile)}
              className={`p-2.5 rounded-xl transition cursor-pointer flex-shrink-0 ${
                (input.trim() || uploadedFile) && !isLoading
                  ? 'bg-[#013366] text-white hover:bg-[#01508a] shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-gray-400 mt-2">
          AI can make mistakes. Verify important financial decisions with a SEBI-registered advisor.
        </p>
      </div>
    </div>
  );
};

export default AIChatPage;
