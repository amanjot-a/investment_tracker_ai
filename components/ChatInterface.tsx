import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { PortfolioState } from '../types';
import PortfolioSummaryWidget from './PortfolioSummaryWidget';

interface ChatInterfaceProps {
  portfolio: PortfolioState;
  initialPrompt?: string;
  onBack?: () => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ portfolio, initialPrompt, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hello! I am your Investment AI Assistant. I can help you analyze your portfolio, suggest trades, or explain market concepts. How can I help today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialPrompt) {
        setInput(initialPrompt);
        if(inputRef.current) inputRef.current.focus();
    }
  }, [initialPrompt]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key missing");

      const ai = new GoogleGenAI({ apiKey });
      
      // Contextual prompt
      const context = `
        You are an expert financial AI assistant called Nav.AI.
        User Portfolio Context:
        Cash: $${portfolio.cash.toFixed(2)}
        Holdings: ${JSON.stringify(portfolio.holdings.map(h => ({
            symbol: h.symbol,
            qty: h.quantity,
            avg: h.avgPrice,
            curr: h.currentPrice,
            val: h.quantity * h.currentPrice,
            class: h.assetClass
        })))}
        Total Holdings Value: $${portfolio.holdings.reduce((acc, h) => acc + (h.quantity * h.currentPrice), 0).toFixed(2)}
        
        Answer the user's question based on this context if relevant. Keep answers concise, professional, and helpful.
        User Question: ${textToSend}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: context,
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || "I couldn't generate a response." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error connecting to the AI service. Please check your API Key." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "Analyze my portfolio diversity",
    "What is my best performing asset?",
    "Explain the risks of my crypto holdings",
    "Suggest a conservative ETF"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 relative">
      
      {/* Back Button Header for Chat */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shadow-sm z-10">
          {onBack && (
              <button 
                onClick={onBack}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
                title="Back to Portfolio"
              >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </button>
          )}
          <div>
            <h1 className="text-sm font-bold text-slate-800">AI Assistant</h1>
            <p className="text-[10px] text-green-500 font-medium">Online</p>
          </div>
      </div>

      {/* Portfolio Summary Widget at the top */}
      <div className="p-4 pb-0 max-w-4xl mx-auto w-full">
        <PortfolioSummaryWidget portfolio={portfolio} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          {/* Quick Prompts */}
          {messages.length < 3 && (
             <div className="flex gap-2 mb-3 overflow-x-auto pb-2 no-scrollbar">
               {quickPrompts.map((p, i) => (
                 <button 
                   key={i} 
                   onClick={() => handleSend(p)}
                   className="text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors"
                 >
                   {p}
                 </button>
               ))}
             </div>
          )}

          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your portfolio, markets, or specific symbols..."
              className="w-full bg-slate-100 border-0 rounded-xl px-4 py-3.5 pr-12 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
              disabled={isLoading}
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-2">AI-generated financial info may be inaccurate. Not investment advice.</p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;