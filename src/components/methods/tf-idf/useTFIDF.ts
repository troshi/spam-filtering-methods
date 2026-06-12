/**
 * useTFIDF.ts
 *
 * Hook que encapsula el cálculo TF-IDF completo con el pipeline de preprocesamiento.
 *
 * Pipeline aplicado por documento antes de calcular TF/IDF:
 *   Texto → Lowercase → Tokenización → Stopword Removal → Lemmatización → TF-IDF
 *
 * Funciones:
 *  - calcTF   : TF(t,d) = frecuencias de aparición normalizadas
 *  - calcIDF  : IDF(t)  = log(N / df(t))
 *
 * El hook devuelve `TFIDFData` enriquecido con las etapas del pipeline
 * para que el visualizador pueda mostrar cada paso.
 */

import { useMemo } from "react";
import { preprocessText, preprocessToLemmas } from "../../../utils/preprocess.ts";
import type { Document, TFIDFData } from "./types";

// ── Term Frequency ─────────────────────────────────────────────────────────────

/**
 * Calcula el TF de todos los lemas de un documento ya preprocesado.
 *
 * TF(t, d) = apariciones(t, d) / total de lemas en d
 *
 * @param lemmas  Lista de lemas resultante del pipeline
 */
function calcTF(lemmas: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const lemma of lemmas) {
    counts[lemma] = (counts[lemma] ?? 0) + 1;
  }
  const total = lemmas.length;
  const tf: Record<string, number> = {};
  for (const lemma in counts) {
    tf[lemma] = counts[lemma] / total;
  }
  return tf;
}

// ── Inverse Document Frequency ─────────────────────────────────────────────────

/**
 * Calcula el IDF de un término sobre la colección de documentos preprocesados.
 *
 * IDF(t) = log(N / df(t))
 *   N  = número total de documentos
 *   df = documentos que contienen el término
 *
 * @param term      Lema a evaluar
 * @param lemmasAll Array de lemas por documento
 */
function calcIDF(term: string, lemmasAll: string[][]): number {
  const df = lemmasAll.filter((lemmas) => lemmas.includes(term)).length;
  return df === 0 ? 0 : Math.log(lemmasAll.length / df);
}

// ── Hook principal ─────────────────────────────────────────────────────────────

/**
 * Calcula TF-IDF para una colección de documentos aplicando el pipeline completo.
 *
 * Retorna `TFIDFData`:
 *  - allTerms      : vocabulario de lemas únicos, ordenado alfabéticamente
 *  - tfAll         : array de mapas TF (por lemas), uno por documento
 *  - idfMap        : { lema → IDF }
 *  - dfMap         : { lema → document frequency }
 *  - tfidfMatrix   : array de mapas TF-IDF, uno por documento
 *  - maxTFIDF/maxTF/maxIDF : valores máximos para normalizar barras visuales
 *  - pipelineSteps : etapas del pipeline por documento (para el visualizador)
 */
export function useTFIDF(documents: Document[]): TFIDFData {
  return useMemo(() => {
    // ── Paso 1-4: Aplicar el pipeline completo a cada documento ──────────────
    const pipelineSteps = documents.map((doc) => preprocessText(doc.text));

    // Lemas finales por documento (entrada para TF-IDF)
    const lemmasAll: string[][] = pipelineSteps.map((s) => s.lemmas);

    // ── Vocabulario ───────────────────────────────────────────────────────────
    const allTerms = [...new Set(lemmasAll.flat())].sort();

    // ── TF por documento ──────────────────────────────────────────────────────
    const tfAll = lemmasAll.map(calcTF);

    // ── IDF global ────────────────────────────────────────────────────────────
    const idfMap = Object.fromEntries(
      allTerms.map((t) => [t, calcIDF(t, lemmasAll)])
    );

    // ── Document Frequency ────────────────────────────────────────────────────
    const dfMap = Object.fromEntries(
      allTerms.map((t) => [
        t,
        lemmasAll.filter((lemmas) => lemmas.includes(t)).length,
      ])
    );

    // ── Matriz TF-IDF: TF(t,d) × IDF(t) ─────────────────────────────────────
    const tfidfMatrix = lemmasAll.map((_, i) =>
      Object.fromEntries(
        allTerms.map((t) => [t, (tfAll[i][t] ?? 0) * idfMap[t]])
      )
    );

    // ── Valores máximos para escalar barras ───────────────────────────────────
    const maxTFIDF = Math.max(...tfidfMatrix.flatMap((row) => Object.values(row)));
    const maxTF    = Math.max(...tfAll.flatMap((row) => Object.values(row)));
    const maxIDF   = Math.max(...Object.values(idfMap));

    return {
      allTerms,
      tfAll,
      idfMap,
      dfMap,
      tfidfMatrix,
      maxTFIDF,
      maxTF,
      maxIDF,
      pipelineSteps,
    };
  }, [documents]);
}

// Exportar también la función de tokenización para uso externo
export { preprocessToLemmas as tokenize };
