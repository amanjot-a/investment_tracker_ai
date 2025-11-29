import React, { useEffect, useState } from 'react';
import { getMarketNews } from '../services/finnhubService';

const MarketDashboard: React.FC = () => {
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getMarketNews();
        if (Array.isArray(data)) {
          setNews(data.slice(0, 8));
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Indices Placeholders (Finnhub indices need paid usually, hardcoding visuals for demo layout or use simple quote if known) */}
        {['SPY', 'QQQ', 'DIA', 'IWM'].map(sym => (
          <div key={sym} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-700">{sym}</h3>
            <p className="text-xs text-slate-500">Market ETF</p>
            {/* We would fetch these real-time if we had unlimited API calls */}
            <div className="mt-2 text-lg font-semibold text-slate-900">--</div> 
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Market News</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {news.length > 0 ? news.map((item) => (
            <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="group block">
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-100 mb-3 relative">
                {item.image && <img src={item.image} alt="News" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                {!item.image && <div className="flex items-center justify-center h-full text-slate-300"><svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg></div>}
              </div>
              <p className="text-xs text-blue-600 font-semibold mb-1 uppercase">{item.source}</p>
              <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">{item.headline}</h3>
              <p className="text-xs text-slate-500 mt-2 line-clamp-3">{item.summary}</p>
            </a>
          )) : (
            <div className="col-span-4 text-center py-8 text-slate-400">Loading market news...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketDashboard;
