import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { MENTORS, buildSystemPrompt } from "@/lib/mentors";
import { loadMemory, addConversation, updateSummary, Message } from "@/lib/memory";

export const maxDuration = 60;

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");
  return new GoogleGenAI({ apiKey });
}

export async function POST(req: NextRequest) {
  try {
    const { mentorId, sessionMessages } = await req.json();

    const mentor = MENTORS.find((m) => m.id === mentorId);
    if (!mentor) {
      return new Response(JSON.stringify({ error: "Mentor not found" }), { status: 404 });
    }

    const memory = await loadMemory(mentorId);
    const systemPrompt = buildSystemPrompt(mentor, memory.summary || undefined);

    const recentHistory = memory.conversations.length > 0
      ? memory.conversations.slice(-3).flatMap(c => c.messages).slice(-10)
      : [];
    const allMessages = [...recentHistory, ...sessionMessages];

    const deduped = allMessages.filter((msg: Message, i: number) => {
      if (i === 0) return true;
      return msg.role !== allMessages[i - 1].role;
    });

    const geminiMessages = deduped.map((m: Message) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const ai = getClient();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = "";

        try {
          const result = await ai.models.generateContentStream({
            model: "gemini-2.0-flash-lite",
            contents: geminiMessages,
            config: {
              systemInstruction: systemPrompt,
              maxOutputTokens: 800,
            },
          });

          for await (const chunk of result) {
            const text = chunk.text ?? "";
            if (text) {
              fullResponse += text;
              controller.enqueue(encoder.encode(text));
            }
          }

          const conversationToSave = [
            ...sessionMessages,
            { role: "assistant" as const, content: fullResponse },
          ];
          const updatedMemory = await addConversation(mentorId, conversationToSave);

          if (updatedMemory.conversationCount % 5 === 0) {
            generateSummary(mentorId, mentor.name, ai);
          }

          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("Route error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}

async function generateSummary(mentorId: string, mentorName: string, ai: GoogleGenAI) {
  const memory = await loadMemory(mentorId);
  if (memory.conversations.length === 0) return;

  const allText = memory.conversations
    .slice(-10)
    .flatMap((c) => c.messages)
    .map((m) => `${m.role === "user" ? "Alan" : mentorName}: ${m.content}`)
    .join("\n");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: `Resumí en 200 palabras qué aprendiste sobre Alan Naem a partir de estas conversaciones. Enfocate en: sus preocupaciones principales, decisiones que tomó, temas recurrentes, contexto personal relevante.\n\nConversaciones:\n${allText}`,
      config: {},
    });
    const summary = response.text ?? "";
    await updateSummary(mentorId, summary);
  } catch {
    // non-critical
  }
}
