import React from 'react';
import { Holding } from '../types';

interface HoldingsTableProps {
  holdings: Holding[];
  onAskAI: (context: string) => void;
}

const HoldingsTable: React.FC<HoldingsTableProps> = ({ holdings, onAskAI }) => {
  if (!holdings || holdings.length === 0) {
    return (
        <div className="text-center py-12 text-slate-400">
            <p>No holdings yet. Start trading to build your portfolio.</p>
        </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left min-w-[600px]">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <th className="px-6 py-4">Symbol</th>
            <th className="px-4 py-4 text-right">Qty</th>
            <th className="px-4 py-4 text-right">Avg Cost</th>
            <th className="px-4 py-4 text-right">Price</th>
            <th className="px-4 py-4 text-right">Value</th>
            <th className="px-4 py-4 text-right">Return</th>
            <th className="px-4 py-4 text-center">AI</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {holdings.map((h) => {
             const value = h.quantity * h.currentPrice;
             const costBasis = h.quantity * h.avgPrice;
             const gain = value - costBasis;
             const gainPercent = costBasis > 0 ? (gain / costBasis) * 100 : 0;
             const isPositive = gain >= 0;

             return (
              <tr key={h.symbol} className="group hover:bg-blue-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800">{h.symbol}</div>
                  <div className="text-[10px] text-slate-500 bg-slate-100 inline-block px-1.5 py-0.5 rounded mt-1">{h.assetClass}</div>
                </td>
                <td className="px-4 py-4 text-right text-slate-600 font-medium">{h.quantity.toLocaleString()}</td>
                <td className="px-4 py-4 text-right text-slate-500">${h.avgPrice.toFixed(2)}</td>
                <td className="px-4 py-4 text-right text-slate-800 font-medium">${h.currentPrice.toFixed(2)}</td>
                <td className="px-4 py-4 text-right font-bold text-slate-900">${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className={`px-4 py-4 text-right font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  <div className="flex flex-col items-end">
                      <span>{isPositive ? '+' : ''}{gain.toFixed(2)}</span>
                      <span className="text-[10px] opacity-80">({isPositive ? '+' : ''}{gainPercent.toFixed(2)}%)</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                    <button 
                        onClick={() => onAskAI(`Analyze my ${h.symbol} holding. I bought at $${h.avgPrice.toFixed(2)} and now it is $${h.currentPrice.toFixed(2)}. Should I hold?`)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition-colors"
                        title="Ask AI about this position"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                    </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default HoldingsTable;