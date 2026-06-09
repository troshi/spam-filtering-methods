/**
 * TFIDFVisualizer.tsx
 *
 * Componente orquestador del visualizador TF-IDF.
 *
 * Responsabilidades:
 *  1. Recibir (o usar por defecto) la lista de documentos a analizar.
 *  2. Ejecutar el hook `useTFIDF` que centraliza todos los cálculos.
 *  3. Renderizar las cuatro vistas a través de un `Tabs` de Ant Design:
 *       - ViewTFIDF  → TF-IDF por documento
 *       - ViewMatrix → Matriz completa con heatmap
 *       - ViewTF     → TF por documento
 *       - ViewIDF    → IDF global del vocabulario
 */

import { useState } from "react";
import { Tabs, Typography } from "antd";
import { useTFIDF } from "./useTFIDF.ts";
import ViewTFIDF from "./ViewTFIDF";
import ViewMatrix from "./ViewMatrix";
import ViewTF from "./ViewTF";
import ViewIDF from "./ViewIDF";
import { rootContainer, headerBlock } from "./styles";
import type { Document } from "./types";

const { Title, Text } = Typography;

// ── Documentos de ejemplo ──────────────────────────────────────────────────────
// Se usan cuando el componente padre no proporciona una lista de documentos.
const DEFAULT_DOCUMENTS: Document[] = [
  { id: 1, text: "This is a document about TypeScript." },
  {
    id: 2,
    text: "TypeScript is a programming language developed by Microsoft.",
  },
  {
    id: 3,
    text: "JavaScript is another programming language often used with TypeScript.",
  },
  {
    id: 4,
    text: "TF-IDF stands for Term Frequency-Inverse Document Frequency.",
  },
];

// ── Props ──────────────────────────────────────────────────────────────────────
export interface TFIDFVisualizerProps {
  /** Lista de documentos a analizar. Si se omite se usan los documentos de ejemplo. */
  documents?: Document[];
}

/**
 * Punto de entrada del módulo TF-IDF.
 * Calcula todos los datos una sola vez con `useTFIDF` y los pasa a cada vista.
 */
export default function TFIDFVisualizer({
  documents = DEFAULT_DOCUMENTS,
}: TFIDFVisualizerProps) {
  const [activeTab, setActiveTab] = useState<string>("tfidf");

  // Todos los cálculos TF, IDF y TF-IDF están memoizados en este hook
  const data = useTFIDF(documents);

  // Definición declarativa de las pestañas
  const tabItems = [
    {
      key: "tfidf",
      label: "TF-IDF por documento",
      children: <ViewTFIDF data={data} documents={documents} />,
    },
    {
      key: "matrix",
      label: "Matriz completa",
      children: <ViewMatrix data={data} documents={documents} />,
    },
    {
      key: "tf",
      label: "TF",
      children: <ViewTF data={data} documents={documents} />,
    },
    {
      key: "idf",
      label: "IDF",
      children: <ViewIDF data={data} documents={documents} />,
    },
  ];

  return (
    <div style={rootContainer}>
      {/* Encabezado: título y estadísticas del corpus */}
      <div style={headerBlock}>
        <Title level={3} style={{ margin: "0 0 4px" }}>
          TF-IDF Explorer
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {documents.length} documentos · {data.allTerms.length} términos únicos
        </Text>
      </div>

      {/* Pestañas de las cuatro vistas */}
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
