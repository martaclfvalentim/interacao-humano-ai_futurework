import { useState, useEffect, useRef } from "react";
import { Send, ArrowRight, Sparkles, User, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

const BACKEND = "http://localhost:3001";

export default function ChatScreen({ profile, skills, onComplete, onBack }) {
  const [messages, setMessages] = useState([]); // { role: "user"|"assistant", content: string }
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    sendToAI([]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendToAI = async (history) => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, messages: history }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const aiMsg = { role: "assistant", content: data.message };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I had trouble connecting. Please make sure the backend is running.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg = { role: "user", content: text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);

    await sendToAI(newHistory);
  };

  const handleDone = async () => {
    if (messages.length === 0) { onComplete({ preferences: {}, chatMessages: [] }); return; }
    try {
      const res = await fetch(`${BACKEND}/api/extract-preferences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      const data = await res.json();
      onComplete({ preferences: data.preferences || {}, chatMessages: messages });
    } catch {
      onComplete({ preferences: {}, chatMessages: messages });
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      {/* Back */}
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>
      )}
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Career Conversation</h2>
        <p className="text-sm text-muted-foreground">
          Fala livremente — adiciona contexto, faz perguntas ou diz o que é mais importante para ti.
        </p>
      </div>

      {/* Chat box */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden flex flex-col" style={{ height: "480px" }}>
        {/* Chat header */}
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">FutureWork</p>
            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Active
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === "assistant" ? "bg-primary" : "bg-secondary"}`}>
                  {msg.role === "assistant"
                    ? <Sparkles className="w-3.5 h-3.5 text-white" />
                    : <User className="w-3.5 h-3.5 text-muted-foreground" />
                  }
                </div>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "assistant"
                    ? "bg-secondary text-foreground rounded-tl-sm"
                    : "bg-primary text-primary-foreground rounded-tr-sm"
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}

            {loading && (
              <motion.div
                key="typing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-2.5"
              >
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="px-4 py-3 bg-secondary rounded-2xl rounded-tl-sm flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="Type your message…"
              className="flex-1 text-sm"
              disabled={loading}
            />
            <Button onClick={handleSend} size="icon" disabled={!input.trim() || loading}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Done button */}
      <Button onClick={handleDone} className="w-full h-12 text-base font-semibold gap-2">
        Done — show me job matches
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
