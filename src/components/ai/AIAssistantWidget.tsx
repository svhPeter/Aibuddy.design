import { useState, useRef, useCallback } from "react";
import { Send, Bot, User, Loader2, X, Minimize2, Maximize2, AlertCircle } from "lucide-react";
import { chat, type ChatMessage } from "@/lib/ai/nvidia";
import { AI_MODELS, DEFAULT_CHAT_MODEL, getModelsForCapability } from "@/lib/ai/models";

type DisplayMessage = ChatMessage & { id: string };

let msgCounter = 0;
function nextId() {
  return `msg-${++msgCounter}`;
}

const SYSTEM_PROMPT = `You are AIBuddy, a helpful AI assistant on aibuddy.design — an engineering studio that builds web apps, mobile apps, SaaS, AI integrations, and 3D experiences. Be concise, friendly, and technical when needed. If someone asks about services, pricing, or project inquiries, guide them to the inquiry form or contact page.`;

export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([
    {
      id: nextId(),
      role: "assistant",
      content:
        "Hey! I'm the AIBuddy assistant. Ask me anything about our services, tools, or get help with a project idea.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_CHAT_MODEL);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const chatModels = getModelsForCapability("chat");

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 50);
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setError(null);
    const userMsg: DisplayMessage = { id: nextId(), role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    scrollToBottom();

    // Build message history for context (last 10 messages)
    const history: ChatMessage[] = messages
      .slice(-10)
      .map(({ role, content }) => ({ role, content }));
    history.push({ role: "user", content: trimmed });

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await chat({
        modelId: selectedModel,
        system: SYSTEM_PROMPT,
        messages: history,
        temperature: 0.7,
        signal: controller.signal,
      });

      const assistantMsg: DisplayMessage = {
        id: nextId(),
        role: "assistant",
        content: response.content,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const errorMessage =
        (err as Error).message || "Something went wrong. Try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      abortRef.current = null;
      scrollToBottom();
    }
  }, [input, isLoading, messages, selectedModel, scrollToBottom]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    setIsLoading(false);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#1a1a1a] text-white border-[3px] border-black flex items-center justify-center hover:bg-[#F9FF00] hover:text-black transition-all shadow-lg group"
        aria-label="Open AI Assistant"
      >
        <Bot size={24} className="group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  const widgetClasses = isExpanded
    ? "fixed inset-4 z-50"
    : "fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-48px)] h-[560px] max-h-[calc(100vh-100px)]";

  return (
    <div
      className={`${widgetClasses} bg-white border-[3px] border-black flex flex-col shadow-2xl`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1a] text-white border-b-[3px] border-black shrink-0">
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-[#F9FF00]" />
          <span className="font-oswald text-sm font-bold uppercase tracking-wider">
            AI Assistant
          </span>
          <span className="text-[10px] text-white/40 font-inter">
            {AI_MODELS[selectedModel]?.name}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:text-[#F9FF00] transition-colors"
            aria-label={isExpanded ? "Minimize" : "Maximize"}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setIsExpanded(false);
            }}
            className="p-1 hover:text-[#FF0004] transition-colors"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Model selector */}
      <div className="px-3 py-2 border-b-[3px] border-black bg-[#fafafa] shrink-0">
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="font-inter text-[11px] bg-transparent border-none outline-none cursor-pointer w-full text-[#1a1a1a]/70"
        >
          {chatModels.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} — {m.capabilities.join(", ")}
            </option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fafafa]"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${
              msg.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`w-7 h-7 shrink-0 flex items-center justify-center border-[2px] border-black ${
                msg.role === "user" ? "bg-[#F9FF00]" : "bg-[#1a1a1a] text-white"
              }`}
            >
              {msg.role === "user" ? (
                <User size={14} />
              ) : (
                <Bot size={14} />
              )}
            </div>
            <div
              className={`max-w-[80%] p-3 border-[2px] border-black font-inter text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#F9FF00] text-[#1a1a1a]"
                  : "bg-white text-[#1a1a1a]"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 shrink-0 flex items-center justify-center border-[2px] border-black bg-[#1a1a1a] text-white">
              <Bot size={14} />
            </div>
            <div className="p-3 border-[2px] border-black bg-white flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-[#1a1a1a]/50" />
              <span className="font-inter text-xs text-[#1a1a1a]/50">
                Thinking…
              </span>
              <button
                type="button"
                onClick={handleCancel}
                className="text-[#FF0004] font-oswald text-[10px] uppercase font-bold ml-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 border-[2px] border-[#FF0004] bg-red-50">
            <AlertCircle size={16} className="text-[#FF0004] shrink-0 mt-0.5" />
            <div>
              <p className="font-inter text-xs text-[#FF0004]">{error}</p>
              <p className="font-inter text-[10px] text-[#1a1a1a]/50 mt-1">
                The AI backend may not be configured yet. Check .env.example for
                setup instructions.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t-[3px] border-black p-3 bg-white shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything…"
            disabled={isLoading}
            className="flex-1 input-brutal text-sm py-2 px-3 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={isLoading || !input.trim()}
            className="btn-brutal btn-brutal-yellow px-3 py-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
