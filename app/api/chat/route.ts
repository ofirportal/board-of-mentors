import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { MENTORS, buildSystemPrompt } from "@/lib/mentors";
import { loadMemory, addConversation, updateSummary, getRecentMessages } from "@/lib/memory";
import { searchChunks, buildRagContext, hasRag } from "@/lib/rag/index";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { mentorId, sessionMessages } = await req.json();

  const mentor = MENTORS.find((m) => m.id === mentorId);
  if (!mentor) {
    return new Response(JSON.stringify({ error: "Mentor not found" }), { status: 404 });
  }

  const memory = await loadMemory(mentorId);

  // RAG: retrieve relevant book passages for this query
  const lastUserMessage = sessionMessages.findLast((m: { role: string }) => m.role === "user");
  let ragContext: string | undefined;
  if (lastUserMessage && hasRag(mentorId)) {
    const results = searchChunks(mentorId, lastUserMessage.content, 4);
    if (results.length > 0) ragContext = buildRagContext(results);
  }

  const systemPrompt = buildSystemPrompt(mentor, memory.summary || undefined, ragContext);

  // Build context: recent history + current session
  const recentHistory = await getRecentMessages(mentorId, 10);
  const allMessages = [...recentHistory, ...sessionMessages];

  // Deduplicate consecutive same-role messages
  const deduped = allMessages.filter((msg: { role: string }, i: number) => {
    if (i === 0) return true;
    return msg.role !== allMessages[i - 1].role;
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = "";

      try {
        const anthropicStream = await client.messages.stream({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          system: systemPrompt,
          messages: deduped,
        });

        for await (const chunk of anthropicStream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            const text = chunk.delta.text;
            fullResponse += text;
            controller.enqueue(encoder.encode(text));
          }
        }

        // Save conversation
        const conversationToSave = [
          ...sessionMessages,
          { role: "assistant" as const, content: fullResponse },
        ];
        const updatedMemory = await addConversation(mentorId, conversationToSave);

        // Every 5 conversations, generate a summary
        if (updatedMemory.conversationCount % 5 === 0) {
          generateSummary(mentorId, mentor.name);
        }

        controller.close();
      } catch (err) {
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
}

async function generateSummary(mentorId: string, mentorName: string) {
  const memory = await loadMemory(mentorId);
  if (memory.conversations.length === 0) return;

  const allText = memory.conversations
    .slice(-10)
    .flatMap((c) => c.messages)
    .map((m) => `${m.role === "user" ? "Alan" : mentorName}: ${m.content}`)
    .join("\n");

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `Resumí en 200 palabras qué aprendiste sobre Alan Naem a partir de estas conversaciones. Enfocate en: sus preocupaciones principales, decisiones que tomó, temas recurrentes, contexto personal relevante. Usá primera persona del plural ("aprendimos", "Alan mencionó").\n\nConversaciones:\n${allText}`,
        },
      ],
    });
    const summary = response.content[0].type === "text" ? response.content[0].text : "";
    await updateSummary(mentorId, summary);
  } catch {
    // Summary generation is non-critical
  }
}
