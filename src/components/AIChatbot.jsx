import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext.jsx';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { CHATBOT_API_KEY } from '../data/menu.js';

const AIChatbot = () => {
  const { isChatOpen, setIsChatOpen, products, cart, updateQuantity, addToCart } = useStore();
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'model',
      text: "Hello! I am Jay's Virtual Concierge. I can recommend dishes, answer ingredient questions, or add items directly to your tray!"
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  const handleSend = async () => {
    if (!chatInput.trim() || isTyping) return;
    const userText = chatInput.trim();
    setChatHistory(prev => [...prev, { role: 'user', text: userText }]);
    setChatInput('');
    setIsTyping(true);

    if (!CHATBOT_API_KEY || CHATBOT_API_KEY.includes('PLACEHOLDER')) {
      setTimeout(() => {
        let reply = "I recommend our wood-smoked Party Jollof Rice paired with the Classic Arabian Blend!";
        if (userText.toLowerCase().includes('shawarma')) {
          addToCart(21);
          reply = "I've added 1x Chicken Shawarma (SS) (₦3,500) to your tray!";
        } else if (userText.toLowerCase().includes('wing')) {
          addToCart(51);
          reply = "I've added our Bistro Chicken Wings (₦5,000) to your tray!";
        } else if (userText.toLowerCase().includes('jollof') || userText.toLowerCase().includes('add')) {
          addToCart(1);
          reply = "I've added 1x Party Jollof Rice (₦1,500) to your tray!";
        }
        setChatHistory(prev => [...prev, { role: 'model', text: reply }]);
        setIsTyping(false);
      }, 800);
      return;
    }

    try {
      const systemPrompt = `You are Jay's Bistro virtual concierge in Makurdi, Nigeria.
Menu Catalog:
${products.map(p => `ID ${p.id}: ${p.name} (₦${p.price}, ${p.category})`).join('\n')}

Current Cart:
${cart.length > 0 ? cart.map(i => `ID ${i.id}: ${i.name} (x${i.quantity})`).join('\n') : "Tray is empty"}

RESPOND ONLY with valid JSON:
{"message": "reply string", "actions": [{"action": "add"|"remove", "id": number, "quantity": number}]}`;

      const contents = chatHistory.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));
      contents.push({ role: 'user', parts: [{ text: userText }] });

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${CHATBOT_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: { temperature: 0.2, responseMimeType: "application/json" }
        })
      });

      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      const data = await res.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const clean = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(clean);

      if (parsed.actions && Array.isArray(parsed.actions)) {
        parsed.actions.forEach(act => {
          if (act.action === 'add') {
            updateQuantity(act.id, act.quantity || 1);
          } else if (act.action === 'remove') {
            updateQuantity(act.id, -(act.quantity || 1));
          }
        });
      }

      setChatHistory(prev => [...prev, { role: 'model', text: parsed.message || "I've updated that for you!" }]);
    } catch (e) {
      console.error("Chat error:", e);
      setChatHistory(prev => [...prev, { role: 'model', text: "I'm having a brief connection hitch, but our kitchen is ready for your order!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Reinstated Original Floating AI Concierge Button */}
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)} 
        aria-label="Open AI Concierge"
        className={`fixed bottom-6 right-6 z-30 p-4 rounded-full shadow-2xl transition-all duration-300 bg-[#1A1A1A] text-white hover:scale-110 hover:bg-stone-800 flex items-center justify-center border-2 border-bistro-500/50 ${
          isChatOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100 pointer-events-auto'
        }`}
      >
        <Bot size={26} className="text-bistro-300" />
      </button>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-3 pointer-events-none animate-[fadeIn_0.2s_ease-out]">
          <div
            onClick={() => setIsChatOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs pointer-events-auto"
          />

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200 flex flex-col h-[480px] pointer-events-auto"
          >
            {/* Header */}
            <div className="p-4 bg-stone-900 text-white flex justify-between items-center border-b border-bistro-900">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-bistro-600/30 text-bistro-400 flex items-center justify-center border border-bistro-500/40">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none">Jay's Concierge</h3>
                  <span className="text-[9px] uppercase tracking-wider text-bistro-300 font-semibold">
                    AI Food Assistant
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-stone-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-3 py-2 bg-stone-100 border-b border-stone-200 flex gap-1.5 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setChatInput("Add 1 Chicken Shawarma")}
                className="text-[10px] bg-white border border-stone-300 px-2.5 py-1 rounded-full text-stone-700 whitespace-nowrap hover:bg-bistro-50 hover:text-bistro-900"
              >
                + Shawarma
              </button>
              <button
                onClick={() => setChatInput("Add 1 Bistro Wings")}
                className="text-[10px] bg-white border border-stone-300 px-2.5 py-1 rounded-full text-stone-700 whitespace-nowrap hover:bg-bistro-50 hover:text-bistro-900"
              >
                + Chicken Wings
              </button>
              <button
                onClick={() => setChatInput("What tea pairs with Jollof?")}
                className="text-[10px] bg-white border border-stone-300 px-2.5 py-1 rounded-full text-stone-700 whitespace-nowrap hover:bg-bistro-50 hover:text-bistro-900"
              >
                Tea pairing
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 bg-stone-50 overflow-y-auto space-y-3 text-xs scrollbar-hide">
              {chatHistory.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[82%] p-3 rounded-2xl leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-bistro-700 text-white rounded-br-none'
                        : 'bg-white text-stone-800 border border-stone-200 shadow-sm rounded-bl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-stone-200 text-stone-400 p-2.5 rounded-2xl text-[11px] flex gap-1 items-center shadow-sm">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>●</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-2.5 bg-white border-t border-stone-200 flex gap-2">
              <input
                type="text"
                placeholder="Ask or say: 'Add 2 Chicken Shawarma'..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-stone-100 px-3.5 py-2 text-xs rounded-full outline-none focus:ring-1 focus:ring-bistro-500"
              />
              <button
                onClick={handleSend}
                disabled={!chatInput.trim() || isTyping}
                className="p-2 bg-stone-900 text-white rounded-full hover:bg-bistro-700 transition disabled:opacity-40"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;