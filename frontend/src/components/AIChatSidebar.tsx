"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, X, RotateCcw, Sparkles, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Language, translations } from "@/data/translations";
import { Column } from "@/types/kanban";
import { apiChatWithAI, ChatMessage } from "@/lib/api";

interface MessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  actionsApplied?: number;
  isError?: boolean;
}

interface AIChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onBoardUpdate: (columns: Column[]) => void;
}

export const AIChatSidebar: React.FC<AIChatSidebarProps> = ({
  isOpen,
  onClose,
  language,
  onBoardUpdate,
}) => {
  const t = translations[language];
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom();
      }, 100);
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleSend = async (messageToSend?: string) => {
    const text = (messageToSend !== undefined ? messageToSend : input).trim();
    if (!text || isLoading) return;

    const userMessage: MessageItem = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
    };

    const newHistory: ChatMessage[] = messages
      .filter((m) => !m.isError)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMessage]);
    if (messageToSend === undefined) {
      setInput("");
    }
    setIsLoading(true);

    try {
      const result = await apiChatWithAI(text, newHistory);
      const assistantMessage: MessageItem = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: result.response,
        actionsApplied: result.actionsApplied,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (result.actionsApplied > 0 && result.columns.length > 0) {
        onBoardUpdate(result.columns);
      }
    } catch (err: any) {
      const errorMessage: MessageItem = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: err?.message || "An unexpected error occurred while processing your request.",
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  const isRtl = language === "fa";

  return (
    <aside
      className={`fixed top-0 bottom-0 z-40 w-full sm:w-[420px] bg-[#070b14]/95 backdrop-blur-md border-x border-[#00f0ff]/20 flex flex-col shadow-2xl transition-all duration-300 ${
        isRtl ? "left-0 border-r" : "right-0 border-l"
      }`}
      dir={isRtl ? "rtl" : "ltr"}
      data-testid="ai-chat-sidebar"
      aria-label="AI Assistant Sidebar"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#00f0ff]/15 bg-[#032147]/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30">
            <Bot className="w-5 h-5 text-[#00f0ff]" />
          </div>
          <div>
            <h2
              className="text-sm font-bold font-mono tracking-wider text-[#f1f5f9] flex items-center gap-2"
              data-testid="ai-sidebar-title"
            >
              {t.aiAssistant}
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-[#209dd7]/20 text-[#209dd7] border border-[#209dd7]/30">
                GPT-OSS
              </span>
            </h2>
            <p className="text-[11px] text-[#888888] font-mono">{t.aiSubtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded text-[#888888] hover:text-[#ecad0a] hover:bg-[#ecad0a]/10 transition-colors"
              title={t.aiClearChat}
              aria-label={t.aiClearChat}
              data-testid="ai-clear-chat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-[#888888] hover:text-[#f1f5f9] hover:bg-white/10 transition-colors"
            title={t.close}
            aria-label={t.close}
            data-testid="ai-close-sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2.5 bg-[#0a0e1a]/80 border-b border-[#00f0ff]/10 overflow-x-auto">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#888888] mb-1.5">
          <Sparkles className="w-3 h-3 text-[#ecad0a]" />
          <span>QUICK ACTIONS</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[t.aiQuickPrompt1, t.aiQuickPrompt2, t.aiQuickPrompt3].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => handleSend(prompt)}
              className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#121829] hover:bg-[#209dd7]/20 text-[#94a3b8] hover:text-[#00f0ff] border border-[#00f0ff]/20 transition-all text-left truncate max-w-full disabled:opacity-50 cursor-pointer"
              data-testid={`quick-prompt-${idx}`}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs"
        data-testid="ai-messages-container"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#888888]">
            <Bot className="w-12 h-12 text-[#209dd7]/40 mb-3" />
            <p className="font-semibold text-[#f1f5f9] mb-1">{t.aiAssistant}</p>
            <p className="text-[11px] leading-relaxed max-w-[280px]">
              {t.aiSubtitle}
            </p>
          </div>
        )}

        {messages.map((item) => (
          <div
            key={item.id}
            className={`flex flex-col ${item.role === "user" ? "items-end" : "items-start"}`}
            data-testid={`ai-message-${item.role}`}
          >
            <span className="text-[10px] text-[#888888] mb-1 font-mono uppercase px-1">
              {item.role === "user" ? "YOU" : "ASSISTANT"}
            </span>

            <div
              className={`p-3 rounded-lg max-w-[90%] break-words leading-relaxed whitespace-pre-wrap border ${
                item.role === "user"
                  ? "bg-[#121829] border-[#00f0ff]/30 text-[#f1f5f9]"
                  : item.isError
                  ? "bg-[#ff007f]/10 border-[#ff007f]/40 text-[#ff007f]"
                  : "bg-[#032147]/70 border-[#209dd7]/30 text-[#e2e8f0]"
              }`}
            >
              {item.isError && (
                <div className="flex items-center gap-1.5 mb-1.5 text-[#ff007f] font-bold">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>ERROR</span>
                </div>
              )}
              {item.content}

              {item.actionsApplied !== undefined && item.actionsApplied > 0 && (
                <div
                  className="mt-2.5 pt-2 border-t border-[#ecad0a]/20 flex items-center gap-1.5 text-[11px] text-[#ecad0a] font-bold"
                  data-testid="ai-actions-badge"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#ecad0a] shrink-0" />
                  <span>
                    [ +{item.actionsApplied} {t.aiAppliedBadge} ]
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div
            className="flex items-center gap-2 p-3 rounded-lg bg-[#032147]/60 border border-[#209dd7]/30 text-[#209dd7] w-fit"
            data-testid="ai-loading-indicator"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs font-mono">{t.aiThinking}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3.5 border-t border-[#00f0ff]/15 bg-[#0a0e1a]/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.aiPlaceholder}
            disabled={isLoading}
            className="flex-1 px-3 py-2 rounded bg-[#121829] border border-[#00f0ff]/30 text-xs font-mono text-[#f1f5f9] placeholder-[#888888] focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all disabled:opacity-50"
            data-testid="ai-input"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-3.5 py-2 rounded bg-[#753991] hover:bg-[#8e45b0] text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-[#753991]/20 cursor-pointer"
            data-testid="ai-send-btn"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.aiSend}</span>
          </button>
        </form>
      </div>
    </aside>
  );
};
