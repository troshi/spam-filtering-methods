/**
 * ViewConvergence.tsx
 *
 * Vista "Convergencia".
 *
 * Tabla que resume la evolución del mejor fitness generación por generación.
 * Permite ver si el algoritmo converge (fitness disminuye) o se estanca.
 *
 * Columnas:
 *  - Generación
 *  - Mejor fitness (barra + valor)
 *  - Mejor vector (dimensiones colapsadas en Tags)
 *  - Mejoras en esa generación (cuántos trials fueron aceptados)
 */

import { Card, Progress, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { GenerationRecord } from "./types";
import {
  COLOR_IMPROVED,
  COLOR_NOT_IMPROVED,
  COLOR_PRIMARY,
  COLOR_WARNING,
  fitnessBarColor,
  vectorCell,
} from "./styles";

const { Text } = Typography;

export interface ViewConvergenceProps {
  generations: GenerationRecord[];
}

interface ConvergenceRow {
  key: number;
  generation: number;
  bestFitness: number;
  bestVector: number[];
  improvements: number;
}

/**
 * Renderiza la tabla de convergencia con barra de fitness coloreada
 * y conteo de mejoras por generación.
 */
export default function ViewConvergence({ generations }: ViewConvergenceProps) {
  if (generations.length === 0) return null;

  // Fitness máximo global para normalizar las barras de progreso
  const maxFitness = Math.max(...generations.map((g) => g.bestFitness));

  // Construir filas de datos
  const rows: ConvergenceRow[] = generations.map((g) => ({
    key: g.generation,
    generation: g.generation,
    bestFitness: g.bestFitness,
    bestVector: g.bestVector,
    improvements: g.steps.filter((s) => s.improved).length,
  }));

  const columns: ColumnsType<ConvergenceRow> = [
    {
      title: "Gen.",
      dataIndex: "generation",
      key: "generation",
      width: 60,
      render: (v: number) => <Text strong>{v}</Text>,
    },
    {
      title: "Mejor fitness",
      dataIndex: "bestFitness",
      key: "bestFitness",
      render: (v: number) => {
        const pct = maxFitness > 0 ? Math.round((v / maxFitness) * 100) : 0;
        const color = fitnessBarColor(v, maxFitness);
        return (
          <Space style={{ minWidth: 220 }}>
            <Progress
              percent={pct}
              showInfo={false}
              strokeColor={color}
              size="small"
              style={{ width: 120, margin: 0 }}
            />
            <Text
              style={{
                fontVariantNumeric: "tabular-nums",
                color,
                fontSize: 12,
                minWidth: 80,
              }}
            >
              {v.toFixed(6)}
            </Text>
          </Space>
        );
      },
    },
    {
      title: "Mejoras",
      dataIndex: "improvements",
      key: "improvements",
      width: 100,
      align: "center",
      render: (v: number, row: ConvergenceRow) => {
        const total = generations[0]?.steps.length ?? 1;
        const color =
          v === 0
            ? COLOR_NOT_IMPROVED
            : v === total
            ? COLOR_IMPROVED
            : COLOR_WARNING;
        return (
          <Tag color={color} style={{ fontVariantNumeric: "tabular-nums" }}>
            {v} / {total}
          </Tag>
        );
      },
    },
    {
      title: "Mejor vector",
      dataIndex: "bestVector",
      key: "bestVector",
      render: (vec: number[]) => (
        <Space wrap size={4}>
          {vec.map((v, i) => (
            <Tag
              key={i}
              style={{
                fontFamily: "monospace",
                ...vectorCell,
                background: `${COLOR_PRIMARY}12`,
                border: `1px solid ${COLOR_PRIMARY}44`,
                color: "#111",
                fontSize: 11,
              }}
            >
              d{i}: {v.toFixed(4)}
            </Tag>
          ))}
        </Space>
      ),
    },
  ];

  // Calcular cuánto mejoró el fitness respecto a la generación anterior
  const firstFitness = rows[0].bestFitness;
  const lastFitness = rows[rows.length - 1].bestFitness;
  const totalImprovement = firstFitness - lastFitness;

  return (
    <Card
      size="small"
      title={
        <Space wrap>
          <Text strong>Convergencia</Text>
          <Tag color={totalImprovement > 0 ? "success" : "default"}>
            Mejora total: {totalImprovement.toFixed(6)}
          </Tag>
          <Tag color="blue">
            {generations.length} generaciones
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
        onRow={(row, i) => ({
          // Resaltar si es la generación con el menor fitness global
          style:
            row.bestFitness === lastFitness && i === rows.length - 1
              ? { backgroundColor: "#f6ffed" }
              : {},
        })}
      />
    </Card>
  );
}
