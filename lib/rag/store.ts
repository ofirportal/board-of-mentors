import fs from "fs";
import path from "path";

export interface Chunk {
  id: string;
  mentorId: string;
  source: string; // book title or URL
  text: string;
  tokens: number;
}

export interface RagStore {
  mentorId: string;
  chunks: Chunk[];
  lastUpdated: string;
}

const RAG_DIR = path.join(process.cwd(), "data", "rag");

export function getRagPath(mentorId: string): string {
  return path.join(RAG_DIR, `${mentorId}.json`);
}

export function loadStore(mentorId: string): RagStore {
  const p = getRagPath(mentorId);
  if (!fs.existsSync(p)) return { mentorId, chunks: [], lastUpdated: "" };
  return JSON.parse(fs.readFileSync(p, "utf-8")) as RagStore;
}

export function saveStore(store: RagStore): void {
  if (!fs.existsSync(RAG_DIR)) fs.mkdirSync(RAG_DIR, { recursive: true });
  store.lastUpdated = new Date().toISOString();
  fs.writeFileSync(getRagPath(store.mentorId), JSON.stringify(store, null, 2));
}

export function addChunks(mentorId: string, newChunks: Chunk[]): void {
  const store = loadStore(mentorId);
  // Avoid duplicates by source+id
  const existing = new Set(store.chunks.map((c) => c.id));
  for (const chunk of newChunks) {
    if (!existing.has(chunk.id)) store.chunks.push(chunk);
  }
  saveStore(store);
}

export function hasRag(mentorId: string): boolean {
  const store = loadStore(mentorId);
  return store.chunks.length > 0;
}
