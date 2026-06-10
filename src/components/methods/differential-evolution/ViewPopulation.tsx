/**
 * ViewPopulation.tsx
 *
 * Vista "Población por generación".
 *
 * Muestra la población completa al inicio de cada generación:
 *  - Cada fila es un individuo (vector de dimensión D)
 *  - La columna "Fitness" muestra el valor de la función objetivo
 *  - La mejor fila de cada generación se resalta en verde
 *
 * Usa un Select de antd para elegir la generación a inspeccionar.
 */

import { useState } from "react";
import { Card, Select, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { GenerationRecord } from "./types";
import {
  COLOR_IMPROVED,
  COLOR_PRIMARY,
  vectorCell,
} from "./styles";

const { Text } = Typography;

export interface ViewPopulationProps {
  generations: GenerationRecord[];
  objectiveFunction: (x: number[]) => number;
}

/**
 * Renderiza la tabla de población de la generación seleccionada.
 * Resalta el mejor individuo (menor fitness) con fondo verde.
 */
export default function ViewPopulation({
  generations,
  objectiveFunction,
}: ViewPopulationProps) {
  const [selectedGen, setSelectedGen] = useState<number>(0);

  const record = generations[selectedGen];
  if (!record) return null;

  const dimensions = record.population[0].length;

  // Construir filas: { key, index, fitness, d0, d1, ... dN }
  const rows = record.population.map((vec, i) => {
    const fitness = objectiveFunction(vec);
    const row: Record<string, unknown> = { key: i, index: i, fitness };
    vec.forEach((v, d) => { row[`d${d}`] = v; });
    return row;
  });

  // Encontrar el índice del mejor individuo (menor fitness)
  const bestIdx = rows.reduce(
    (best, r, i) => ((r.fitness as number) < (rows[best].fitness as number) ? i : best),
    0
  );

  // Columnas dinámicas: índice + dimensiones + fitness
  const columns: ColumnsType<Record<string, unknown>> = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      width: 50,
      render: (v: number) => (
        <Text style={{ color: v === bestIdx ? COLOR_IMPROVED : COLOR_PRIMARY }}>
          x{v}
        </Text>
      ),
    },
    ...Array.from({ length: dimensions }, (_, d) => ({
      title: <Text style={{ color: COLOR_PRIMARY }}>d{d}</Text>,
      dataIndex: `d${d}`,
      key: `d${d}`,
      align: "right" as const,
      render: (v: number) => (
        <Text style={vectorCell}>{v.toFixed(6)}</Text>
      ),
    })),
    {
      title: "Fitness f(x)",
      dataIndex: "fitness",
      key: "fitness",
      align: "right",
      render: (v: number) => (
        <Text strong style={{ color: v === (rows[bestIdx].fitness as number) ? COLOR_IMPROVED : undefined, fontVariantNumeric: "tabular-nums" }}>
          {v.toFixed(6)}
        </Text>
      ),
    },
  ];

  const selectOptions = generations.map((g) => ({
    value: g.generation,
    label: `Generación ${g.generation} — mejor: ${g.bestFitness.toFixed(4)}`,
  }));

  return (
    <Card
      size="small"
      title={
        <Space wrap>
          <Text strong>Población</Text>
          <Select
            size="small"
            style={{ minWidth: 280 }}
            value={selectedGen}
            onChange={setSelectedGen}
            options={selectOptions}
          />
          <Tag color="green">
            Mejor fitness: {record.bestFitness.toFixed(6)}
          </Tag>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={rows}
        pagination={false}
        size="small"
        scroll={{ x: "max-content" }}
        rowClassName={(_, i) =>
          i === bestIdx ? "de-best-row" : ""
        }
        onRow={(_, i) => ({
          style: i === bestIdx
            ? { backgroundColor: "#f6ffed" }
            : {},
        })}
      />
    </Card>
  );
}
