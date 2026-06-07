/**
 * Ingest PDFs into the RAG store.
 *
 * Usage:
 *   npx ts-node scripts/ingest.ts --mentor buffett --file ~/Books/buffett-letters.pdf --source "Cartas Berkshire 1977-2024"
 *   npx ts-node scripts/ingest.ts --mentor dalio --file ~/Books/principles.pdf --source "Principios - Ray Dalio"
 *   npx ts-node scripts/ingest.ts --mentor taleb --file ~/Books/antifragile.pdf --source "Antifrágil - Nassim Taleb"
 *
 * The mentor ID must match one of the mentor IDs in lib/mentors.ts
 */

import { chunkPdf } from "../lib/rag/chunk";
import { addChunks, loadStore } from "../lib/rag/store";

const args = process.argv.slice(2);
const get = (flag: string) => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : undefined;
};

const mentorId = get("--mentor");
const filePath = get("--file");
const source = get("--source") || filePath || "Unknown";

if (!mentorId || !filePath) {
  console.error("Uso: npx ts-node scripts/ingest.ts --mentor <id> --file <path.pdf> [--source <titulo>]");
  process.exit(1);
}

const VALID_MENTORS = [
  "buffett", "erdoes", "israbravo", "robbins", "naval",
  "tolle-dispenza", "hormozi", "dalio", "taleb", "attia", "housel", "voss"
];

if (!VALID_MENTORS.includes(mentorId)) {
  console.error(`Mentor inválido. Válidos: ${VALID_MENTORS.join(", ")}`);
  process.exit(1);
}

(async () => {
  console.log(`\nIngiriendo: ${filePath}`);
  console.log(`Mentor: ${mentorId} | Fuente: ${source}\n`);

  const chunks = await chunkPdf(filePath, source, mentorId);
  console.log(`Chunks generados: ${chunks.length}`);

  addChunks(mentorId, chunks);

  const store = loadStore(mentorId);
  console.log(`Total de chunks en store: ${store.chunks.length}`);
  console.log(`\nListo. Ahora ${mentorId} puede recuperar pasajes de "${source}" en cada conversación.\n`);
})();
