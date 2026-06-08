"use client";

import { Message } from "@/lib/memory";

interface Props {
  message: Message;
  accentColor: string;
  mentorInitials: string;
  isStreaming?: boolean;
}

export default function MessageBubble({ message, accentColor, mentorInitials, isStreaming }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      {!isUser && (
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{
            background: `${accentColor}18`,
            border: `1.5px solid ${accentColor}40`,
            color: accentColor,
          }}
        >
          {mentorInitials}
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser ? "rounded-tr-sm" : "rounded-tl-sm"
        }`}
        style={
          isUser
            ? { background: accentColor, color: "#ffffff" }
            : { background: "#ffffff", border: "1px solid rgba(0,0,0,0.07)", color: "#1a1a1a" }
        }
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {isStreaming && (
          <span
            className="inline-block w-1.5 h-4 ml-0.5 rounded-sm animate-pulse"
            style={{ background: accentColor }}
          />
        )}
      </div>
    </div>
  );
}
