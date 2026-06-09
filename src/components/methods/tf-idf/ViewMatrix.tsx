/**
 * ViewMatrix.tsx
 *
 * Vista "Matriz completa".
 *
 * Muestra la matriz TF-IDF completa: filas = términos, columnas = documentos.
 * Cada celda tiene un fondo tipo heatmap (azul antd) cuya intensidad es
 * proporcional al valor TF-IDF relativo al máximo global.
 * Solo se incluyen términos con al menos un valor positivo en algún documento.
 */

import { Card, Table, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DOC_COLORS,
  calcHeatBg,
  calcHeatText,
  heatCell,
} from "./styles";
import type { TFIDFData, Document } from "./types";

const { Text } = Typography;

export interface ViewMatrixProps {
  data: TFIDFData;
  documents: Document[];
}

/**
 * Transforma la matriz interna en filas planas consumibles por antd Table,
 * y construye columnas dinámicas con celdas coloreadas por heatmap.
 */
export default function ViewMatrix({ data, documents }: ViewMatrixProps) {
  const { allTerms, tfidfMatrix, maxTFIDF } = data;

  // Solo términos con al menos un score > 0 en cualquier documento
  const activeTerms = allTerms.filter((t) =>
    documents.some((_, i) => tfidfMatrix[i][t] > 0)
  );

  // Columnas: primera fija (término), luego una por documento
  const columns: ColumnsType<Record<string, unknown>> = [
    {
      title: "Término",
      dataIndex: "term",
      key: "term",
      fixed: "left",
      width: 130,
      render: (v: string) => <Text code>{v}</Text>,
    },
    ...documents.map((d, i) => ({
      title: <Text style={{ color: DOC_COLORS[i] }}>Doc {d.id}</Text>,
      dataIndex: `doc${i}`,
      key: `doc${i}`,
      align: "center" as const,
      render: (v: number) => (
        <Tooltip title={v > 0 ? v.toFixed(6) : "0"}>
          <div
            style={{
              ...heatCell,
              background: calcHeatBg(v, maxTFIDF),
              color: calcHeatText(v, maxTFIDF),
            }}
          >
            {v > 0 ? v.toFixed(4) : "—"}
          </div>
        </Tooltip>
      ),
    })),
  ];

  // Convertir la matriz a filas planas { key, term, doc0, doc1, ... }
  const rows = activeTerms.map((term) => {
    const row: Record<string, unknown> = { key: term, term };
    documents.forEach((_, i) => {
      row[`doc${i}`] = tfidfMatrix[i][term];
    });
    return row;
  });

  return (
    <Card
      size="small"
      title={<Text strong>Matriz TF-IDF — términos × documentos</Text>}
    >
      <Table
        columns={columns}
        dataSource={rows}
        pagination={false}
        size="small"
        scroll={{ x: "max-content" }}
      />
    </Card>
  );
}
