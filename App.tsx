import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import PortfolioView from './components/PortfolioView';
import Watchlist from './components/Watchlist';
import MarketDashboard from './components/MarketDashboard';
import ScreenerView from './components/ScreenerView';
import ChatInterface from './components/ChatInterface';
import TradeModal from './components/TradeModal';
import { Tab, PortfolioState, Order, AssetClass } from './types';
import { getPortfolio, executeOrder } from './services/portfolioService';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('PORTFOLIO');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [chatPrompt, setChatPrompt] = useState('');
  const [portfolio, setPortfolio] = useState<PortfolioState>({
    cash: 0,
    holdings: [],
    orders: [],
    watchlist: [],
    netWorthHistory: []
  });
  
  // Trade Modal Pre-fill
  const [tradeSymbol, setTradeSymbol] = useState('');
  // We can track asset class preference if we want, but TradeModal handles defaults well.

  // Load initial data
  useEffect(() => {
    refreshPortfolio();
  }, []);

  const refreshPortfolio = () => {
    setPortfolio(getPortfolio());
  };

  const handleTradeExecute = (order: Omit<Order, 'id' | 'status' | 'date'>) => {
    const result = executeOrder(order);
    if (result.success && result.newState) {
      setPortfolio(result.newState);
    } else {
      alert(result.message);
    }
  };

  const handleAskAI = (context?: string) => {
      if (context) {
          setChatPrompt(context);
      }
      setActiveTab('CHAT');
  };

  const openTradeWithSymbol = (symbol: string) => {
      setTradeSymbol(symbol);
      setIsTradeModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Sidebar (Drawer) */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative transition-all duration-300">
        
        <TopNav 
          onMenuClick={() => setIsSidebarOpen(true)}
          activeTab={activeTab}
          buyingPower={portfolio.cash}
          openTradeModal={() => {
              setTradeSymbol(''); // Reset symbol if opening manually
              setIsTradeModalOpen(true);
          }}
          openChat={() => setActiveTab('CHAT')}
        />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth no-scrollbar">
          {activeTab === 'PORTFOLIO' && (
            <PortfolioView 
              portfolio={portfolio} 
              onAskAI={handleAskAI} 
            />
          )}
          {activeTab === 'WATCHLIST' && (
            <Watchlist 
              portfolio={portfolio} 
              onRefresh={refreshPortfolio} 
            />
          )}
          {activeTab === 'DASHBOARD' && (
             <MarketDashboard />
          )}
          {activeTab === 'SCREENER' && (
             <ScreenerView 
                onOpenTrade={(symbol) => openTradeWithSymbol(symbol)}
             />
          )}
          {activeTab === 'CHAT' && (
            <ChatInterface 
                portfolio={portfolio} 
                initialPrompt={chatPrompt}
                onBack={() => setActiveTab('PORTFOLIO')}
            />
          )}
        </div>
      </div>

      {/* Trade Modal */}
      <TradeModal 
        isOpen={isTradeModalOpen} 
        onClose={() => setIsTradeModalOpen(false)}
        onExecute={handleTradeExecute}
        initialSymbol={tradeSymbol}
      />
    </div>
  );
}

export default App;