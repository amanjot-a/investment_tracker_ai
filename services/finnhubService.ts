// Finnhub API Service
const API_KEY = process.env.FINNHUB_API_KEY || 'd4j04b9r01queuaks1d0d4j04b9r01queuaks1dg';
const BASE_URL = 'https://finnhub.io/api/v1';

export const checkApiKey = (): boolean => {
  return !!API_KEY && API_KEY.length > 0;
};

// Helper to map common crypto symbols to Finnhub/Binance format
export const formatSymbolForFinnhub = (symbol: string): string => {
  const s = symbol.toUpperCase().trim();
  const cryptoMap: Record<string, string> = {
    'BTC': 'BINANCE:BTCUSDT',
    'ETH': 'BINANCE:ETHUSDT',
    'DOGE': 'BINANCE:DOGEUSDT',
    'SOL': 'BINANCE:SOLUSDT',
    'ADA': 'BINANCE:ADAUSDT',
    'XRP': 'BINANCE:XRPUSDT',
    'DOT': 'BINANCE:DOTUSDT',
    'BTC-USD': 'BINANCE:BTCUSDT',
    'ETH-USD': 'BINANCE:ETHUSDT'
  };

  return cryptoMap[s] || s;
};

export interface QuoteResult {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High
  l: number; // Low
  o: number; // Open
  pc: number; // Previous close
  t: number; // Timestamp
  source?: string;
}

export const getQuote = async (symbol: string): Promise<QuoteResult> => {
  if (!API_KEY) throw new Error("Missing Finnhub API Key");
  
  const formattedSymbol = formatSymbolForFinnhub(symbol);
  
  try {
    const response = await fetch(`${BASE_URL}/quote?symbol=${formattedSymbol}&token=${API_KEY}`);
    
    if (!response.ok) {
       throw new Error(`Failed to fetch quote for ${symbol}`);
    }

    const data = await response.json();
    
    // Finnhub returns 0s if symbol not found, but status 200.
    return {
      ...data,
      t: Date.now(), 
      source: 'Finnhub Real-Time'
    };
  } catch (error) {
    console.error("Quote fetch error:", error);
    return { c: 0, d: 0, dp: 0, h: 0, l: 0, o: 0, pc: 0, t: Date.now(), source: 'Error' };
  }
};

export const getMultipleQuotes = async (symbols: string[]): Promise<Record<string, QuoteResult>> => {
    const results: Record<string, QuoteResult> = {};
    // Fetch in parallel
    const promises = symbols.map(async (sym) => {
        try {
            const quote = await getQuote(sym);
            results[sym] = quote;
        } catch (e) {
            console.error(`Failed to load ${sym}`, e);
        }
    });
    await Promise.all(promises);
    return results;
}

export const searchSymbols = async (query: string) => {
  if (!API_KEY) throw new Error("Missing Finnhub API Key");
  const response = await fetch(`${BASE_URL}/search?q=${query}&token=${API_KEY}`);
  if (!response.ok) throw new Error("Failed to search symbols");
  return response.json();
};

export const getMarketNews = async (category: string = 'general') => {
  if (!API_KEY) throw new Error("Missing Finnhub API Key");
  const response = await fetch(`${BASE_URL}/news?category=${category}&token=${API_KEY}`);
  if (!response.ok) throw new Error("Failed to fetch news");
  return response.json();
};

export const getCompanyProfile = async (symbol: string) => {
    if (!API_KEY) throw new Error("Missing Finnhub API Key");
    const formattedSymbol = formatSymbolForFinnhub(symbol);
    const response = await fetch(`${BASE_URL}/stock/profile2?symbol=${formattedSymbol}&token=${API_KEY}`);
    if (!response.ok) return null; 
    return response.json();
};

// Default lists for Screener
export const POPULAR_STOCKS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'AMD', 'NFLX', 'INTC', 'DIS', 'JPM', 'V', 'PG'];
export const POPULAR_CRYPTO = ['BTC', 'ETH', 'DOGE', 'SOL', 'ADA', 'XRP', 'DOT', 'LTC', 'LINK', 'MATIC'];
export const POPULAR_ETFS = ['SPY', 'QQQ', 'DIA', 'IWM', 'VTI', 'VOO', 'IVV', 'ARKK', 'SMH'];