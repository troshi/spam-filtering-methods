/**
 * useTFIDF.ts
 *
 * Hook personalizado que encapsula toda la lógica de cálculo TF-IDF.
 *
 * Funciones internas:
 *  - tokenize : convierte un texto en tokens limpios en minúsculas
 *  - calcTF   : calcula la frecuencia normalizada de cada término en un documento
 *  - calcIDF  : calcula la frecuencia inversa de documentos de un término
 *
 * El hook `useTFIDF`:
 *  - Recibe una lista de documentos
 *  - Devuelve un objeto `TFIDFData` con todas las métricas listas para renderizar
 *  - Usa `useMemo` para evitar recalcular si los documentos no cambian
 */

import { useMemo } from "react";
import type { Document, TFIDFData } from "./types";

// ── Tokenización ───────────────────────────────────────────────────────────────

/**
 * Convierte un texto en una lista de tokens:
 *  1. Pasa todo a minúsculas
 *  2. Elimina caracteres que no sean letras, dígitos o espacios
 *  3. Divide por espacios y descarta tokens vacíos
 *
 * Ejemplo: "Hello, World!" → ["hello", "world"]
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

// ── Term Frequency ─────────────────────────────────────────────────────────────

/**
 * Calcula el TF (Term Frequency) de todos los términos de un documento.
 *
 * TF(t, d) = (número de veces que t aparece en d) / (total de tokens en d)
 *
 * Devuelve: { término → frecuencia normalizada }
 */
function calcTF(doc: Document): Record<string, number> {
  const tokens = tokenize(doc.text);
  const counts: Record<string, number> = {};

  // Contar apariciones de cada token
  for (const token of tokens) {
    counts[token] = (counts[token] ?? 0) + 1;
  }

  const total = tokens.length;
  const tf: Record<string, number> = {};

  // Normalizar dividiendo entre el total de tokens
  for (const token in counts) {
    tf[token] = counts[token] / total;
  }

  return tf;
}

// ── Inverse Document Frequency ─────────────────────────────────────────────────

/**
 * Calcula el IDF (Inverse Document Frequency) de un término sobre una colección.
 *
 * IDF(t) = log(N / df(t))
 *   N   = número total de documentos
 *   df  = número de documentos que contienen el término
 *
 * Un IDF alto → término poco frecuente → alta capacidad discriminativa.
 * Devuelve 0 si el término no aparece en ningún documento.
 */
function calcIDF(term: string, documents: Document[]): number {
  const df = documents.filter((d) => tokenize(d.text).includes(term)).length;
  return df === 0 ? 0 : Math.log(documents.length / df);
}

// ── Hook principal ─────────────────────────────────────────────────────────────

/**
 * Calcula todas las métricas TF-IDF para una colección de documentos.
 *
 * Retorna `TFIDFData`:
 *  - allTerms     : vocabulario completo ordenado alfabéticamente
 *  - tfAll        : array de mapas TF, uno por documento
 *  - idfMap       : { término → IDF }
 *  - dfMap        : { término → document frequency }
 *  - tfidfMatrix  : array de mapas TF-IDF, uno por documento
 *  - maxTFIDF     : valor máximo en toda la matriz (para normalizar barras)
 *  - maxTF        : valor TF máximo global (para normalizar barras)
 *  - maxIDF       : valor IDF máximo global (para normalizar barras)
 */
export function useTFIDF(documents: Document[]): TFIDFData {
  return useMemo(() => {
    // Vocabulario: todos los tokens únicos de todos los documentos
    const allTerms = [
      ...new Set(documents.flatMap((d) => tokenize(d.text))),
    ].sort();

    // TF de cada documento
    const tfAll = documents.map(calcTF);

    // IDF de cada término del vocabulario
    const idfMap = Object.fromEntries(
      allTerms.map((t) => [t, calcIDF(t, documents)])
    );

    // Document Frequency de cada término
    const dfMap = Object.fromEntries(
      allTerms.map((t) => [
        t,
        documents.filter((d) => tokenize(d.text).includes(t)).length,
      ])
    );

    // Matriz TF-IDF: TF(t, d) × IDF(t) para cada (término, documento)
    const tfidfMatrix = documents.map((_, i) =>
      Object.fromEntries(
        allTerms.map((t) => [t, (tfAll[i][t] ?? 0) * idfMap[t]])
      )
    );

    // Valores máximos globales (usados para escalar las barras de progreso)
    const maxTFIDF = Math.max(
      ...tfidfMatrix.flatMap((row) => Object.values(row))
    );
    const maxTF = Math.max(...tfAll.flatMap((row) => Object.values(row)));
    const maxIDF = Math.max(...Object.values(idfMap));

    return {
      allTerms,
      tfAll,
      idfMap,
      dfMap,
      tfidfMatrix,
      maxTFIDF,
      maxTF,
      maxIDF,
    };
  }, [documents]);
}
