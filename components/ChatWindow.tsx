"use client";

import { useState, useRef, useEffect } from "react";
import { Mentor } from "@/lib/mentors";
import { Message } from "@/lib/memory";
import MessageBubble from "./MessageBubble";

interface Props {
  mentor: Mentor;
}

export default function ChatWindow({ mentor }: Props) {
  const [sessionMessages, setSessionMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Welcome message on mount
  const allMessages: Message[] = [
    { role: "assistant", content: mentor.welcomeMessage },
    ...sessionMessages,
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessionMessages, streamingContent]);

  const handleSend = async (text?: string) => {
    const content = text ?? input.trim();
    if (!content || isLoading) return;

    const userMessage: Message = { role: "user", content };
    const newSession = [...sessionMessages, userMessage];
    setSessionMessages(newSession);
    setInput("");
    setIsLoading(true);
    setStreamingContent("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorId: mentor.id,
          sessionMessages: newSession,
        }),
      });

      if (!response.ok) throw new Error("API error");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          setStreamingContent(accumulated);
        }
      }

      const assistantMessage: Message = { role: "assistant", content: accumulated };
      setSessionMessages([...newSession, assistantMessage]);
      setStreamingContent("");
    } catch (err) {
      console.error(err);
      setSessionMessages([
        ...newSession,
        { role: "assistant", content: "Hubo un error. Intentá de nuevo." },
      ]);
      setStreamingContent("");
    } finally {
      setIsLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        {allMessages.map((msg, i) => (
          <MessageBubble
            key={i}
            message={msg}
            accentColor={mentor.accentColor}
            mentorInitials={mentor.initials}
          />
        ))}

        {/* Streaming message */}
        {streamingContent && (
          <MessageBubble
            message={{ role: "assistant", content: streamingContent }}
            accentColor={mentor.accentColor}
            mentorInitials={mentor.initials}
            isStreaming
          />
        )}

        {/* Loading indicator */}
        {isLoading && !streamingContent && (
          <div className="flex gap-3">
            <div
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: `${mentor.accentColor}20`,
                border: `1px solid ${mentor.accentColor}40`,
                color: mentor.accentColor,
              }}
            >
              {mentor.initials}
            </div>
            <div
              className="px-4 py-3 rounded-2xl rounded-tl-sm"
              style={{ background: `${mentor.accentColor}12`, border: `1px solid ${mentor.accentColor}20` }}
            >
              <div className="flex gap-1.5 items-center h-5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: mentor.accentColor, animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      {sessionMessages.length === 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {mentor.quickQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-full border transition-all hover:opacity-100 opacity-70 text-left"
              style={{
                borderColor: `${mentor.accentColor}40`,
                color: mentor.accentColor,
                background: `${mentor.accentColor}10`,
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div
        className="px-4 py-3 border-t"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div
          className="flex gap-3 items-end rounded-xl px-4 py-3"
          style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={`Preguntale a ${mentor.name.split(" ")[0]}...`}
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-transparent text-white/85 text-sm placeholder-white/25 resize-none outline-none leading-relaxed"
            style={{ minHeight: "24px", maxHeight: "160px" }}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
            style={{
              background: mentor.accentColor,
            }}
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <p className="text-center text-white/15 text-xs mt-2">Enter para enviar · Shift+Enter para nueva línea</p>
      </div>
    </div>
  );
}
