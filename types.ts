export enum AssetClass {
  STOCK = 'Stock',
  CRYPTO = 'Crypto',
  ETF = 'ETF',
  BOND = 'Bond',
  MUTUAL_FUND = 'Mutual Fund'
}

export interface Asset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  assetClass: AssetClass;
}

export interface Holding {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  name: string;
  assetClass: AssetClass;
}

export interface Order {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  status: 'FILLED' | 'PENDING' | 'CANCELLED';
  date: string; // ISO string
  assetClass: AssetClass;
}

export interface PortfolioState {
  cash: number;
  holdings: Holding[];
  orders: Order[];
  watchlist: string[];
  netWorthHistory: { date: string; value: number }[];
}

export type Tab = 'PORTFOLIO' | 'WATCHLIST' | 'DASHBOARD' | 'CHAT' | 'SCREENER';