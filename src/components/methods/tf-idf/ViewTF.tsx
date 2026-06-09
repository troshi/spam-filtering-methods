/**
 * ViewTF.tsx
 *
 * Vista "TF por documento".
 *
 * Para cada documento muestra una Card con la frecuencia normalizada (TF)
 * de cada término, ordenada de mayor a menor.
 * TF(t, d) = apariciones(t, d) / total de tokens en d
 */

import { Card, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import ScoreBar from "./ScoreBar";
import {
  DOC_COLORS,
  docCardHeaderStyle,
  docCardStyle,
  docTitleStyle,
} from "./styles";
import type { TFIDFData, Document, TermTF } from "./types";

const { Text } = Typography;

export interface ViewTFProps {
  data: TFIDFData;
  documents: Document[];
}

/**
 * Renderiza una Card por documento con la tabla de TF de sus términos.
 */
export default function ViewTF({ data, documents }: ViewTFProps) {
  const { tfAll, maxTF, allTerms } = data;

  return (
    <Space direction="vertical" style={{ width: "100%" }} size="middle">
      {documents.map((doc, i) => {
        // Filtrar términos con TF > 0 y ordenar descendente
        const terms: TermTF[] = allTerms
          .map((t) => ({ term: t, tf: tfAll[i][t] ?? 0 }))
          .filter((x) => x.tf > 0)
          .sort((a, b) => b.tf - a.tf);

        const columns: ColumnsType<TermTF> = [
          {
            title: "Término",
            dataIndex: "term",
            key: "term",
            render: (v: string) => <Text code>{v}</Text>,
          },
          {
            title: "Frecuencia normalizada",
            dataIndex: "tf",
            key: "tf",
            render: (v: number) => (
              <ScoreBar value={v} max={maxTF} color={DOC_COLORS[i]} />
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
            <Table<TermTF>
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
