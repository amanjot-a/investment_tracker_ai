import React from 'react';
import { PortfolioState } from '../types';

interface PortfolioSummaryWidgetProps {
  portfolio: PortfolioState;
}

const PortfolioSummaryWidget: React.FC<PortfolioSummaryWidgetProps> = ({ portfolio }) => {
  const totalValue = portfolio.cash + portfolio.holdings.reduce((sum, h) => sum + (h.quantity * h.currentPrice), 0);
  
  // Find top mover (mock calculation since we don't track historical performance per holding in this simple state yet)
  // In a real app, we'd compare currentPrice vs previousClose or avgPrice
  const topMover = portfolio.holdings.reduce((prev, current) => {
    const prevGain = (prev.currentPrice - prev.avgPrice) / prev.avgPrice;
    const currentGain = (current.currentPrice - current.avgPrice) / current.avgPrice;
    return (currentGain > prevGain) ? current : prev;
  }, portfolio.holdings[0]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-4 flex flex-wrap gap-4 items-center justify-between">
      <div>
        <p className="text-xs text-slate-500 font-medium uppercase">Total Portfolio Value</p>
        <h3 className="text-xl font-bold text-slate-900">
          ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h3>
      </div>
      
      <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

      <div>
        <p className="text-xs text-slate-500 font-medium uppercase">Cash Balance</p>
        <p className="text-lg font-semibold text-slate-800">
          ${portfolio.cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

      {topMover && (
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase">Top Performer</p>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">{topMover.symbol}</span>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
              {(((topMover.currentPrice - topMover.avgPrice) / topMover.avgPrice) * 100).toFixed(2)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioSummaryWidget;