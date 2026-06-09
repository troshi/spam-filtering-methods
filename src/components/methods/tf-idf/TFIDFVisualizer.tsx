import { useState, useMemo, type ReactNode, type CSSProperties } from "react";
import type { Document, TermScore, TermTF, TFIDFData } from "./types";

type TabId = "tfidf" | "matrix" | "tf" | "idf";

// ── datos de ejemplo ───────────────────────────────────────────────────────────
const DEFAULT_DOCUMENTS: Document[] = [
  { id: 1, text: "This is a document about TypeScript." },
  { id: 2, text: "TypeScript is a programming language developed by Microsoft." },
  { id: 3, text: "JavaScript is another programming language often used with TypeScript." },
  { id: 4, text: "TF-IDF stands for Term Frequency-Inverse Document Frequency." },
];

const DOC_COLORS: string[] = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];
const DOC_BG: string[]     = ["#EFF6FF", "#ECFDF5", "#FFFBEB", "#FEF2F2"];
const DOC_BORDER: string[] = ["#BFDBFE", "#A7F3D0", "#FDE68A", "#FECACA"];

// ── lógica TF-IDF ──────────────────────────────────────────────────────────────
function tokenize(text: string): string[] {
  return text.toLowerCase().split(/\s+/);
}

function calcTF(doc: Document): Record<string, number> {
  const tokens = tokenize(doc.text);
  const cnt: Record<string, number> = {};
  for (const t of tokens) cnt[t] = (cnt[t] ?? 0) + 1;
  const total = tokens.length;
  const tf: Record<string, number> = {};
  for (const t in cnt) tf[t] = cnt[t] / total;
  return tf;
}

function calcIDF(term: string, documents: Document[]): number {
  const df = documents.filter((d) => tokenize(d.text).includes(term)).length;
  return df === 0 ? 0 : Math.log(documents.length / df);
}

function useTFIDF(documents: Document[]): TFIDFData {
  return useMemo(() => {
    const allTerms = [...new Set(documents.flatMap((d) => tokenize(d.text)))].sort();
    const tfAll = documents.map(calcTF);
    const idfMap = Object.fromEntries(allTerms.map((t) => [t, calcIDF(t, documents)]));
    const dfMap = Object.fromEntries(
      allTerms.map((t) => [t, documents.filter((d) => tokenize(d.text).includes(t)).length])
    );
    const tfidfMatrix = documents.map((_, i) =>
      Object.fromEntries(allTerms.map((t) => [t, (tfAll[i][t] ?? 0) * idfMap[t]]))
    );
    const maxTFIDF = Math.max(...tfidfMatrix.flatMap((row) => Object.values(row)));
    const maxTF    = Math.max(...tfAll.flatMap((row) => Object.values(row)));
    const maxIDF   = Math.max(...Object.values(idfMap));
    return { allTerms, tfAll, idfMap, dfMap, tfidfMatrix, maxTFIDF, maxTF, maxIDF };
  }, [documents]);
}

// ── componentes pequeños ───────────────────────────────────────────────────────
interface BarProps {
  value: number;
  max: number;
  color: string;
}

function Bar({ value, max, color }: BarProps) {
  const pct = max > 0 ? (value / max) * 140 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          height: 8,
          width: Math.max(pct, 2),
          borderRadius: 4,
          background: color,
          transition: "width .3s",
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 12, color: "#6B7280", fontVariantNumeric: "tabular-nums", minWidth: 52, textAlign: "right" }}>
        {value.toFixed(4)}
      </span>
    </div>
  );
}

interface TableProps {
  head: string[];
  rows: ReactNode;
}

function Table({ head, rows }: TableProps) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {head.map((h, i) => (
            <th
              key={i}
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "#9CA3AF",
                textTransform: "uppercase",
                letterSpacing: ".05em",
                padding: "6px 14px",
                textAlign: i === 0 ? "left" : "right",
                borderBottom: "1px solid #F3F4F6",
                background: "#F9FAFB",
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

interface TdProps {
  children: ReactNode;
  right?: boolean;
}

function Td({ children, right = false }: TdProps) {
  return (
    <td
      style={{
        fontSize: 13,
        padding: "6px 14px",
        borderBottom: "1px solid #F3F4F6",
        color: "#111827",
        textAlign: right ? "right" : "left",
      }}
    >
      {children}
    </td>
  );
}

// ── vistas ─────────────────────────────────────────────────────────────────────
interface ViewProps {
  data: TFIDFData;
  documents: Document[];
}

function ViewTFIDF({ data, documents }: ViewProps) {
  const { tfAll, idfMap, tfidfMatrix, maxTFIDF, allTerms } = data;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 4 }}>
        {documents.map((d, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#6B7280" }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: DOC_COLORS[i], display: "inline-block" }} />
            Doc {d.id}
          </span>
        ))}
      </div>
      {documents.map((doc, i) => {
        const terms: TermScore[] = allTerms
          .map((t) => ({ term: t, score: tfidfMatrix[i][t], tf: tfAll[i][t] ?? 0, idf: idfMap[t] }))
          .filter((x) => x.score > 0)
          .sort((a, b) => b.score - a.score);

        return (
          <div key={i} style={{ border: `1px solid ${DOC_BORDER[i]}`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", background: DOC_BG[i], borderBottom: `1px solid ${DOC_BORDER[i]}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: DOC_COLORS[i] }}>Documento {doc.id}</span>
              <span style={{ fontSize: 11, color: "#9CA3AF", fontStyle: "italic", maxWidth: "70%", textAlign: "right" }}>{doc.text}</span>
            </div>
            <Table
              head={["Término", "TF", "IDF", "TF-IDF"]}
              rows={terms.map(({ term, score, tf, idf }, j) => (
                <tr key={j} style={{ background: j % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                  <Td>{term}</Td>
                  <Td right><span style={{ fontVariantNumeric: "tabular-nums", color: "#6B7280" }}>{tf.toFixed(4)}</span></Td>
                  <Td right><span style={{ fontVariantNumeric: "tabular-nums", color: "#6B7280" }}>{idf.toFixed(4)}</span></Td>
                  <Td right><Bar value={score} max={maxTFIDF} color={DOC_COLORS[i]} /></Td>
                </tr>
              ))}
            />
          </div>
        );
      })}
    </div>
  );
}

function ViewMatrix({ data, documents }: ViewProps) {
  const { allTerms, tfidfMatrix, maxTFIDF } = data;
  const activeTerms = allTerms.filter((t) => documents.some((_, i) => tfidfMatrix[i][t] > 0));

  const heatBg = (v: number): string => {
    if (v === 0) return "transparent";
    const a = 0.12 + 0.72 * (v / maxTFIDF);
    return `rgba(59,130,246,${a.toFixed(2)})`;
  };

  const heatText = (v: number): string =>
    v > maxTFIDF * 0.55 ? "#fff" : "#374151";

  return (
    <div style={{ border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", background: "#F9FAFB", borderBottom: "1px solid #E5E7EB", fontSize: 13, fontWeight: 600, color: "#374151" }}>
        Matriz TF-IDF — términos × documentos
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".05em", padding: "6px 14px", textAlign: "left", borderBottom: "1px solid #F3F4F6", background: "#F9FAFB", minWidth: 120 }}>Término</th>
              {documents.map((d, i) => (
                <th key={i} style={{ fontSize: 11, color: DOC_COLORS[i], textTransform: "uppercase", letterSpacing: ".05em", padding: "6px 14px", textAlign: "center", borderBottom: "1px solid #F3F4F6", background: "#F9FAFB", minWidth: 80 }}>Doc {d.id}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeTerms.map((term, ri) => (
              <tr key={ri} style={{ background: ri % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                <td style={{ fontSize: 13, padding: "5px 14px", borderBottom: "1px solid #F3F4F6", color: "#374151" }}>{term}</td>
                {documents.map((_, ci) => {
                  const v = tfidfMatrix[ci][term];
                  return (
                    <td
                      key={ci}
                      style={{
                        fontSize: 12,
                        padding: "5px 10px",
                        borderBottom: "1px solid #F3F4F6",
                        textAlign: "center",
                        fontVariantNumeric: "tabular-nums",
                        background: heatBg(v),
                        color: heatText(v),
                        borderRadius: 4,
                      } as CSSProperties}
                    >
                      {v > 0 ? v.toFixed(4) : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ViewTF({ data, documents }: ViewProps) {
  const { tfAll, maxTF, allTerms } = data;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {documents.map((doc, i) => {
        const terms: TermTF[] = allTerms
          .map((t) => ({ term: t, tf: tfAll[i][t] ?? 0 }))
          .filter((x) => x.tf > 0)
          .sort((a, b) => b.tf - a.tf);
        return (
          <div key={i} style={{ border: `1px solid ${DOC_BORDER[i]}`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", background: DOC_BG[i], borderBottom: `1px solid ${DOC_BORDER[i]}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: DOC_COLORS[i] }}>Documento {doc.id}</span>
              <span style={{ fontSize: 11, color: "#9CA3AF", fontStyle: "italic", maxWidth: "70%", textAlign: "right" }}>{doc.text}</span>
            </div>
            <Table
              head={["Término", "Frecuencia normalizada"]}
              rows={terms.map(({ term, tf }, j) => (
                <tr key={j} style={{ background: j % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                  <Td>{term}</Td>
                  <Td right><Bar value={tf} max={maxTF} color={DOC_COLORS[i]} /></Td>
                </tr>
              ))}
            />
          </div>
        );
      })}
    </div>
  );
}

interface ViewIDFProps {
  data: TFIDFData;
}

function ViewIDF({ data }: ViewIDFProps) {
  const { allTerms, idfMap, dfMap, maxIDF } = data;
  const sorted = [...allTerms].sort((a, b) => idfMap[b] - idfMap[a]);
  return (
    <div style={{ border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", background: "#F9FAFB", borderBottom: "1px solid #E5E7EB", fontSize: 13, fontWeight: 600, color: "#374151" }}>
        IDF — frecuencia inversa de documentos
      </div>
      <Table
        head={["Término", "DF", "IDF = log(N/df)"]}
        rows={sorted.map((term, j) => (
          <tr key={j} style={{ background: j % 2 === 0 ? "#fff" : "#FAFAFA" }}>
            <Td>{term}</Td>
            <Td right><span style={{ color: "#6B7280" }}>{dfMap[term]}</span></Td>
            <Td right><Bar value={idfMap[term]} max={maxIDF} color="#3B82F6" /></Td>
          </tr>
        ))}
      />
    </div>
  );
}

// ── componente principal ───────────────────────────────────────────────────────
interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: "tfidf",  label: "TF-IDF por documento" },
  { id: "matrix", label: "Matriz completa" },
  { id: "tf",     label: "TF" },
  { id: "idf",    label: "IDF" },
];

export interface TFIDFVisualizerProps {
  documents?: Document[];
}

export default function TFIDFVisualizer({ documents = DEFAULT_DOCUMENTS }: TFIDFVisualizerProps) {
  const [activeTab, setActiveTab] = useState<TabId>("tfidf");
  const data = useTFIDF(documents);

  const tabStyle = (id: TabId): CSSProperties => ({
    padding: "6px 16px",
    borderRadius: 8,
    border: "1px solid",
    fontSize: 13,
    cursor: "pointer",
    transition: "all .15s",
    fontWeight: activeTab === id ? 500 : 400,
    background: activeTab === id ? "#1D4ED8" : "transparent",
    color: activeTab === id ? "#fff" : "#6B7280",
    borderColor: activeTab === id ? "#1D4ED8" : "#E5E7EB",
  });

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', 'Fira Code', monospace", maxWidth: 860, margin: "0 auto", padding: "1.5rem 1rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>TF-IDF Explorer</h1>
        <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>
          {documents.length} documentos · {data.allTerms.length} términos únicos
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1.25rem" }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={tabStyle(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "tfidf"  && <ViewTFIDF  data={data} documents={documents} />}
      {activeTab === "matrix" && <ViewMatrix data={data} documents={documents} />}
      {activeTab === "tf"     && <ViewTF     data={data} documents={documents} />}
      {activeTab === "idf"    && <ViewIDF    data={data} />}
    </div>
  );
}
