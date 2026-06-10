/**
 * ViewVectors.tsx
 *
 * Vista "Detalle de vectores".
 *
 * Para una generación y un vector seleccionados muestra paso a paso:
 *  1. Target (vector original)
 *  2. Vectores base a, b, c usados en la mutación
 *  3. Mutante = a + F*(b - c)
 *  4. Trial   = cruce(mutante, target)
 *  5. Seleccionado para la siguiente generación + comparación de fitness
 *
 * Usa dos Select (generación + vector) para navegar el historial.
 */

import { useState } from "react";
import {
  Card,
  Col,
  Descriptions,
  Row,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import type { GenerationRecord, VectorStep } from "./types";
import {
  COLOR_IMPROVED,
  COLOR_MUTANT,
  COLOR_NOT_IMPROVED,
  COLOR_PRIMARY,
  COLOR_TRIAL,
  COLOR_VEC_A,
  COLOR_VEC_B,
  COLOR_VEC_C,
  vectorCell,
} from "./styles";

const { Text } = Typography;

export interface ViewVectorsProps {
  generations: GenerationRecord[];
  F: number;
  CR: number;
}

// ── Componente auxiliar: tabla de un vector ────────────────────────────────────

interface VectorTableProps {
  label: string;
  color: string;
  vector: number[];
  extraLabel?: string;
}

/**
 * Muestra un vector como una fila de etiquetas coloreadas, una por dimensión.
 * El color de fondo sigue la paleta de roles (a, b, c, mutante, trial…).
 */
function VectorRow({ label, color, vector, extraLabel }: VectorTableProps) {
  return (
    <div style={{ marginBottom: 8 }}>
      <Space wrap size={4}>
        <Tag color={color} style={{ minWidth: 70, textAlign: "center" }}>
          {label}
        </Tag>
        {extraLabel && (
          <Text type="secondary" style={{ fontSize: 11 }}>
            {extraLabel}
          </Text>
        )}
      </Space>
      <div style={{ marginTop: 4, display: "flex", flexWrap: "wrap", gap: 4 }}>
        {vector.map((v, i) => (
          <Tag
            key={i}
            style={{
              fontFamily: "monospace",
              ...vectorCell,
              background: `${color}18`,
              border: `1px solid ${color}55`,
              color: "#111",
            }}
          >
            d{i}: {v.toFixed(5)}
          </Tag>
        ))}
      </div>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────

/**
 * Renderiza el detalle de mutación, cruce y selección
 * para el vector e = steps[vectorIdx] de la generación seleccionada.
 */
export default function ViewVectors({ generations, F, CR }: ViewVectorsProps) {
  const [selectedGen, setSelectedGen] = useState<number>(0);
  const [selectedVec, setSelectedVec] = useState<number>(0);

  const record: GenerationRecord | undefined = generations[selectedGen];
  if (!record) return null;

  const step: VectorStep | undefined = record.steps[selectedVec];
  if (!step) return null;

  const genOptions = generations.map((g) => ({
    value: g.generation,
    label: `Generación ${g.generation}`,
  }));

  const vecOptions = record.steps.map((s) => ({
    value: s.index,
    label: `Vector x${s.index}`,
  }));

  return (
    <Card
      size="small"
      title={
        <Space wrap>
          <Text strong>Detalle de vectores</Text>
          <Select
            size="small"
            style={{ minWidth: 160 }}
            value={selectedGen}
            onChange={(v) => { setSelectedGen(v); setSelectedVec(0); }}
            options={genOptions}
          />
          <Select
            size="small"
            style={{ minWidth: 130 }}
            value={selectedVec}
            onChange={setSelectedVec}
            options={vecOptions}
          />
        </Space>
      }
    >
      <Row gutter={[16, 16]}>
        {/* ── Panel izquierdo: vectores del proceso ── */}
        <Col xs={24} lg={16}>
          <Space direction="vertical" style={{ width: "100%" }} size={4}>
            <VectorRow
              label="Target x"
              color={COLOR_PRIMARY}
              vector={step.target}
              extraLabel={`fitness: ${step.targetFitness.toFixed(6)}`}
            />
            <VectorRow
              label={`a  (x${step.baseIndices[0]})`}
              color={COLOR_VEC_A}
              vector={step.a}
            />
            <VectorRow
              label={`b  (x${step.baseIndices[1]})`}
              color={COLOR_VEC_B}
              vector={step.b}
            />
            <VectorRow
              label={`c  (x${step.baseIndices[2]})`}
              color={COLOR_VEC_C}
              vector={step.c}
            />
            <VectorRow
              label="Mutante"
              color={COLOR_MUTANT}
              vector={step.mutant}
              extraLabel="a + F·(b − c)"
            />
            <VectorRow
              label="Trial"
              color={COLOR_TRIAL}
              vector={step.trial}
              extraLabel={`fitness: ${step.trialFitness.toFixed(6)}`}
            />
            <VectorRow
              label="Seleccionado"
              color={step.improved ? COLOR_IMPROVED : COLOR_NOT_IMPROVED}
              vector={step.selected}
              extraLabel={step.improved ? "✓ trial es mejor" : "✗ se mantiene target"}
            />
          </Space>
        </Col>

        {/* ── Panel derecho: resumen del paso ── */}
        <Col xs={24} lg={8}>
          <Descriptions
            column={1}
            size="small"
            bordered
            title={<Text strong>Resumen del paso</Text>}
            items={[
              {
                key: "gen",
                label: "Generación",
                children: selectedGen,
              },
              {
                key: "vec",
                label: "Vector",
                children: `x${step.index}`,
              },
              {
                key: "bases",
                label: "Vectores base",
                children: (
                  <Space>
                    <Tag color={COLOR_VEC_A}>a: x{step.baseIndices[0]}</Tag>
                    <Tag color={COLOR_VEC_B}>b: x{step.baseIndices[1]}</Tag>
                    <Tag color={COLOR_VEC_C}>c: x{step.baseIndices[2]}</Tag>
                  </Space>
                ),
              },
              {
                key: "F",
                label: "F (mutación)",
                children: <Text code>{F}</Text>,
              },
              {
                key: "CR",
                label: "CR (cruce)",
                children: <Text code>{CR}</Text>,
              },
              {
                key: "targetFit",
                label: "Fitness target",
                children: (
                  <Text style={{ fontVariantNumeric: "tabular-nums" }}>
                    {step.targetFitness.toFixed(6)}
                  </Text>
                ),
              },
              {
                key: "trialFit",
                label: "Fitness trial",
                children: (
                  <Text
                    style={{
                      fontVariantNumeric: "tabular-nums",
                      color: step.improved ? COLOR_IMPROVED : COLOR_NOT_IMPROVED,
                    }}
                  >
                    {step.trialFitness.toFixed(6)}
                  </Text>
                ),
              },
              {
                key: "result",
                label: "Resultado",
                children: step.improved ? (
                  <Tag color="success">Trial reemplaza target</Tag>
                ) : (
                  <Tag color="error">Target se mantiene</Tag>
                ),
              },
            ]}
          />
        </Col>
      </Row>
    </Card>
  );
}
