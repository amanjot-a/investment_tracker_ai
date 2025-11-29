import { Holding, Order, PortfolioState, AssetClass } from '../types';

// Initial state
const INITIAL_CASH = 100000;

const loadState = (): PortfolioState => {
  const saved = localStorage.getItem('investment_navigator_data');
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    cash: INITIAL_CASH,
    holdings: [],
    orders: [],
    watchlist: ['AAPL', 'NVDA', 'TSLA', 'BTC-USD'],
    netWorthHistory: []
  };
};

const saveState = (state: PortfolioState) => {
  localStorage.setItem('investment_navigator_data', JSON.stringify(state));
};

export const getPortfolio = (): PortfolioState => {
  return loadState();
};

export const executeOrder = (
  order: Omit<Order, 'id' | 'status' | 'date'>
): { success: boolean; message: string; newState?: PortfolioState } => {
  const state = loadState();
  const totalCost = order.price * order.quantity;

  if (order.side === 'BUY') {
    if (state.cash < totalCost) {
      return { success: false, message: 'Insufficient buying power' };
    }
    state.cash -= totalCost;

    const existingHoldingIndex = state.holdings.findIndex(h => h.symbol === order.symbol);
    if (existingHoldingIndex >= 0) {
      const h = state.holdings[existingHoldingIndex];
      const totalValue = h.avgPrice * h.quantity + totalCost;
      const newQuantity = h.quantity + order.quantity;
      state.holdings[existingHoldingIndex] = {
        ...h,
        quantity: newQuantity,
        avgPrice: totalValue / newQuantity,
        currentPrice: order.price // update with latest execution price
      };
    } else {
      state.holdings.push({
        symbol: order.symbol,
        quantity: order.quantity,
        avgPrice: order.price,
        currentPrice: order.price,
        name: order.symbol, // In a real app, fetch name
        assetClass: order.assetClass
      });
    }
  } else {
    const existingHolding = state.holdings.find(h => h.symbol === order.symbol);
    if (!existingHolding || existingHolding.quantity < order.quantity) {
      return { success: false, message: 'Insufficient holdings to sell' };
    }
    
    state.cash += totalCost;
    existingHolding.quantity -= order.quantity;
    
    // Remove if 0
    if (existingHolding.quantity <= 0) {
      state.holdings = state.holdings.filter(h => h.symbol !== order.symbol);
    }
  }

  const newOrder: Order = {
    ...order,
    id: Date.now().toString(),
    status: 'FILLED',
    date: new Date().toISOString()
  };

  state.orders.unshift(newOrder);
  saveState(state);
  return { success: true, message: 'Order executed', newState: state };
};

export const addToWatchlist = (symbol: string) => {
    const state = loadState();
    if(!state.watchlist.includes(symbol)) {
        state.watchlist.push(symbol);
        saveState(state);
    }
    return state;
}

export const removeFromWatchlist = (symbol: string) => {
    const state = loadState();
    state.watchlist = state.watchlist.filter(s => s !== symbol);
    saveState(state);
    return state;
}
