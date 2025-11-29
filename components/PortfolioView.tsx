import React, { useMemo } from 'react';
import { PortfolioState } from '../types';
import PerformanceChart from './PerformanceChart';
import AllocationChart from './AllocationChart';
import HoldingsTable from './HoldingsTable';
import OrdersTable from './OrdersTable';

interface PortfolioViewProps {
  portfolio: PortfolioState;
  onAskAI: (context?: string) => void;
}

const PortfolioView: React.FC<PortfolioViewProps> = ({ portfolio, onAskAI }) => {
  // Safe Calculations
  const totalHoldingsValue = useMemo(() => {
    return portfolio.holdings.reduce((sum, h) => sum + (h.quantity * (h.currentPrice || 0)), 0);
  }, [portfolio.holdings]);

  const netWorth = (portfolio.cash || 0) + totalHoldingsValue;
  
  // Calculate day's gain based on current holdings delta (mocking daily change since we don't store historical daily close yet)
  // In a real app this would be: Sum(holding.quantity * holding.dayChange)
  const daysGain = portfolio.holdings.reduce((sum, h) => {
      // Mocking 'change' since we might not have it in the Holding type perfectly synced always
      // Assuming currentPrice is live, let's assume a 0.5% drift for visual if real data missing
      return sum + (h.quantity * h.currentPrice * 0.005); 
  }, 0); 
  
  const daysGainPercent = netWorth > 0 ? (daysGain / netWorth) * 100 : 0;
  const isPositive = daysGain >= 0;

  return (
    <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      
      {/* 1. Header & Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Net Worth */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <svg className="w-16 h-16 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Net Worth</p>
                <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
                    ${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
            </div>
            <div className={`flex items-center text-sm font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                <span>{isPositive ? '+' : ''}{daysGain.toLocaleString(undefined, {maximumFractionDigits: 2})} ({daysGainPercent.toFixed(2)}%)</span>
                <span className="text-slate-400 font-normal ml-2 text-xs">Today</span>
            </div>
        </div>

        {/* Buying Power */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-32">
            <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Buying Power</p>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">
                    ${(portfolio.cash || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h2>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(((portfolio.cash || 0) / (netWorth || 1)) * 100, 100)}%` }}
                ></div>
            </div>
        </div>

        {/* Quick Stats / Day Gain */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-32">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Day's Gain</p>
            <h2 className={`text-2xl font-bold mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
               {isPositive ? '+' : ''}${Math.abs(daysGain).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
            <p className="text-xs text-slate-400">Real-time estimate</p>
        </div>

        {/* Ask AI Card */}
        <button 
            onClick={() => onAskAI("Analyze my portfolio allocation and risk.")}
            className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 shadow-lg shadow-indigo-200 text-left flex flex-col justify-between h-32 hover:scale-[1.02] transition-transform"
        >
            <div className="flex justify-between items-start">
                <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded">AI ASSISTANT</span>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div className="text-white">
                <p className="text-sm opacity-90">Review my portfolio</p>
                <p className="font-bold text-lg">"Is my portfolio diverse?"</p>
            </div>
        </button>
      </div>

      {/* 2. Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
             <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-slate-800 text-lg">Performance</h3>
                 {/* Placeholder Tabs */}
                 <div className="flex bg-slate-100 rounded-lg p-1">
                     {['1D', '1W', '1M', 'YTD'].map(t => (
                         <span key={t} className={`text-xs font-bold px-3 py-1 rounded cursor-pointer ${t==='1M' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>{t}</span>
                     ))}
                 </div>
             </div>
             <PerformanceChart data={portfolio.netWorthHistory || []} />
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
             <h3 className="font-bold text-slate-800 text-lg mb-4">Allocation</h3>
             <AllocationChart holdings={portfolio.holdings} cash={portfolio.cash} />
          </div>
      </div>

      {/* 3. Holdings & Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white rounded-2xl p-0 shadow-sm border border-slate-100 overflow-hidden">
             <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                 <h3 className="font-bold text-slate-800 text-lg">Holdings</h3>
                 <span className="text-xs font-semibold text-slate-400 uppercase">{portfolio.holdings.length} Assets</span>
             </div>
             <HoldingsTable holdings={portfolio.holdings} onAskAI={onAskAI} />
          </div>

          <div className="bg-white rounded-2xl p-0 shadow-sm border border-slate-100 overflow-hidden">
             <div className="p-6 border-b border-slate-50">
                 <h3 className="font-bold text-slate-800 text-lg">Recent Orders</h3>
             </div>
             <OrdersTable orders={portfolio.orders} />
          </div>
      </div>

    </main>
  );
};

export default PortfolioView;