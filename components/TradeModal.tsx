import React, { useState, useEffect, useCallback } from 'react';
import { AssetClass, Order } from '../types';
import { getQuote, searchSymbols, checkApiKey, QuoteResult } from '../services/finnhubService';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecute: (order: Omit<Order, 'id' | 'status' | 'date'>) => void;
  initialSymbol?: string;
}

type TradeStep = 'INPUT' | 'PREVIEW' | 'SUCCESS';

const TradeModal: React.FC<TradeModalProps> = ({ isOpen, onClose, onExecute, initialSymbol }) => {
  const [step, setStep] = useState<TradeStep>('INPUT');
  const [symbol, setSymbol] = useState('');
  const [assetClass, setAssetClass] = useState<AssetClass>(AssetClass.STOCK);
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState(1);
  const [quoteData, setQuoteData] = useState<QuoteResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  
  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setStep('INPUT');
      setSymbol(initialSymbol || '');
      setQuantity(1);
      setQuoteData(null);
      setError('');
      setSearchResults([]);
      
      // If we have an initial symbol, fetch its quote immediately
      if (initialSymbol) {
          fetchQuote(initialSymbol);
      }
    }
  }, [isOpen, initialSymbol]);

  const fetchQuote = useCallback(async (sym: string) => {
    if (!sym) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await getQuote(sym);
      if (data && data.c > 0) {
        setQuoteData(data);
      } else {
        setError('Symbol not found or price unavailable.');
        setQuoteData(null);
      }
    } catch (err) {
      setError('Failed to fetch quote.');
      setQuoteData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (symbol.length > 1 && showSearch) {
      const timer = setTimeout(async () => {
        try {
          const res = await searchSymbols(symbol);
          if (res.result) setSearchResults(res.result.slice(0, 5));
        } catch(e) {}
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [symbol, showSearch]);

  const handlePreview = async () => {
    if (!symbol) return;
    await fetchQuote(symbol);
    if (!error) {
      setStep('PREVIEW');
    }
  };

  const handleConfirm = () => {
    if (!quoteData) return;
    onExecute({
      symbol: symbol.toUpperCase(),
      side,
      quantity,
      price: quoteData.c,
      assetClass
    });
    setStep('SUCCESS');
    setTimeout(() => {
        onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md z-50 overflow-hidden transform transition-all scale-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">
            {step === 'INPUT' && 'New Order'}
            {step === 'PREVIEW' && 'Order Preview'}
            {step === 'SUCCESS' && 'Order Submitted'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'INPUT' && (
            <div className="space-y-5">
              
              {/* Asset Class Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                 {Object.values(AssetClass).map(ac => (
                    <button
                        key={ac}
                        onClick={() => setAssetClass(ac)}
                        className={`flex-1 text-[10px] sm:text-xs font-semibold py-2 rounded-lg transition-all ${assetClass === ac ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {ac === AssetClass.MUTUAL_FUND ? 'MF' : ac}
                    </button>
                 ))}
              </div>

              {/* Symbol Input */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Asset Symbol</label>
                <input 
                  type="text"
                  value={symbol}
                  onChange={(e) => {
                      setSymbol(e.target.value);
                      setShowSearch(true);
                      setQuoteData(null); 
                  }}
                  onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                  placeholder="e.g. AAPL, BTC, SPY"
                  className="w-full text-lg font-bold uppercase bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-colors"
                />
                {showSearch && searchResults.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-slate-200 rounded-xl shadow-xl mt-2 max-h-48 overflow-y-auto divide-y divide-slate-50">
                        {searchResults.map((r, i) => (
                            <li key={i} className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                                onMouseDown={() => {
                                    setSymbol(r.symbol);
                                    setShowSearch(false);
                                    fetchQuote(r.symbol);
                                }}>
                                <span className="font-bold text-slate-800">{r.symbol}</span>
                                <span className="text-xs text-slate-500 truncate w-32 text-right">{r.description}</span>
                            </li>
                        ))}
                    </ul>
                )}
              </div>

              {/* Side & Quantity */}
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Action</label>
                    <div className="flex bg-slate-100 rounded-xl p-1">
                        <button onClick={() => setSide('BUY')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${side === 'BUY' ? 'bg-green-500 text-white shadow-sm' : 'text-slate-500'}`}>Buy</button>
                        <button onClick={() => setSide('SELL')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${side === 'SELL' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-500'}`}>Sell</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Quantity</label>
                    <input 
                        type="number"
                        min="0.000001"
                        value={quantity}
                        onChange={(e) => setQuantity(parseFloat(e.target.value))}
                        className="w-full text-lg font-bold bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                    />
                  </div>
              </div>

              {/* Live Quote Indicator */}
              {isLoading ? (
                  <div className="text-center text-sm text-slate-400 py-2">Fetching live price...</div>
              ) : quoteData ? (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex justify-between items-center">
                      <div>
                          <p className="text-xs text-blue-600 font-semibold uppercase">Current Price</p>
                          <p className="text-xl font-bold text-blue-800">${quoteData.c.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                          <p className={`text-sm font-bold ${quoteData.d >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                              {quoteData.d >= 0 ? '+' : ''}{quoteData.dp.toFixed(2)}%
                          </p>
                          <p className="text-[10px] text-blue-400">Finnhub Real-Time</p>
                      </div>
                  </div>
              ) : error ? (
                  <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>
              ) : null}

              <button 
                onClick={handlePreview}
                disabled={!symbol || quantity <= 0 || isLoading}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-4"
              >
                Preview Order
              </button>
            </div>
          )}

          {step === 'PREVIEW' && quoteData && (
              <div className="space-y-6">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                      <div className="flex justify-between">
                          <span className="text-slate-500">Symbol</span>
                          <span className="font-bold text-slate-900">{symbol.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="text-slate-500">Action</span>
                          <span className={`font-bold ${side === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>{side}</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="text-slate-500">Quantity</span>
                          <span className="font-bold text-slate-900">{quantity}</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="text-slate-500">Market Price</span>
                          <span className="font-bold text-slate-900">${quoteData.c.toFixed(2)}</span>
                      </div>
                       <div className="flex justify-between pt-3 border-t border-slate-200">
                          <span className="text-slate-800 font-bold">Estimated Total</span>
                          <span className="font-bold text-xl text-slate-900">${(quoteData.c * quantity).toFixed(2)}</span>
                      </div>
                  </div>
                  
                  <div className="flex gap-3">
                      <button onClick={() => setStep('INPUT')} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Back</button>
                      <button onClick={handleConfirm} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">Confirm Order</button>
                  </div>
              </div>
          )}

          {step === 'SUCCESS' && (
              <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Order Executed!</h4>
                  <p className="text-slate-500">Your {side.toLowerCase()} order for {symbol} has been placed.</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeModal;