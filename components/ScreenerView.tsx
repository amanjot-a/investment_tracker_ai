import React, { useState, useEffect } from 'react';
import { AssetClass } from '../types';
import { getMultipleQuotes, searchSymbols, POPULAR_STOCKS, POPULAR_CRYPTO, POPULAR_ETFS, QuoteResult } from '../services/finnhubService';

interface ScreenerViewProps {
  onOpenTrade: (symbol: string, assetClass: AssetClass) => void;
}

type ScreenerTab = 'STOCKS' | 'CRYPTO' | 'ETFS';

interface ScreenerItem {
    symbol: string;
    description?: string;
    quote?: QuoteResult;
}

const ScreenerView: React.FC<ScreenerViewProps> = ({ onOpenTrade }) => {
  const [activeTab, setActiveTab] = useState<ScreenerTab>('STOCKS');
  const [items, setItems] = useState<ScreenerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [onlyPositive, setOnlyPositive] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    let symbols: string[] = [];
    
    if (activeTab === 'STOCKS') symbols = POPULAR_STOCKS;
    else if (activeTab === 'CRYPTO') symbols = POPULAR_CRYPTO;
    else if (activeTab === 'ETFS') symbols = POPULAR_ETFS;

    const quotes = await getMultipleQuotes(symbols);
    
    const newItems: ScreenerItem[] = symbols.map(sym => ({
        symbol: sym,
        quote: quotes[sym]
    }));
    
    setItems(newItems);
    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return loadData();
    
    setLoading(true);
    try {
        const res = await searchSymbols(searchQuery);
        if (res.result) {
            // Take top 5 and fetch quotes
            const symbols = res.result.slice(0, 5).map((r: any) => r.symbol);
            const quotes = await getMultipleQuotes(symbols);
            const newItems = res.result.slice(0, 5).map((r: any) => ({
                symbol: r.symbol,
                description: r.description,
                quote: quotes[r.symbol]
            }));
            setItems(newItems);
        }
    } catch(err) {
        console.error(err);
    }
    setLoading(false);
  };

  // Filter Logic
  const filteredItems = items.filter(item => {
      if (!item.quote) return false;
      const price = item.quote.c;
      const change = item.quote.dp;
      
      if (minPrice !== '' && price < minPrice) return false;
      if (maxPrice !== '' && price > maxPrice) return false;
      if (onlyPositive && change < 0) return false;
      
      return true;
  });

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden">
        
        {/* Sidebar Filters */}
        <div className="w-full lg:w-72 bg-white border-r border-slate-200 p-6 overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                Filters
            </h2>

            <div className="space-y-6">
                {/* Asset Class */}
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-3">Asset Class</label>
                    <div className="space-y-2">
                        {(['STOCKS', 'CRYPTO', 'ETFS'] as ScreenerTab[]).map(tab => (
                            <label key={tab} className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${activeTab === tab ? 'border-blue-600' : 'border-slate-300'}`}>
                                    {activeTab === tab && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                                </div>
                                <input type="radio" className="hidden" checked={activeTab === tab} onChange={() => { setActiveTab(tab); setSearchQuery(''); }} />
                                <span className={`text-sm font-medium ${activeTab === tab ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>{tab === 'ETFS' ? 'ETFs' : tab.charAt(0) + tab.slice(1).toLowerCase()}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Price Range */}
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-3">Price Range ($)</label>
                    <div className="flex items-center gap-2">
                        <input 
                            type="number" 
                            placeholder="Min" 
                            value={minPrice} 
                            onChange={e => setMinPrice(e.target.value ? parseFloat(e.target.value) : '')}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        />
                        <span className="text-slate-300">-</span>
                        <input 
                            type="number" 
                            placeholder="Max" 
                            value={maxPrice} 
                            onChange={e => setMaxPrice(e.target.value ? parseFloat(e.target.value) : '')}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                 {/* Performance */}
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-3">Performance</label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={onlyPositive} 
                            onChange={e => setOnlyPositive(e.target.checked)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-600">Only Positive Gainers</span>
                    </label>
                </div>

                <button 
                    onClick={() => { setMinPrice(''); setMaxPrice(''); setOnlyPositive(false); setSearchQuery(''); loadData(); }}
                    className="w-full py-2 text-sm font-bold text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    Reset All Filters
                </button>
            </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            {/* Search Bar */}
            <div className="p-6 bg-white border-b border-slate-200">
                <form onSubmit={handleSearch} className="relative max-w-2xl">
                    <svg className="w-5 h-5 absolute left-3 top-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search ${activeTab.toLowerCase()}...`}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
                    />
                </form>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto p-6">
                {loading ? (
                    <div className="space-y-4">
                        {[1,2,3,4,5].map(i => (
                            <div key={i} className="h-16 bg-white rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Symbol</th>
                                    <th className="px-6 py-4 text-right">Price</th>
                                    <th className="px-6 py-4 text-right">Change %</th>
                                    <th className="px-6 py-4 text-right">High/Low</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredItems.map(item => {
                                    if(!item.quote) return null;
                                    const isPos = item.quote.dp >= 0;
                                    return (
                                        <tr key={item.symbol} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${isPos ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {item.symbol.substring(0,2)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900">{item.symbol}</div>
                                                        <div className="text-xs text-slate-500">{item.description || activeTab}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-slate-900">
                                                ${item.quote.c.toFixed(2)}
                                            </td>
                                            <td className={`px-6 py-4 text-right font-bold ${isPos ? 'text-green-600' : 'text-red-600'}`}>
                                                {isPos ? '+' : ''}{item.quote.dp.toFixed(2)}%
                                            </td>
                                            <td className="px-6 py-4 text-right text-xs text-slate-500">
                                                H: {item.quote.h.toFixed(2)} / L: {item.quote.l.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => onOpenTrade(item.symbol, activeTab === 'CRYPTO' ? AssetClass.CRYPTO : (activeTab === 'ETFS' ? AssetClass.ETF : AssetClass.STOCK))}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
                                                >
                                                    Trade
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {filteredItems.length === 0 && (
                            <div className="p-8 text-center text-slate-400">
                                No assets found matching your filters.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default ScreenerView;