import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Send, X } from "lucide-react";
import { CHATBOT } from "../../config/site.js";
import { askConcierge } from "../../services/concierge.js";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.js";
import { useEscapeKey } from "../../hooks/useEscapeKey.js";
import { track } from "../../lib/track.js";

const ERROR_MESSAGE = "I'm having trouble connecting.";

/**
 * Floating AI concierge. Can answer menu questions and add/remove items from the tray
 * (via sanitised actions applied by the parent).
 */
export default function ChatWidget({ menuItems, byId, cartLines, onApplyActions }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  const close = useCallback(() => setOpen(false), []);
  useBodyScrollLock(open);
  useEscapeKey(open, close);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || typing) return;

    const history = messages;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setTyping(true);
    track("chat_message");

    try {
      const reply = await askConcierge({
        apiKey: CHATBOT.apiKey,
        model: CHATBOT.model,
        menuItems,
        byId,
        cartLines,
        history,
        userText: text,
      });
      onApplyActions(reply.actions);
      setMessages((prev) => [...prev, { role: "model", text: reply.message }]);
    } catch (error) {
      console.error("Concierge error:", error);
      setMessages((prev) => [...prev, { role: "model", text: ERROR_MESSAGE }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      {/* Floating action button, aligned to the app frame */}
      <div
        className={`pointer-events-none fixed inset-x-0 bottom-0 z-30 transition-opacity ${open ? "opacity-0" : "opacity-100"}`}
        aria-hidden={open}
      >
        <div className="mx-auto flex max-w-md justify-end px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              track("chat_open");
            }}
            aria-label="Open AI concierge"
            tabIndex={open ? -1 : 0}
            className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink-800 text-sprout-200 shadow-fab transition hover:scale-105 hover:bg-ink-700 active:scale-95"
          >
            <Bot size={26} />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex animate-fade-in items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={close} />

          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Jay's AI concierge"
            className="relative flex h-[min(34rem,84svh)] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-ink-100 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sprout-200">
                  <Bot size={20} />
                </div>
                <div className="leading-tight">
                  <h3 className="font-display font-extrabold">Jay&apos;s AI</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-green-600">● Online</span>
                </div>
              </div>
              <button type="button" onClick={close} aria-label="Close chat" className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-100 transition hover:bg-ink-200">
                <X size={16} />
              </button>
            </header>

            <div role="log" aria-live="polite" className="scrollbar-hide flex flex-1 flex-col gap-3 overflow-y-auto bg-ink-50 p-4">
              {messages.length === 0 && (
                <div className="rounded-2xl border border-ink-100 bg-white p-4 text-sm text-ink-500 shadow-sm">
                  👋 Hi there! I can help you find dishes, build your order, or check your tray. Try saying:
                  <br />
                  <br />
                  <span className="font-bold text-ink-900">&quot;Add a Jollof Rice&quot;</span>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[82%] rounded-2xl p-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "rounded-br-sm bg-ink-800 text-white"
                        : "rounded-tl-sm border border-ink-200 bg-white text-ink-800 shadow-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {typing && <div className="ml-2 text-xs italic text-ink-400">Typing…</div>}
              <div ref={endRef} />
            </div>

            <div className="flex gap-2 border-t border-ink-100 bg-white p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask something…"
                aria-label="Message the concierge"
                // 16px prevents iOS Safari from zooming the page when the field is focused.
                className="flex-1 rounded-full bg-ink-100 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-sprout-300"
              />
              <button
                type="button"
                onClick={send}
                disabled={!input.trim() || typing}
                aria-label="Send message"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-800 text-white shadow-md transition hover:bg-ink-700 disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
