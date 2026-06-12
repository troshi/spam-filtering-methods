/**
 * preprocess.ts
 *
 * Pipeline de preprocesamiento de texto para filtrado de spam.
 *
 * Flujo completo:
 *   Texto original
 *     → 1. Lowercase          (minúsculas)
 *     → 2. Tokenization       (dividir en tokens, limpiar caracteres)
 *     → 3. Stopword Removal   (eliminar palabras vacías en inglés)
 *     → 4. Lemmatization      (normalización SMS + lema morfológico)
 *     → tokens finales
 *
 * La función `preprocessText` orquesta todos los pasos y los expone
 * de forma individual para que el visualizador pueda mostrar cada etapa.
 */

import { removeStopwords } from "./remove-stopwords";
import { normalizeAndLemmatize } from "./lemmatize";

// ── Paso 1 + 2: Lowercase + Tokenización ──────────────────────────────────────

/**
 * Convierte texto a minúsculas, elimina caracteres no alfanuméricos
 * y divide en tokens. Descarta tokens vacíos.
 *
 * Ejemplos:
 *   "Hello, World!"  → ["hello", "world"]
 *   "TF-IDF score"   → ["tf", "idf", "score"]
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()                        // Paso 1: lowercase
    .replace(/[^a-z0-9\s]/g, "")         // Eliminar puntuación y caracteres especiales
    .split(/\s+/)                         // Paso 2: split en whitespace
    .filter(Boolean);                     // Descartar tokens vacíos
}

// ── Pipeline completo ──────────────────────────────────────────────────────────

/** Resultado del pipeline con cada etapa expuesta para visualización */
export interface PreprocessResult {
  /** Texto original de entrada */
  original: string;
  /** Tokens tras lowercase + tokenización */
  tokens: string[];
  /** Tokens tras eliminar stopwords */
  withoutStopwords: string[];
  /** Tokens finales tras lematización + normalización SMS */
  lemmas: string[];
}

/**
 * Aplica el pipeline completo de preprocesamiento a un texto.
 *
 * Devuelve cada etapa intermedia para que el visualizador pueda
 * mostrar qué hace cada paso.
 *
 * @param text  Texto del mensaje SMS
 */
export function preprocessText(text: string): PreprocessResult {
  // Paso 1 + 2: Lowercase + Tokenización
  const tokens = tokenize(text);

  // Paso 3: Eliminación de stopwords
  const withoutStopwords = removeStopwords(tokens);

  // Paso 4: Normalización SMS + Lematización
  const lemmas = normalizeAndLemmatize(withoutStopwords);

  return { original: text, tokens, withoutStopwords, lemmas };
}

/**
 * Versión compacta: devuelve solo los lemas finales.
 * Es la función que usa `useTFIDF` como tokenizador.
 *
 * @param text  Texto del mensaje SMS
 */
export function preprocessToLemmas(text: string): string[] {
  return preprocessText(text).lemmas;
}
