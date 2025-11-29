import React from 'react';
import { Tab } from '../types';

interface TopNavProps {
  onMenuClick: () => void;
  activeTab: Tab;
  buyingPower: number;
  openTradeModal: () => void;
  openChat: () => void;
}

const TopNav: React.FC<TopNavProps> = ({ onMenuClick, activeTab, buyingPower, openTradeModal, openChat }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <h2 className="text-lg font-bold text-slate-800 hidden sm:block">
          {activeTab === 'PORTFOLIO' && 'Portfolio Overview'}
          {activeTab === 'WATCHLIST' && 'Watchlist'}
          {activeTab === 'DASHBOARD' && 'Market Dashboard'}
          {activeTab === 'SCREENER' && 'Market Screener'}
          {activeTab === 'CHAT' && 'AI Assistant'}
        </h2>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <div className="text-right hidden sm:block">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Buying Power</p>
          <p className="text-sm font-bold text-slate-900">${(buyingPower || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>

        <button 
          onClick={openTradeModal}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span>Trade</span>
        </button>
        
        <button 
          onClick={openChat}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors relative"
          title="Ask AI"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          {/* Notification Dot */}
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white"></span>
        </button>
      </div>
    </header>
  );
};

export default TopNav;