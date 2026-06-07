import { Chunk } from "./store";
import crypto from "crypto";

const CHUNK_SIZE = 600; // words
const OVERLAP = 80; // words overlap between chunks

function words(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

export function chunkText(text: string, source: string, mentorId: string): Chunk[] {
  // Split by paragraphs first, then merge into chunks
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter((p) => p.length > 50);

  const chunks: Chunk[] = [];
  let buffer: string[] = [];
  let bufferWords = 0;

  const flushBuffer = () => {
    if (bufferWords < 50) return;
    const text = buffer.join("\n\n");
    const id = crypto.createHash("md5").update(`${mentorId}:${source}:${text.slice(0, 100)}`).digest("hex");
    chunks.push({ id, mentorId, source, text, tokens: Math.round(bufferWords * 1.3) });
    // Keep overlap
    const allWords = words(buffer.join(" "));
    const overlapWords = allWords.slice(-OVERLAP);
    buffer = [overlapWords.join(" ")];
    bufferWords = overlapWords.length;
  };

  for (const para of paragraphs) {
    const paraWords = words(para).length;
    if (bufferWords + paraWords > CHUNK_SIZE) {
      flushBuffer();
    }
    buffer.push(para);
    bufferWords += paraWords;
  }

  if (bufferWords > 50) flushBuffer();

  return chunks;
}

export async function chunkPdf(filePath: string, source: string, mentorId: string): Promise<Chunk[]> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require("fs");
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return chunkText(data.text, source, mentorId);
}

export function chunkMarkdown(text: string, source: string, mentorId: string): Chunk[] {
  return chunkText(text, source, mentorId);
}
