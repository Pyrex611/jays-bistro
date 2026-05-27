import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send } from 'lucide-react';
import { MENU_ITEMS } from '../data/menu.js';

const AIChatbot = ({ cart, setCart, isChatOpen, setIsChatOpen, CHATBOT_API_KEY, onCartUpdated }) => {
    const [chatHistory, setChatHistory] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isTyping]);

    const handleChatSend = async () => {
        if (!chatInput.trim()) return;
        const userMsg = { role: 'user', text: chatInput };
        
        setChatHistory(prev => [...prev, userMsg]);
        setChatInput('');
        setIsTyping(true);
    
        if (!CHATBOT_API_KEY || CHATBOT_API_KEY.includes('PLACEHOLDER')) {
            setTimeout(() => {
                setChatHistory(prev => [...prev, { 
                    role: 'model', 
                    text: "I'm currently in demo mode. Add your Gemini API key in the configuration to activate my brain. I recommend the Party Jollof Rice!" 
                }]);
                setIsTyping(false);
            }, 1500);
            return;
        }
        
        try {
            const systemPrompt = `You are Jay's Bistro's virtual concierge.
            Your job is to assist customers with their orders, answer menu questions, and manage their cart. Keep responses short, elegant and very friendly.
            Menu:
            ${MENU_ITEMS.map(i => `ID ${i.id}: ${i.name} (₦${i.price})`).join('\n')}
            
            Current Cart:
            ${cart.length > 0 ? cart.map(i => `ID ${i.id}: ${i.name} (x${i.quantity})`).join('\n') : "Empty"}
            
            You MUST respond ONLY with a JSON object format. Do not use markdown tags like \`\`\`json. Only pure JSON string.
            {
              "message": "Your conversational reply here",
              "actions": [{"action": "add" | "remove", "id": number, "quantity": number}]
            }
            If no cart changes are needed, actions should be [].`;
    
            const contents = chatHistory.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.role === 'model' ? JSON.stringify({ message: msg.text, actions: [] }) : msg.text }]
            }));
            
            contents.push({ role: 'user', parts: [{ text: userMsg.text }] });
    
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${CHATBOT_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    contents,
                    generationConfig: { temperature: 0.2, responseMimeType: "application/json" }
                })
            });
    
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            const data = await response.json();
            
            const rawText = data.candidates[0].content.parts[0].text;
            const cleanText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanText);
    
            if (parsed.actions && parsed.actions.length > 0) {
                setCart(prevCart => {
                    let newCart = [...prevCart];
                    parsed.actions.forEach(action => {
                        const item = MENU_ITEMS.find(i => i.id === action.id);
                        if (!item) return;
                        
                        const existingIdx = newCart.findIndex(i => i.id === item.id);
                        if (action.action === 'add') {
                            if (existingIdx >= 0) {
                                newCart[existingIdx].quantity += action.quantity;
                            } else {
                                newCart.push({ ...item, quantity: action.quantity });
                            }
                        } else if (action.action === 'remove') {
                            if (existingIdx >= 0) {
                                newCart[existingIdx].quantity -= action.quantity;
                                if (newCart[existingIdx].quantity <= 0) {
                                    newCart.splice(existingIdx, 1);
                                }
                            }
                        }
                    });
                    return newCart;
                });
                onCartUpdated(); 
            }
    
            setChatHistory(prev => [...prev, { role: 'model', text: parsed.message }]);
    
        } catch (error) {
            console.error("Chat API Error:", error);
            setChatHistory(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting to my brain right now. Please try again." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            <button onClick={() => setIsChatOpen(!isChatOpen)} className={`fixed bottom-6 right-6 z-[70] p-4 rounded-full shadow-2xl transition-all duration-300 ${isChatOpen ? 'bg-[var(--color-text)] text-[var(--color-bg)] scale-90' : 'bg-accent text-[#1A1A1A] hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] hover:scale-110'}`}>
                {isChatOpen ? <X size={24} /> : <Bot size={28} />}
            </button>

            {isChatOpen && (
                <div className="fixed bottom-24 right-6 z-[70] w-[90vw] max-w-sm bg-[var(--color-bg-secondary)] shadow-2xl rounded-2xl overflow-hidden border border-[var(--color-border)] flex flex-col animate-[fadeIn_0.3s_ease-out]">
                     
                     <div className="p-4 flex justify-between items-center bg-[var(--color-text)] text-[var(--color-bg)]">
                         <div className="flex items-center gap-2">
                             <Bot size={20} className="text-accent" />
                             <span className="font-serif italic font-bold text-lg">Jay's Concierge</span>
                         </div>
                         <span className="text-[9px] uppercase tracking-widest bg-green-500/20 text-green-400 px-2 py-1 rounded-full animate-pulse border border-green-500/30">Online</span>
                     </div>
                     
                     <div className="h-72 p-4 bg-[var(--color-bg)] overflow-y-auto custom-scrollbar flex flex-col">
                            {chatHistory.length === 0 && (
                                <div className="text-[var(--color-text-secondary)] text-center text-xs mt-6 px-4">
                                    Welcome! I can help you find dishes, build your order, or answer any questions about our menu.
                                </div>
                            )}
                            {chatHistory.map((msg, idx) => (
                                <div key={idx} className={`flex w-full mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 text-sm leading-relaxed rounded-2xl ${msg.role === 'user' ? 'bg-accent text-[#1A1A1A] rounded-br-sm' : 'bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text)] rounded-tl-sm shadow-sm'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex w-full mb-4 justify-start">
                                    <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] p-3 text-xs rounded-2xl rounded-tl-sm shadow-sm flex gap-1 items-center">
                                        <span className="animate-bounce">●</span><span className="animate-bounce" style={{animationDelay: '0.2s'}}>●</span><span className="animate-bounce" style={{animationDelay: '0.4s'}}>●</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                     </div>
                     
                     <div className="p-3 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] flex gap-2 items-center">
                         <input 
                            value={chatInput} 
                            onChange={(e) => setChatInput(e.target.value)} 
                            onKeyDown={(e) => e.key === 'Enter' && handleChatSend()} 
                            placeholder="E.g. Add 2 Jollof Rice..." 
                            className="flex-1 bg-[var(--color-bg)] px-4 py-2 rounded-full text-sm outline-none text-[var(--color-text)] border border-[var(--color-border)] focus:border-accent transition-colors placeholder:text-[var(--color-text-secondary)]/50" 
                         />
                         <button 
                            onClick={handleChatSend} 
                            disabled={!chatInput.trim() || isTyping}
                            className="p-2 bg-accent text-[#1A1A1A] rounded-full hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                         >
                             <Send size={18} className="ml-1" />
                         </button>
                     </div>
                </div>
            )}
        </>
    );
};

export default AIChatbot;