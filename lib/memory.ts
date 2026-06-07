import { supabase } from "./supabase";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface Conversation {
  date: string;
  messages: Message[];
}

export interface MentorMemory {
  mentorId: string;
  conversations: Conversation[];
  summary: string;
  conversationCount: number;
}

export async function loadMemory(mentorId: string): Promise<MentorMemory> {
  const { data } = await supabase
    .from("mentor_memory")
    .select("*")
    .eq("mentor_id", mentorId)
    .single();

  if (!data) {
    return { mentorId, conversations: [], summary: "", conversationCount: 0 };
  }

  return {
    mentorId: data.mentor_id,
    conversations: data.conversations ?? [],
    summary: data.summary ?? "",
    conversationCount: data.conversation_count ?? 0,
  };
}

export async function saveMemory(memory: MentorMemory): Promise<void> {
  await supabase.from("mentor_memory").upsert({
    mentor_id: memory.mentorId,
    conversations: memory.conversations,
    summary: memory.summary,
    conversation_count: memory.conversationCount,
    updated_at: new Date().toISOString(),
  });
}

export async function addConversation(mentorId: string, messages: Message[]): Promise<MentorMemory> {
  const memory = await loadMemory(mentorId);

  memory.conversations.push({ date: new Date().toISOString(), messages });
  memory.conversationCount = (memory.conversationCount ?? 0) + 1;

  // Keep last 20 conversations
  if (memory.conversations.length > 20) {
    memory.conversations = memory.conversations.slice(-20);
  }

  await saveMemory(memory);
  return memory;
}

export async function updateSummary(mentorId: string, summary: string): Promise<void> {
  const memory = await loadMemory(mentorId);
  memory.summary = summary;
  await saveMemory(memory);
}

export async function getRecentMessages(mentorId: string, maxMessages = 10): Promise<Message[]> {
  const memory = await loadMemory(mentorId);
  if (memory.conversations.length === 0) return [];

  const recent = memory.conversations.slice(-3);
  const messages: Message[] = [];
  for (const conv of recent) {
    messages.push(...conv.messages);
  }
  return messages.slice(-maxMessages);
}
