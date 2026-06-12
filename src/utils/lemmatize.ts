/**
 * lemmatize.ts
 *
 * Normalización de tokens SMS + lematización con wink-NLP.
 *
 * Pasos que realiza `normalizeAndLemmatize`:
 *  1. Sustituye abreviaturas SMS por su forma canónica (via smsDictionary)
 *  2. Lematiza cada token con el modelo wink-eng-lite-web-model
 *     (p.ej. "running" → "run", "better" → "good")
 *  3. Filtra tokens vacíos o undefined que puedan producirse
 *
 * Nota: wink-NLP procesa cada token como un mini-documento de una sola palabra.
 * Se llama a `its.lemma` sobre el primer (y único) token del doc resultante.
 */

import winkNLP from "wink-nlp";
import model from "wink-eng-lite-web-model";
import { smsDictionary } from "../data/sms-dictionary";

/** Instancia única del motor NLP (se carga el modelo una sola vez) */
const nlp = winkNLP(model);
const its = nlp.its;

/**
 * Sustituye abreviaturas SMS y lematiza una lista de tokens.
 *
 * @param tokens  Lista de tokens ya en minúsculas y sin stopwords
 * @returns       Lista de lemas en minúsculas, sin tokens vacíos
 */
export function normalizeAndLemmatize(tokens: string[]): string[] {
  return tokens
    .map((token) => {
      // 1. Sustituir abreviatura SMS si existe en el diccionario
      const normalized = smsDictionary[token.toLowerCase()] ?? token;

      // 2. Lematizar: wink-NLP procesa la palabra como un doc de un token
      const doc = nlp.readDoc(normalized);
      const tokenItems = doc.tokens();

      // Tomar el lema del primer token; si no hay resultado devuelve la forma normalizada
      const lemma = tokenItems.itemAt(0)?.out(its.lemma) as string | undefined;
      return lemma ?? normalized;
    })
    // 3. Descartar strings vacíos o undefined que puedan filtrarse
    .filter((t): t is string => typeof t === "string" && t.length > 0);
}
