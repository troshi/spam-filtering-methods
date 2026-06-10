/**
 * types.tsx
 *
 * Interfaces del módulo Evolución Diferencial (DE).
 *
 * Refleja la estructura de datos que produce el algoritmo paso a paso:
 *  - DEParams        : parámetros de configuración del algoritmo
 *  - VectorStep      : registro de un vector en una generación (mutación + cruce + selección)
 *  - GenerationRecord: estado completo de una generación
 *  - DEResult        : resultado final del algoritmo
 */

/** Parámetros de entrada del algoritmo DE */
export interface DEParams {
  /** Población inicial (matriz de individuos) */
  initialPopulation: number[][];
  /** Número máximo de generaciones */
  maxGenerations: number;
  /** Factor de mutación (escala de la diferencia) */
  F: number;
  /** Tasa de cruzamiento (probabilidad de tomar gen del mutante) */
  CR: number;
  /** Límites del espacio de búsqueda */
  bounds: { min: number[]; max: number[] };
  /** Función objetivo que se quiere minimizar */
  objectiveFunction: (x: number[]) => number;
}

/** Registro de la evolución de un vector individual en una generación */
export interface VectorStep {
  /** Índice del individuo en la población */
  index: number;
  /** Vector original en esta generación */
  target: number[];
  /** Índices de los tres vectores base usados en la mutación */
  baseIndices: [number, number, number];
  /** Vectores base seleccionados: a, b, c */
  a: number[];
  b: number[];
  c: number[];
  /** Vector mutante: a + F*(b - c) */
  mutant: number[];
  /** Vector de prueba (trial) resultado del cruce */
  trial: number[];
  /** Fitness del vector de prueba */
  trialFitness: number;
  /** Fitness del vector original */
  targetFitness: number;
  /** Vector seleccionado para la siguiente generación */
  selected: number[];
  /** Indica si el trial fue mejor que el target */
  improved: boolean;
}

/** Estado completo de una generación */
export interface GenerationRecord {
  /** Número de generación (0-indexed) */
  generation: number;
  /** Población al inicio de la generación */
  population: number[][];
  /** Detalle de cada vector en esta generación */
  steps: VectorStep[];
  /** Mejor fitness alcanzado en esta generación */
  bestFitness: number;
  /** Mejor vector de esta generación */
  bestVector: number[];
}

/** Resultado completo del algoritmo DE */
export interface DEResult {
  /** Historial de todas las generaciones */
  generations: GenerationRecord[];
  /** Mejor solución encontrada al final */
  bestSolution: number[];
  /** Fitness de la mejor solución */
  bestFitness: number;
  /** Dimensiones del vector solución */
  dimensions: number;
}
