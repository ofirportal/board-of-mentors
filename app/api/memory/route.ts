import { NextRequest, NextResponse } from "next/server";
import { loadMemory, saveMemory } from "@/lib/memory";

export async function GET(req: NextRequest) {
  const mentorId = req.nextUrl.searchParams.get("mentorId");
  if (!mentorId) {
    return NextResponse.json({ error: "mentorId required" }, { status: 400 });
  }
  const memory = await loadMemory(mentorId);
  return NextResponse.json(memory);
}

export async function DELETE(req: NextRequest) {
  const mentorId = req.nextUrl.searchParams.get("mentorId");
  if (!mentorId) {
    return NextResponse.json({ error: "mentorId required" }, { status: 400 });
  }
  await saveMemory({ mentorId, conversations: [], summary: "", conversationCount: 0 });
  return NextResponse.json({ ok: true });
}
