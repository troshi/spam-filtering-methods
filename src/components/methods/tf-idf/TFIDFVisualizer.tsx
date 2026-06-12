/**
 * TFIDFVisualizer.tsx
 *
 * Componente orquestador del visualizador TF-IDF.
 *
 * Pestañas:
 *  0. Pipeline       → etapas de preprocesamiento por documento
 *  1. TF-IDF         → scores por documento
 *  2. Matriz         → heatmap completo términos × documentos
 *  3. TF             → frecuencia normalizada por documento
 *  4. IDF            → frecuencia inversa global
 */

import { useState } from "react";
import { Tabs, Typography } from "antd";
import { useTFIDF } from "./useTFIDF.ts";
import ViewPipeline from "./ViewPipeline";
import ViewTFIDF from "./ViewTFIDF";
import ViewMatrix from "./ViewMatrix";
import ViewTF from "./ViewTF";
import ViewIDF from "./ViewIDF";
import { rootContainer, headerBlock } from "./styles";
import type { Document } from "./types";

const { Title, Text } = Typography;

const DEFAULT_DOCUMENTS: Document[] = [
  { id: 1, text: "This is a document about TypeScript." },
  { id: 2, text: "TypeScript is a programming language developed by Microsoft." },
  { id: 3, text: "JavaScript is another programming language often used with TypeScript." },
  { id: 4, text: "TF-IDF stands for Term Frequency-Inverse Document Frequency." },
];

export interface TFIDFVisualizerProps {
  documents?: Document[];
}

export default function TFIDFVisualizer({
  documents = DEFAULT_DOCUMENTS,
}: TFIDFVisualizerProps) {
  const [activeTab, setActiveTab] = useState<string>("pipeline");
  const data = useTFIDF(documents);

  const tabItems = [
    {
      key: "pipeline",
      label: "Pipeline",
      children: (
        <ViewPipeline
          documents={documents}
          pipelineSteps={data.pipelineSteps}
        />
      ),
    },
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
      <div style={headerBlock}>
        <Title level={3} style={{ margin: "0 0 4px" }}>
          TF-IDF Explorer
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {documents.length} documentos · {data.allTerms.length} términos únicos
          · pipeline: lowercase → tokenización → stopwords → lematización
        </Text>
      </div>

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
