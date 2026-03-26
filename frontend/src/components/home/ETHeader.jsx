import React from 'react';

const ETHeader = ({ onSignIn, onMentor, onHome }) => {
  return (
    <>
      {/* ET Premium Header */}
      <header className="bg-white px-4 md:px-6 pt-4 pb-2">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          <div className="flex items-center gap-2 md:gap-4 relative left-0 md:left-[10%]">
            <div className="bg-[#ed1c24] text-white font-serif font-bold text-3xl md:text-4xl px-3 py-1 flex items-center justify-center tracking-tighter">
              ET
            </div>
            <h1 className="text-4xl md:text-[54px] font-serif font-black tracking-tighter leading-none cursor-pointer" style={{ color: '#000000', fontFamily: "'Playfair Display', serif" }} onClick={onHome}>
              The Economic Times
            </h1>
          </div>
          <div className="hidden md:flex flex-col items-end gap-3 mt-1">
            <div className="flex gap-2 text-[11px] font-medium text-gray-800">
              <button className="border border-gray-400 px-3 py-1 hover:bg-gray-50 flex items-center justify-center cursor-pointer">My Watchlist</button>
              <button className="border border-gray-400 px-3 py-1 hover:bg-gray-50 flex items-center justify-center cursor-pointer">Subscribe</button>
              <button onClick={onSignIn} className="px-3 py-1 bg-transparent flex items-center justify-center text-sm font-bold border border-transparent hover:border-red-200 hover:text-red-600 transition cursor-pointer outline-none">Sign In</button>
            </div>
            <div className="text-[#a52a2a] font-bold text-[13px] tracking-wide flex items-center gap-1 cursor-pointer hover:underline">
              Financial Year End Offer <span className="text-lg leading-none font-normal">↗</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto text-center text-xs text-gray-500 font-medium mt-4 pb-3 border-b border-gray-200">
          English Edition ▾ | 27 March, 2026, 04:14 AM IST | <span className="font-bold text-black">Today's ePaper</span>
        </div>
      </header>

      {/* ET Navigation */}
      <nav className="bg-[#fdf1f1] border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-5 py-2 text-[13px] overflow-x-auto whitespace-nowrap no-scrollbar">
          <div className="flex items-center gap-3 border-r border-red-200 pr-4">
            <span className="font-bold text-lg leading-none cursor-pointer">≡</span>
            <span className="text-[#ed1c24] font-bold cursor-pointer" onClick={onHome}>Home</span>
          </div>
          <span className="text-gray-800 hover:text-red-600 font-medium flex items-center gap-1 cursor-pointer">
            <span className="text-white font-bold bg-[#ed1c24] rounded-sm w-4 h-4 flex items-center justify-center text-[9px]">ET</span>
            ETPrime
          </span>
          <span className="text-gray-800 hover:text-red-600 font-medium cursor-pointer">Markets</span>
          <span className="text-gray-800 hover:text-red-600 font-medium cursor-pointer flex items-center gap-1">📈 Market Data</span>
          <span className="text-[#a52a2a] font-bold cursor-pointer">Masterclass</span>
          <span className="text-gray-800 hover:text-red-600 font-medium cursor-pointer">IPO</span>
          <span className="text-gray-800 hover:text-red-600 font-medium cursor-pointer">News</span>
          <span className="text-gray-800 hover:text-red-600 font-medium cursor-pointer">Industry</span>
          <span className="text-gray-800 hover:text-red-600 font-medium cursor-pointer">SME</span>
          <span className="text-gray-800 hover:text-red-600 font-medium cursor-pointer">Politics</span>
          <span className="text-gray-800 hover:text-red-600 font-medium cursor-pointer">Wealth</span>
          <span className="text-gray-800 hover:text-red-600 font-medium cursor-pointer">MF</span>
          <button onClick={onMentor} className="bg-[#013366] text-white px-3 py-1 rounded-sm font-bold cursor-pointer hover:bg-blue-900 transition shadow-sm ml-auto flex items-center gap-2 outline-none">
            ⚡ AI MONEY MENTOR <span className="bg-red-500 text-[9px] px-1 rounded">BETA</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default ETHeader;
