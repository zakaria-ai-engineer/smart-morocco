import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { chatWithAI } from "../services/api";
import { IMAGES } from "../config/images";

export function ChatFloatingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([
    { role: "ai", content: "Hi! I'm your Morocco travel assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const response = await chatWithAI(userMessage);

      // Handle both object {reply: "..."} and plain string responses
      let replyText = "";
      if (typeof response === "string") {
        replyText = response;
      } else if (response && typeof response === "object" && "reply" in response) {
        replyText = response.reply;
      }

      if (replyText) {
        setMessages((prev) => [...prev, { role: "ai", content: replyText }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "ai", content: "Connection Failed: I'm currently unable to connect to the travel intelligence network." }
        ]);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown";
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: `API Error (${message}). I'm operating on curated knowledge only right now.` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="flex h-16 w-16 items-center justify-center rounded-full overflow-hidden p-0 shadow-[0_0_20px_rgba(8,145,178,0.4)] ring-2 ring-white/20 transition-shadow hover:shadow-[0_0_30px_rgba(8,145,178,0.6)]"
            aria-label="Open chat"
          >
            <img
              src={IMAGES.chatBotFallback}
              alt="Chat"
              className="w-full h-full object-cover rounded-full"
            />
          </motion.button>
        )}
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 z-[60] flex h-[550px] w-80 max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#020617]/95 shadow-2xl sm:w-96 backdrop-blur-xl ring-1 ring-white/5"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-morocco-primary to-slate-900 p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/20 ring-1 ring-cyan-500/30 overflow-hidden">
                  <img src={IMAGES.chatBotFallback} alt="AI Guide" className="w-10 h-10 object-cover rounded-full" />
                  <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-[#020617]" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">AI Travel Guide</h3>
                  <p className="text-[10px] text-cyan-400/80 font-medium uppercase tracking-wider">Online</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-md ${msg.role === "user"
                      ? "bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-br-none"
                      : "bg-slate-900/80 text-gray-200 border border-white/5 rounded-bl-none shadow-inner"
                      }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key="loading"
                  className="flex justify-start"
                >
                  <div className="max-w-[85%] rounded-2xl rounded-bl-none bg-slate-900/80 px-4 py-3 shadow-md border border-white/5">
                    <div className="flex gap-1.5">
                      {[0, 0.15, 0.3].map((delay, k) => (
                        <motion.div
                          key={k}
                          className="h-1.5 w-1.5 rounded-full bg-cyan-500/50"
                          animate={{ y: [0, -3, 0], opacity: [0.3, 1, 0.3] }}
                          transition={{ repeat: Infinity, duration: 0.8, delay }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              {/* Scroll anchor must be inside the scrollable container */}
              <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* Input Area */}
            <div className="border-t border-white/5 bg-[#020617] p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about Morocco..."
                  className="flex-1 rounded-full border border-white/10 bg-slate-900/50 px-4 py-2 text-[13px] text-white placeholder-gray-500 outline-none transition focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400 text-white transition-all disabled:opacity-50 hover:shadow-[0_0_15px_rgba(8,145,178,0.4)] active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 -rotate-45 ml-0.5 mt-0.5">
                    <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                  </svg>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
