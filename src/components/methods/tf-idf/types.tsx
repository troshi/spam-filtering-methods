/**
 * types.tsx
 *
 * Interfaces del módulo TF-IDF.
 * Incluye los tipos para el pipeline de preprocesamiento completo.
 */

import type { PreprocessResult } from "../.././../utils/preprocess";

export type { PreprocessResult };

/** Documento de entrada con ID y texto original */
export interface Document {
  id: number;
  text: string;
}

/** Puntuación TF-IDF de un término en un documento */
export interface TermScore {
  term: string;
  score: number;
  tf: number;
  idf: number;
}

/** Frecuencia de término para la vista TF */
export interface TermTF {
  term: string;
  tf: number;
}

/**
 * Resultado completo del cálculo TF-IDF.
 * Incluye las etapas intermedias del pipeline para visualización.
 */
export interface TFIDFData {
  /** Vocabulario de lemas únicos ordenado alfabéticamente */
  allTerms: string[];
  /** Mapa TF por documento ({ lema → frecuencia normalizada }) */
  tfAll: Record<string, number>[];
  /** Mapa IDF global ({ lema → IDF }) */
  idfMap: Record<string, number>;
  /** Document Frequency por lema ({ lema → nº documentos que lo contienen }) */
  dfMap: Record<string, number>;
  /** Matriz TF-IDF: una entrada por documento ({ lema → TF×IDF }) */
  tfidfMatrix: Record<string, number>[];
  /** Valor TF-IDF máximo en toda la matriz (para normalizar barras) */
  maxTFIDF: number;
  /** Valor TF máximo global */
  maxTF: number;
  /** Valor IDF máximo global */
  maxIDF: number;
  /**
   * Etapas del pipeline por documento.
   * Índice i corresponde al documento i.
   * Expuesto para que el visualizador muestre cada paso del flujo.
   */
  pipelineSteps: PreprocessResult[];
}
