/**
 * ViewPipeline.tsx
 *
 * Vista "Pipeline de preprocesamiento".
 *
 * Para cada documento muestra una tabla con las cuatro etapas del flujo:
 *
 *   Texto original
 *     → Lowercase + Tokenización  (tokens crudos)
 *     → Stopword Removal          (tokens sin palabras vacías)
 *     → Lemmatización             (lemas finales usados en TF-IDF)
 *
 * Permite ver exactamente qué tokens se generan, cuáles se eliminan
 * y cómo quedan los lemas que alimentan el cálculo TF-IDF.
 */

import { Card, Space, Tag, Tooltip, Typography } from "antd";
import {
  DOC_COLORS,
  DOC_BG,
  DOC_BORDER,
  docCardHeaderStyle,
  docCardStyle,
  docTitleStyle,
} from "./styles";
import type { Document, PreprocessResult } from "./types";

const { Text } = Typography;

// ── Colores de cada etapa ──────────────────────────────────────────────────────
const STEP_COLORS = {
  tokens:           "#1677ff",   // azul — tokenización
  withoutStopwords: "#52c41a",   // verde — sin stopwords
  lemmas:           "#722ed1",   // púrpura — lemas finales
} as const;

// ── Componente auxiliar: fila de tokens ───────────────────────────────────────

interface TokenRowProps {
  label: string;
  tokens: string[];
  color: string;
  /** Tokens que fueron eliminados en este paso (se tacharán en la etapa anterior) */
  removed?: Set<string>;
}

/**
 * Muestra una fila con el label del paso y sus tokens como Tags coloreados.
 * Si se pasa `removed`, los tokens que no pasan al siguiente paso
 * se muestran con opacidad reducida para comparación visual.
 */
function TokenRow({ label, tokens, color, removed }: TokenRowProps) {
  return (
    <div style={{ marginBottom: 10 }}>
      <Text
        strong
        style={{ fontSize: 11, color, display: "block", marginBottom: 4 }}
      >
        {label}
        <Text type="secondary" style={{ fontWeight: 400, marginLeft: 8 }}>
          ({tokens.length} tokens)
        </Text>
      </Text>
      <Space wrap size={4}>
        {tokens.length > 0 ? (
          tokens.map((t, i) => {
            const isRemoved = removed?.has(t);
            return (
              <Tooltip
                key={i}
                title={isRemoved ? "Eliminado en el siguiente paso" : t}
              >
                <Tag
                  style={{
                    fontFamily: "monospace",
                    fontSize: 12,
                    background: isRemoved ? "#f5f5f5" : `${color}18`,
                    border: `1px solid ${isRemoved ? "#d9d9d9" : color + "55"}`,
                    color: isRemoved ? "#bbb" : "#111",
                    textDecoration: isRemoved ? "line-through" : "none",
                    transition: "all .2s",
                  }}
                >
                  {t}
                </Tag>
              </Tooltip>
            );
          })
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>
            — sin tokens —
          </Text>
        )}
      </Space>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────

export interface ViewPipelineProps {
  documents: Document[];
  /** Etapas del pipeline, una entrada por documento (viene de TFIDFData.pipelineSteps) */
  pipelineSteps: PreprocessResult[];
}

/**
 * Renderiza una Card por documento con las cuatro etapas del pipeline
 * y la comparación visual entre cada paso.
 */
export default function ViewPipeline({
  documents,
  pipelineSteps,
}: ViewPipelineProps) {
  return (
    <Space direction="vertical" style={{ width: "100%" }} size="middle">
      {/* Leyenda del flujo */}
      <Space wrap>
        <Tag color={STEP_COLORS.tokens}>Tokenización</Tag>
        <Text type="secondary">→</Text>
        <Tag color={STEP_COLORS.withoutStopwords}>Sin stopwords</Tag>
        <Text type="secondary">→</Text>
        <Tag color={STEP_COLORS.lemmas}>Lemas</Tag>
      </Space>

      {documents.map((doc, i) => {
        const step = pipelineSteps[i];
        if (!step) return null;

        // Tokens que se eliminan en stopword removal
        const removedByStopwords = new Set(
          step.tokens.filter((t) => !step.withoutStopwords.includes(t))
        );

        // Tokens que cambian en lematización (forma distinta al token original)
        const changedByLemma = new Set(
          step.withoutStopwords.filter((t) => !step.lemmas.includes(t))
        );

        return (
          <Card
            key={i}
            size="small"
            style={docCardStyle(i)}
            styles={{ header: docCardHeaderStyle(i) }}
            title={
              <Space wrap>
                <Text strong style={docTitleStyle(i)}>
                  Documento {doc.id}
                </Text>
                <Text
                  type="secondary"
                  style={{ fontSize: 11, fontStyle: "italic" }}
                >
                  {doc.text}
                </Text>
              </Space>
            }
          >
            <div
              style={{
                background: DOC_BG[i % DOC_BG.length],
                border: `1px solid ${DOC_BORDER[i % DOC_BORDER.length]}`,
                borderRadius: 8,
                padding: "12px 14px",
              }}
            >
              {/* Paso 1+2: Tokenización */}
              <TokenRow
                label="① Lowercase + Tokenización"
                tokens={step.tokens}
                color={STEP_COLORS.tokens}
                removed={removedByStopwords}
              />

              {/* Paso 3: Sin stopwords */}
              <TokenRow
                label="② Stopword Removal"
                tokens={step.withoutStopwords}
                color={STEP_COLORS.withoutStopwords}
                removed={changedByLemma}
              />

              {/* Paso 4: Lemas finales */}
              <TokenRow
                label="③ Lematización (entrada TF-IDF)"
                tokens={step.lemmas}
                color={STEP_COLORS.lemmas}
              />

              {/* Resumen de reducción */}
              <div style={{ marginTop: 8, borderTop: "1px dashed #e5e7eb", paddingTop: 8 }}>
                <Space wrap>
                  <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                    {step.tokens.length} tokens
                  </Text>
                  <Text style={{ fontSize: 11, color: "#9CA3AF" }}>→</Text>
                  <Text style={{ fontSize: 11, color: "#9CA3AF" }}>
                    {step.withoutStopwords.length} sin stopwords
                    <Text style={{ color: "#EF4444", marginLeft: 4 }}>
                      (−{step.tokens.length - step.withoutStopwords.length})
                    </Text>
                  </Text>
                  <Text style={{ fontSize: 11, color: "#9CA3AF" }}>→</Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: DOC_COLORS[i % DOC_COLORS.length],
                      fontWeight: 600,
                    }}
                  >
                    {step.lemmas.length} lemas finales
                  </Text>
                </Space>
              </div>
            </div>
          </Card>
        );
      })}
    </Space>
  );
}
