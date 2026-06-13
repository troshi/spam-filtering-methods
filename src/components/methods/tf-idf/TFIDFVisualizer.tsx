/**
 * TFIDFVisualizer.tsx
 *
 * Componente orquestador del visualizador TF-IDF.
 *
 * Carga los primeros 50 mensajes del dataset spam.csv (vía import ?raw de Vite),
 * los pagina de 20 en 20, y muestra cinco vistas en Tabs:
 *
 *  0. Pipeline       → etapas de preprocesamiento por documento
 *  1. TF-IDF         → scores por documento
 *  2. Matriz         → heatmap completo términos × documentos
 *  3. TF             → frecuencia normalizada por documento
 *  4. IDF            → frecuencia inversa global
 */

import { useMemo, useState } from "react";
import { Pagination, Space, Tabs, Tag, Typography } from "antd";
import { useTFIDF } from "./useTFIDF.ts";
import ViewPipeline from "./ViewPipeline";
import ViewTFIDF from "./ViewTFIDF";
import ViewMatrix from "./ViewMatrix";
import ViewTF from "./ViewTF";
import ViewIDF from "./ViewIDF";
import { headerBlock, rootContainer } from "./styles";
import type { Document } from "./types";
import { parseSpamCsv } from "../../../utils/read-spam-file";

// Importar el CSV como string raw (procesado por Vite en build time)
import spamCsv from "../../../assets/spam.csv?raw";

const { Title, Text } = Typography;

/** Número de mensajes cargados del dataset */
const TOTAL_ITEMS = 50;
/** Mensajes mostrados por página */
const PAGE_SIZE = 20;

/**
 * Parsea y memoiza los 50 primeros documentos del CSV.
 * Se ejecuta una sola vez al montar el módulo.
 */
const ALL_DOCUMENTS: Document[] = parseSpamCsv(spamCsv, TOTAL_ITEMS);

export interface TFIDFVisualizerProps {
  /** Si se pasan documentos externos, se ignora el CSV. */
  documents?: Document[];
}

export default function TFIDFVisualizer({
  documents: externalDocs,
}: TFIDFVisualizerProps) {
  const [activeTab, setActiveTab] = useState<string>("pipeline");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Usar documentos externos si se proporcionan, si no el CSV
  const allDocs = externalDocs ?? ALL_DOCUMENTS;

  // Slice de la página actual (20 items)
  const documents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return allDocs.slice(start, start + PAGE_SIZE);
  }, [allDocs, currentPage]);

  // Calcular TF-IDF solo para la página actual
  const data = useTFIDF(documents);

  // Resetear a la primera pestaña al cambiar de página para evitar estado desincronizado
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setActiveTab("pipeline");
  };

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
      label: "TF-IDF",
      children: <ViewTFIDF data={data} documents={documents} />,
    },
    {
      key: "matrix",
      label: "Matriz",
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

  const spamCount  = documents.filter((d) => d.label === "spam").length;
  const hamCount   = documents.filter((d) => d.label === "ham").length;
  const startIndex = (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex   = Math.min(currentPage * PAGE_SIZE, allDocs.length);

  return (
    <div style={rootContainer}>
      {/* Encabezado */}
      <div style={headerBlock}>
        <Title level={3} style={{ margin: "0 0 4px" }}>
          TF-IDF Explorer
        </Title>
        <Space wrap style={{ fontSize: 13 }}>
          <Text type="secondary">
            Mostrando {startIndex}–{endIndex} de {allDocs.length} mensajes
          </Text>
          <Tag color="success">ham: {hamCount}</Tag>
          <Tag color="error">spam: {spamCount}</Tag>
          <Text type="secondary">
            · {data.allTerms.length} términos únicos
          </Text>
        </Space>
      </div>

      {/* Paginación superior */}
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end" }}>
        <Pagination
          current={currentPage}
          pageSize={PAGE_SIZE}
          total={allDocs.length}
          onChange={handlePageChange}
          showSizeChanger={false}
          showQuickJumper
          size="small"
        />
      </div>

      {/* Pestañas de vistas */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        type="card"
        size="small"
      />

      {/* Paginación inferior */}
      <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
        <Pagination
          current={currentPage}
          pageSize={PAGE_SIZE}
          total={allDocs.length}
          onChange={handlePageChange}
          showSizeChanger={false}
          size="small"
        />
      </div>
    </div>
  );
}
