import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext.jsx';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { CHATBOT_API_KEY } from '../data/menu.js';

const AIChatbot = () => {
  const { isChatOpen, setIsChatOpen, products, cart, updateQuantity, addToCart } = useStore();
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'model',
      text: "Hello! I am Jay's Virtual Concierge. I can suggest spice pairings, answer questions, or add dishes directly to your tray!"
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

    // Demo Mode Check if API key is not configured
    if (!CHATBOT_API_KEY || CHATBOT_API_KEY.includes('PLACEHOLDER')) {
      setTimeout(() => {
        let reply = "I highly recommend our wood-smoked Party Jollof Rice or the Basmati Fried Rice with grilled chicken!";
        if (userText.toLowerCase().includes('add') || userText.toLowerCase().includes('jollof')) {
          addToCart(1); // Auto-add Jollof
          reply = "I've added 1x Party Jollof Rice (₦1,500) to your tray for you!";
        } else if (userText.toLowerCase().includes('tea') || userText.toLowerCase().includes('arabian')) {
          addToCart(3);
          reply = "I've added our signature Classic Arabian Blend (₦3,000) to your tray!";
        }
        setChatHistory(prev => [...prev, { role: 'model', text: reply }]);
        setIsTyping(false);
      }, 900);
      return;
    }

    try {
      const systemPrompt = `You are Jay's Bistro's virtual concierge in Makurdi, Nigeria.
Assist customers with their orders, dietary queries, and add/remove dishes to their cart.
Menu Catalog:
${products.map(p => `ID ${p.id}: ${p.name} (₦${p.price}, ${p.category}) - ${p.description}`).join('\n')}

Current Cart:
${cart.length > 0 ? cart.map(i => `ID ${i.id}: ${i.name} (x${i.quantity})`).join('\n') : "Tray is empty"}

YOU MUST RESPOND ONLY with valid JSON (no markdown ticks):
{
  "message": "Your polite, warm reply here",
  "actions": [{"action": "add" | "remove", "id": number, "quantity": number}]
}`;

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
      setChatHistory(prev => [...prev, { role: 'model', text: "I'm having a brief connection hitch, but our kitchen is fully ready for your order!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Icon */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        aria-label="Open AI Concierge"
        className="fixed bottom-5 right-5 z-40 p-3.5 rounded-full bg-stone-900 text-white shadow-2xl hover:bg-caramel-600 transition-all active:scale-95 flex items-center justify-center border-2 border-caramel-400"
      >
        {isChatOpen ? <X size={22} /> : <Bot size={22} className="text-caramel-300" />}
      </button>

      {/* Slide-Up Chat Window */}
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
            <div className="p-4 bg-stone-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-caramel-500/20 text-caramel-400 flex items-center justify-center border border-caramel-500/40">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none">Jay's Concierge</h3>
                  <span className="text-[9px] uppercase tracking-wider text-caramel-300 font-semibold">
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

            {/* Quick Suggestions */}
            <div className="px-3 py-2 bg-stone-100 border-b border-stone-200 flex gap-1.5 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setChatInput("Add 1 Party Jollof Rice")}
                className="text-[10px] bg-white border border-stone-300 px-2.5 py-1 rounded-full text-stone-700 whitespace-nowrap hover:bg-caramel-50 hover:text-caramel-900"
              >
                + Party Jollof
              </button>
              <button
                onClick={() => setChatInput("What drinks pair well with Isi-Ewu?")}
                className="text-[10px] bg-white border border-stone-300 px-2.5 py-1 rounded-full text-stone-700 whitespace-nowrap hover:bg-caramel-50 hover:text-caramel-900"
              >
                Pairing for Isi-Ewu
              </button>
              <button
                onClick={() => setChatInput("Recommend vegetarian options")}
                className="text-[10px] bg-white border border-stone-300 px-2.5 py-1 rounded-full text-stone-700 whitespace-nowrap hover:bg-caramel-50 hover:text-caramel-900"
              >
                Veggie food
              </button>
            </div>

            {/* Message Thread */}
            <div className="flex-1 p-4 bg-stone-50 overflow-y-auto space-y-3 text-xs scrollbar-hide">
              {chatHistory.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[82%] p-3 rounded-2xl leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-caramel-600 text-white rounded-br-none'
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
                placeholder="Ask or say: 'Add 2 Basmati Rice'..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-stone-100 px-3.5 py-2 text-xs rounded-full outline-none focus:ring-1 focus:ring-caramel-500"
              />
              <button
                onClick={handleSend}
                disabled={!chatInput.trim() || isTyping}
                className="p-2 bg-stone-900 text-white rounded-full hover:bg-caramel-600 transition disabled:opacity-40"
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