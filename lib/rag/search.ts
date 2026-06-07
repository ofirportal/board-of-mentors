import { Chunk, loadStore } from "./store";

// Stopwords en español e inglés
const STOPWORDS = new Set([
  "el","la","los","las","un","una","unos","unas","de","del","en","con","por","para",
  "que","qué","es","son","se","su","sus","lo","le","les","me","te","nos","al","a",
  "como","más","pero","si","no","ya","hay","muy","todo","esto","esta","ese","esa",
  "the","a","an","and","or","but","in","on","at","to","for","of","is","are","was",
  "were","be","been","being","have","has","had","do","does","did","will","would",
  "could","should","may","might","not","it","its","this","that","they","them",
  "their","there","when","where","who","how","what","which","with","from","into",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-záéíóúüña-z0-9\s]/gi, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

function tfidfScore(queryTokens: string[], chunkText: string): number {
  const chunkTokens = tokenize(chunkText);
  const chunkSet = new Set(chunkTokens);
  let score = 0;
  for (const qt of queryTokens) {
    if (chunkSet.has(qt)) {
      // Term frequency in chunk
      const tf = chunkTokens.filter((t) => t === qt).length / chunkTokens.length;
      score += tf * 10; // weight for exact match
    } else {
      // Partial match (stemming shortcut)
      for (const ct of chunkSet) {
        if (ct.startsWith(qt.slice(0, 4)) || qt.startsWith(ct.slice(0, 4))) {
          score += 0.5;
          break;
        }
      }
    }
  }
  return score;
}

export interface SearchResult {
  chunk: Chunk;
  score: number;
}

export function searchChunks(mentorId: string, query: string, topK = 4): SearchResult[] {
  const store = loadStore(mentorId);
  if (store.chunks.length === 0) return [];

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const scored = store.chunks.map((chunk) => ({
    chunk,
    score: tfidfScore(queryTokens, chunk.text),
  }));

  return scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export function buildRagContext(results: SearchResult[]): string {
  if (results.length === 0) return "";
  const passages = results.map((r) => `[${r.chunk.source}]\n${r.chunk.text}`).join("\n\n---\n\n");
  return `\n\n[PASAJES RELEVANTES DE TUS LIBROS — usalos para fundamentar tu respuesta]\n${passages}\n[FIN DE PASAJES]`;
}
