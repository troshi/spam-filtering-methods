/**
 * ViewTFIDF.tsx
 *
 * Vista "TF-IDF por documento".
 *
 * Para cada documento muestra una Card con una Table que lista los términos
 * ordenados por su puntuación TF-IDF descendente.
 * Solo se incluyen términos con TF-IDF > 0.
 *
 * Columnas: Término | TF | IDF | TF-IDF (barra visual)
 */

import { Card, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import ScoreBar from "./ScoreBar";
import {
  DOC_COLORS,
  docCardHeaderStyle,
  docCardStyle,
  docTitleStyle,
} from "./styles";
import type { TFIDFData, Document, TermScore } from "./types";

const { Text } = Typography;

export interface ViewTFIDFProps {
  data: TFIDFData;
  documents: Document[];
}

/**
 * Renderiza una Card por documento con la tabla de términos y sus scores.
 */
export default function ViewTFIDF({ data, documents }: ViewTFIDFProps) {
  const { tfAll, idfMap, tfidfMatrix, maxTFIDF, allTerms } = data;

  return (
    <Space direction="vertical" style={{ width: "100%" }} size="middle">
      {/* Leyenda de colores: un Tag por documento */}
      <Space wrap>
        {documents.map((d, i) => (
          <Tag key={i} color={DOC_COLORS[i]}>
            Doc {d.id}
          </Tag>
        ))}
      </Space>

      {documents.map((doc, i) => {
        // Filtrar términos con score positivo y ordenar de mayor a menor
        const terms: TermScore[] = allTerms
          .map((t) => ({
            term: t,
            score: tfidfMatrix[i][t],
            tf: tfAll[i][t] ?? 0,
            idf: idfMap[t],
          }))
          .filter((x) => x.score > 0)
          .sort((a, b) => b.score - a.score);

        const columns: ColumnsType<TermScore> = [
          {
            title: "Término",
            dataIndex: "term",
            key: "term",
            render: (v: string) => <Text code>{v}</Text>,
          },
          {
            title: "TF",
            dataIndex: "tf",
            key: "tf",
            align: "right",
            render: (v: number) => (
              <Text style={{ color: "#6B7280", fontVariantNumeric: "tabular-nums" }}>
                {v.toFixed(4)}
              </Text>
            ),
          },
          {
            title: "IDF",
            dataIndex: "idf",
            key: "idf",
            align: "right",
            render: (v: number) => (
              <Text style={{ color: "#6B7280", fontVariantNumeric: "tabular-nums" }}>
                {v.toFixed(4)}
              </Text>
            ),
          },
          {
            title: "TF-IDF",
            dataIndex: "score",
            key: "score",
            render: (v: number) => (
              <ScoreBar value={v} max={maxTFIDF} color={DOC_COLORS[i]} />
            ),
          },
        ];

        return (
          <Card
            key={i}
            size="small"
            style={docCardStyle(i)}
            styles={{ header: docCardHeaderStyle(i) }}
            title={
              <Space>
                <Text strong style={docTitleStyle(i)}>
                  Documento {doc.id}
                </Text>
                <Text type="secondary" style={{ fontSize: 11, fontStyle: "italic" }}>
                  {doc.text}
                </Text>
              </Space>
            }
          >
            <Table<TermScore>
              columns={columns}
              dataSource={terms}
              rowKey="term"
              pagination={false}
              size="small"
            />
          </Card>
        );
      })}
    </Space>
  );
}
