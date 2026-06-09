/**
 * ViewIDF.tsx
 *
 * Vista "IDF global".
 *
 * Muestra el IDF de cada término del vocabulario, ordenado de mayor a menor.
 * IDF(t) = log(N / df(t))
 *   N  = total de documentos
 *   df = documentos que contienen el término
 *
 * Un IDF alto → término raro → alta capacidad discriminativa.
 * La columna DF usa un Badge rojo cuando el término aparece en TODOS los documentos
 * (términos muy frecuentes y, por tanto, con IDF bajo).
 */

import { Badge, Card, Table, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import ScoreBar from "./ScoreBar";
import type { TFIDFData, Document } from "./types";

const { Text } = Typography;

export interface ViewIDFProps {
  data: TFIDFData;
  documents: Document[];
}

/**
 * Renderiza la tabla de IDF con todas las métricas del vocabulario.
 */
export default function ViewIDF({ data, documents }: ViewIDFProps) {
  const { allTerms, idfMap, dfMap, maxIDF } = data;

  // Ordenar por IDF descendente (términos más discriminativos primero)
  const sorted = [...allTerms].sort((a, b) => idfMap[b] - idfMap[a]);

  const columns: ColumnsType<{ term: string; key: string }> = [
    {
      title: "Término",
      dataIndex: "term",
      key: "term",
      render: (v: string) => <Text code>{v}</Text>,
    },
    {
      title: (
        <Tooltip title="Document Frequency: en cuántos documentos aparece el término">
          DF
        </Tooltip>
      ),
      dataIndex: "term",
      key: "df",
      align: "right",
      render: (v: string) => (
        // Rojo si aparece en todos los docs (término muy común, IDF ≈ 0)
        <Badge
          count={dfMap[v]}
          style={{
            backgroundColor:
              dfMap[v] >= documents.length ? "#ff4d4f" : "#1677ff",
          }}
          showZero
        />
      ),
    },
    {
      title: "IDF = log(N / df)",
      dataIndex: "term",
      key: "idf",
      render: (v: string) => (
        <ScoreBar value={idfMap[v]} max={maxIDF} color="#1677ff" />
      ),
    },
  ];

  return (
    <Card
      size="small"
      title={<Text strong>IDF — frecuencia inversa de documentos</Text>}
    >
      <Table
        columns={columns}
        dataSource={sorted.map((t) => ({ term: t, key: t }))}
        pagination={false}
        size="small"
      />
    </Card>
  );
}
