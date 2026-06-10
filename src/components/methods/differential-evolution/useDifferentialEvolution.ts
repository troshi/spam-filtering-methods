/**
 * useDifferentialEvolution.ts
 *
 * Hook que encapsula toda la lógica del algoritmo DE y devuelve
 * un historial completo generación por generación.
 *
 * Operadores implementados:
 *  1. selectDistinctIndividuals — elige tres vectores base distintos al actual
 *  2. generateMutant            — mutación: a + F*(b - c)
 *  3. crossover                 — cruce binomial con tasa CR
 *  4. runDE                     — bucle principal que genera el historial
 *
 * El hook `useDifferentialEvolution` envuelve `runDE` en `useMemo` para
 * evitar recalcular si los parámetros no cambian.
 */

import { useMemo } from "react";
import type { DEParams, DEResult, GenerationRecord, VectorStep } from "./types";

// ── Utilidad: muestreo sin reemplazo ──────────────────────────────────────────

/**
 * Selecciona `size` elementos aleatorios de `array` sin repetir.
 * Usa el algoritmo de Fisher-Yates sobre una copia del arreglo.
 */
function sample<T>(array: T[], size: number): T[] {
  const shuffled = array.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, size);
}

// ── Operador: selección de vectores base ──────────────────────────────────────

/**
 * Selecciona tres índices distintos entre sí y distintos de `currentIndex`.
 * Devuelve los tres vectores base [a, b, c] junto con sus índices originales.
 */
function selectDistinctIndividuals(
  population: number[][],
  currentIndex: number
): { vectors: [number[], number[], number[]]; indices: [number, number, number] } {
  const indices = Array.from({ length: population.length }, (_, i) => i);
  indices.splice(currentIndex, 1); // Excluir el índice actual
  const [ia, ib, ic] = sample(indices, 3);
  return {
    vectors: [population[ia], population[ib], population[ic]],
    indices: [ia, ib, ic],
  };
}

// ── Operador: mutación ────────────────────────────────────────────────────────

/**
 * Genera el vector mutante aplicando la fórmula DE/rand/1:
 *   mutant[i] = a[i] + F * (b[i] - c[i])
 *
 * @param a  Vector base
 * @param b  Primer vector diferencia
 * @param c  Segundo vector diferencia
 * @param F  Factor de mutación (escala de la diferencia)
 */
function generateMutant(a: number[], b: number[], c: number[], F: number): number[] {
  return a.map((ai, i) => ai + F * (b[i] - c[i]));
}

// ── Operador: cruce binomial ──────────────────────────────────────────────────

/**
 * Combina el vector mutante con el vector objetivo usando cruce binomial.
 * Al menos un gen siempre viene del mutante (garantizado por `randIndex`).
 *
 * trial[i] = mutant[i]  si i === randIndex || random() < CR
 * trial[i] = target[i]  en caso contrario
 *
 * @param mutant  Vector mutante
 * @param target  Vector objetivo original
 * @param CR      Tasa de cruzamiento [0, 1]
 */
function crossover(mutant: number[], target: number[], CR: number): number[] {
  const randIndex = Math.floor(Math.random() * target.length);
  return target.map((ti, i) =>
    i === randIndex || Math.random() < CR ? mutant[i] : ti
  );
}

// ── Algoritmo principal ───────────────────────────────────────────────────────

/**
 * Ejecuta el algoritmo DE completo y registra cada paso.
 *
 * Por cada generación y por cada individuo registra:
 *  - Los vectores base seleccionados (a, b, c)
 *  - El vector mutante y el trial
 *  - El fitness del trial vs. el del target
 *  - El vector seleccionado para la siguiente generación
 *
 * Devuelve un `DEResult` con el historial completo y la mejor solución.
 */
function runDE(params: DEParams): DEResult {
  const { initialPopulation, maxGenerations, F, CR, objectiveFunction } = params;

  let population = initialPopulation.map((v) => [...v]); // copia profunda
  const generations: GenerationRecord[] = [];

  for (let gen = 0; gen < maxGenerations; gen++) {
    const steps: VectorStep[] = [];
    const offspring: number[][] = [];

    for (let i = 0; i < population.length; i++) {
      const target = population[i];

      // 1. Seleccionar tres vectores base distintos
      const { vectors: [a, b, c], indices: [ia, ib, ic] } =
        selectDistinctIndividuals(population, i);

      // 2. Generar mutante y trial
      const mutant = generateMutant(a, b, c, F);
      const trial = crossover(mutant, target, CR);

      // 3. Evaluar fitness
      const trialFitness = objectiveFunction(trial);
      const targetFitness = objectiveFunction(target);
      const improved = trialFitness < targetFitness;
      const selected = improved ? trial : target;

      offspring.push(selected);

      steps.push({
        index: i,
        target: [...target],
        baseIndices: [ia, ib, ic],
        a: [...a],
        b: [...b],
        c: [...c],
        mutant: [...mutant],
        trial: [...trial],
        trialFitness,
        targetFitness,
        selected: [...selected],
        improved,
      });
    }

    // Calcular mejor de la generación
    const fitnesses = offspring.map(objectiveFunction);
    const bestIdx = fitnesses.indexOf(Math.min(...fitnesses));

    generations.push({
      generation: gen,
      population: population.map((v) => [...v]),
      steps,
      bestFitness: fitnesses[bestIdx],
      bestVector: [...offspring[bestIdx]],
    });

    population = offspring;
  }

  // Mejor solución global
  const finalFitnesses = population.map(objectiveFunction);
  const bestIdx = finalFitnesses.indexOf(Math.min(...finalFitnesses));

  return {
    generations,
    bestSolution: population[bestIdx],
    bestFitness: finalFitnesses[bestIdx],
    dimensions: initialPopulation[0].length,
  };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Ejecuta el algoritmo DE y memoiza el resultado.
 * Solo recalcula si `params` cambia (referencia estable recomendada).
 */
export function useDifferentialEvolution(params: DEParams): DEResult {
  return useMemo(() => runDE(params), [params]);
}
