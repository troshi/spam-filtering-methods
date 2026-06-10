/**
 * DifferentialEvolutionVisualizer.tsx
 *
 * Componente orquestador del visualizador de Evolución Diferencial.
 *
 * Responsabilidades:
 *  1. Definir (o recibir) los parámetros del algoritmo DE.
 *  2. Ejecutar `useDifferentialEvolution` que produce el historial completo.
 *  3. Mostrar estadísticas globales en el encabezado.
 *  4. Distribuir el historial a tres vistas a través de Tabs de antd:
 *       - ViewConvergence  → evolución del mejor fitness por generación
 *       - ViewPopulation   → población completa de una generación elegida
 *       - ViewVectors      → detalle de mutación/cruce de un vector concreto
 */

import { useMemo, useState } from "react";
import { Col, Row, Statistic, Tabs, Typography } from "antd";
import { useDifferentialEvolution } from "./useDifferentialEvolution.ts";
import ViewConvergence from "./ViewConvergence";
import ViewPopulation from "./ViewPopulation";
import ViewVectors from "./ViewVectors";
import { headerBlock, rootContainer, COLOR_IMPROVED, COLOR_NOT_IMPROVED } from "./styles";
import type { DEParams } from "./types";

const { Title, Text } = Typography;

// ── Función objetivo por defecto ───────────────────────────────────────────────
/**
 * Función de Booth (generalizada a 4 dimensiones):
 * f(x) = (x0 + 2x1 - 7)² + (2x0 + x1 - 5)² + (x2 + 2x3 - 7)² + (2x2 + x3 - 5)²
 * Mínimo global en (1, 3, 1, 3) → f = 0
 */
function defaultObjectiveFunction(x: number[]): number {
  return (
    Math.pow(x[0] + 2 * x[1] - 7, 2) +
    Math.pow(2 * x[0] + x[1] - 5, 2) +
    Math.pow(x[2] + 2 * x[3] - 7, 2) +
    Math.pow(2 * x[2] + x[3] - 5, 2)
  );
}

// ── Población inicial por defecto ──────────────────────────────────────────────
const DEFAULT_POPULATION: number[][] = [
  [0.1175009073114339, 0.34657359027997264, 0, 0],
  [0.1175009073114339, 0, 0.5198603854199589, 0],
  [0.1175009073114339, 0, 0, 0.5198603854199589],
  [0.1175009073114339, 0, 0, 0.34657359027997264],
  [0, 0.23104906018664842, 0, 0.3465735902799726],
  [0, 0, 0.3465735902799726, 0.5198603854199589],
  [0.1175009073114339, 0, 0, 0.5198603854199589],
  [0, 0, 0.46209812037329684, 0.6931471805599452],
];

// ── Props ──────────────────────────────────────────────────────────────────────
export interface DifferentialEvolutionVisualizerProps {
  /** Parámetros completos del algoritmo. Si se omiten se usan los valores por defecto. */
  params?: Partial<DEParams>;
}

/**
 * Punto de entrada del módulo Evolución Diferencial.
 */
export default function DifferentialEvolutionVisualizer({
  params: externalParams,
}: DifferentialEvolutionVisualizerProps) {
  const [activeTab, setActiveTab] = useState<string>("convergence");

  // Combinar parámetros externos con los valores por defecto
  const params: DEParams = useMemo(
    () => ({
      initialPopulation: DEFAULT_POPULATION,
      maxGenerations: 10,
      F: 0.8,
      CR: 0.5,
      bounds: { min: [-10, -10, -10, -10], max: [10, 10, 10, 10] },
      objectiveFunction: defaultObjectiveFunction,
      ...externalParams,
    }),
    [externalParams]
  );

  // Ejecutar el algoritmo (memoizado)
  const result = useDifferentialEvolution(params);

  const { generations, bestSolution, bestFitness } = result;
  const initialBestFitness = generations[0]?.bestFitness ?? 0;
  const improvement = initialBestFitness - bestFitness;

  const tabItems = [
    {
      key: "convergence",
      label: "Convergencia",
      children: <ViewConvergence generations={generations} />,
    },
    {
      key: "population",
      label: "Población",
      children: (
        <ViewPopulation
          generations={generations}
          objectiveFunction={params.objectiveFunction}
        />
      ),
    },
    {
      key: "vectors",
      label: "Detalle de vectores",
      children: (
        <ViewVectors generations={generations} F={params.F} CR={params.CR} />
      ),
    },
  ];

  return (
    <div style={rootContainer}>
      {/* Encabezado */}
      <div style={headerBlock}>
        <Title level={3} style={{ margin: "0 0 4px" }}>
          Evolución Diferencial
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {params.initialPopulation.length} individuos ·{" "}
          {params.maxGenerations} generaciones · F={params.F} · CR={params.CR} ·{" "}
          {params.initialPopulation[0].length} dimensiones
        </Text>
      </div>

      {/* Estadísticas globales */}
      <Row gutter={[16, 16]} style={{ marginBottom: "1.5rem" }}>
        <Col xs={12} sm={6}>
          <Statistic
            title="Mejor fitness"
            value={bestFitness}
            precision={6}
            valueStyle={{ color: COLOR_IMPROVED, fontSize: 16 }}
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            title="Fitness inicial"
            value={initialBestFitness}
            precision={6}
            valueStyle={{ fontSize: 16 }}
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            title="Mejora total"
            value={improvement}
            precision={6}
            valueStyle={{
              color: improvement > 0 ? COLOR_IMPROVED : COLOR_NOT_IMPROVED,
              fontSize: 16,
            }}
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            title="Mejor vector"
            value={`[${bestSolution.map((v) => v.toFixed(3)).join(", ")}]`}
            valueStyle={{ fontSize: 13, fontFamily: "monospace" }}
          />
        </Col>
      </Row>

      {/* Pestañas con las tres vistas */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        type="card"
        size="small"
      />
    </div>
  );
}
