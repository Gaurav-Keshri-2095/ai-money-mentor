import React from 'react';
import { Bell, Moon, ChevronDown } from 'lucide-react';

const TopHeader = ({ userName, onBackHome }) => {
  return (
    <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center justify-between w-full">
        <div className="md:hidden font-serif font-black flex items-center gap-2 text-2xl cursor-pointer" onClick={onBackHome}>
          <span className="bg-[#ed1c24] text-white px-1">ET</span>
          <span className="text-[#013366]">Mentor</span>
        </div>
        <div className="hidden md:block"></div>

        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-gray-600 hidden md:inline">Personal Account</span>
          <div className="flex items-center gap-1 text-sm font-medium text-gray-600 cursor-pointer hover:text-[#ed1c24]">
            English <ChevronDown size={14} />
          </div>
          <div className="h-6 w-px bg-gray-300"></div>
          <div className="flex items-center gap-4 text-gray-500">
            <Moon size={18} className="cursor-pointer hover:text-[#013366]" />
            <div className="relative cursor-pointer hover:text-[#013366]">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 bg-[#ed1c24] w-2 h-2 rounded-full border border-white"></span>
            </div>
          </div>
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
            <div className="bg-[#0055a5] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
              {(userName || 'U')[0].toUpperCase()}
            </div>
            <span className="text-sm font-bold text-gray-800 hidden md:block">{userName || 'User'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
