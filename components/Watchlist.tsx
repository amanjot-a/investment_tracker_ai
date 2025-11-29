import React, { useState, useEffect } from 'react';
import { getQuote, searchSymbols } from '../services/finnhubService';
import { addToWatchlist, removeFromWatchlist } from '../services/portfolioService';
import { PortfolioState } from '../types';

interface WatchlistProps {
  portfolio: PortfolioState;
  onRefresh: () => void;
}

const Watchlist: React.FC<WatchlistProps> = ({ portfolio, onRefresh }) => {
  const [quotes, setQuotes] = useState<Record<string, any>>({});
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadQuotes = async () => {
      if (portfolio.watchlist.length === 0) {
        if (isMounted) setQuotes({});
        return;
      }

      // Fetch all quotes in parallel for better performance
      const quotePromises = portfolio.watchlist.map(async (sym) => {
        try {
          const q = await getQuote(sym);
          return { symbol: sym, data: q };
        } catch (e) {
          console.error(`Error fetching quote for ${sym}:`, e);
          return { symbol: sym, data: null };
        }
      });

      const results = await Promise.all(quotePromises);
      
      if (isMounted) {
        const newQuotes: Record<string, any> = {};
        results.forEach(res => {
          if (res.data) {
            newQuotes[res.symbol] = res.data;
          }
        });
        setQuotes(newQuotes);
        setLastUpdated(new Date());
      }
    };

    loadQuotes();
    
    // Refresh every 15s
    const interval = setInterval(loadQuotes, 15000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [portfolio.watchlist]);

  const handleSearch = async (val: string) => {
    setSearch(val);
    if (val.length > 2) {
      try {
        const res = await searchSymbols(val);
        if (res.result) setResults(res.result.slice(0, 5));
      } catch (e) {}
    } else {
      setResults([]);
    }
  };

  const addSymbol = (sym: string) => {
    addToWatchlist(sym);
    setSearch('');
    setResults([]);
    onRefresh();
  };

  const removeSymbol = (sym: string) => {
    removeFromWatchlist(sym);
    onRefresh();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">My Watchlist</h2>
          {lastUpdated && (
            <span className="text-xs text-slate-400">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="flex items-center border border-slate-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Search to add symbol..." 
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full ml-2 focus:outline-none text-slate-700 uppercase"
            />
          </div>
          {/* Results Dropdown */}
          {results.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg shadow-lg mt-1 overflow-hidden">
              {results.map((r, i) => (
                <li 
                  key={i} 
                  onClick={() => addSymbol(r.symbol)}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center border-b border-slate-50 last:border-none"
                >
                  <div>
                    <span className="font-bold text-slate-800">{r.symbol}</span>
                    <span className="text-xs text-slate-500 ml-2">{r.description}</span>
                  </div>
                  <span className="text-blue-600 text-sm font-medium">+ Add</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* List */}
        <div className="divide-y divide-slate-50">
          {portfolio.watchlist.map((sym) => {
            const q = quotes[sym];
            const price = q ? q.c : 0;
            const change = q ? q.d : 0;
            const percent = q ? q.dp : 0;
            const isPos = change >= 0;

            return (
              <div key={sym} className="py-4 flex items-center justify-between group">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{sym}</h3>
                  <p className="text-xs text-slate-400">Stock</p>
                </div>
                
                <div className="text-right flex-1 mx-4">
                  {q ? (
                    <>
                      <div className="font-medium text-slate-900">${price.toFixed(2)}</div>
                      <div className={`text-xs font-semibold ${isPos ? 'text-green-500' : 'text-red-500'}`}>
                        {isPos ? '+' : ''}{change.toFixed(2)} ({isPos ? '+' : ''}{percent.toFixed(2)}%)
                      </div>
                    </>
                  ) : (
                    <div className="animate-pulse flex flex-col items-end gap-1">
                      <div className="h-4 w-16 bg-slate-200 rounded"></div>
                      <div className="h-3 w-12 bg-slate-100 rounded"></div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => removeSymbol(sym)}
                  className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  title="Remove from watchlist"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            );
          })}
          {portfolio.watchlist.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              Your watchlist is empty. Search above to add assets.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Watchlist;