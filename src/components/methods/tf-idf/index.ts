/**
 * index.ts — punto de entrada público del módulo TF-IDF.
 *
 * Exporta el componente principal y el hook de cálculo para uso externo.
 */

export { default as TFIDFVisualizer } from "./TFIDFVisualizer";
export { useTFIDF } from "./useTFIDF";
export type { TFIDFVisualizerProps } from "./TFIDFVisualizer";
export type { Document, TFIDFData, TermScore, TermTF } from "./types";
