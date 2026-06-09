/**
 * styles.ts
 *
 * Tokens de diseño y objetos de estilo reutilizables para el módulo TF-IDF.
 *
 * Estrategia de colores:
 *  - Se usan los tokens semánticos de Ant Design (colorPrimary, colorSuccess, etc.)
 *    en los componentes dinámicos (vía `theme.useToken()`).
 *  - Para la paleta de colores POR DOCUMENTO se eligen exactamente los cuatro
 *    colores semánticos de antd para mantener coherencia visual con el resto de la UI.
 *
 * Exporta:
 *  - DOC_COLORS / DOC_BG / DOC_BORDER  → paleta por documento
 *  - Objetos de estilo estáticos tipados como CSSProperties
 */

import type { CSSProperties } from "react";

// ── Paleta por documento ────────────────────────────────────────────────────────
// Se usan los colores primarios del sistema Ant Design 6:
//   azul (primary), verde (success), naranja (warning), rojo (error)
export const DOC_COLORS: string[] = [
  "#1677ff", // antd colorPrimary
  "#52c41a", // antd colorSuccess
  "#faad14", // antd colorWarning
  "#ff4d4f", // antd colorError
];

export const DOC_BG: string[] = [
  "#e6f4ff", // blue-1
  "#f6ffed", // green-1
  "#fffbe6", // gold-1
  "#fff1f0", // red-1
];

export const DOC_BORDER: string[] = [
  "#91caff", // blue-3
  "#b7eb8f", // green-3
  "#ffe58f", // gold-3
  "#ffa39e", // red-3
];

// ── Layout general ──────────────────────────────────────────────────────────────

/** Contenedor raíz del visualizador */
export const rootContainer: CSSProperties = {
  fontFamily: "'IBM Plex Mono', 'Fira Code', monospace",
  maxWidth: 900,
  margin: "0 auto",
  padding: "1.5rem 1rem",
};

/** Bloque de encabezado (título + estadísticas) */
export const headerBlock: CSSProperties = {
  marginBottom: "1.5rem",
};

// ── ScoreBar ───────────────────────────────────────────────────────────────────

/** Contenedor flex de la barra de progreso + valor numérico */
export const scoreBarWrapper: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  minWidth: 200,
};

/** Texto del valor numérico junto a la barra */
export const scoreBarValue: CSSProperties = {
  fontSize: 12,
  fontVariantNumeric: "tabular-nums",
  minWidth: 52,
  textAlign: "right",
  color: "#6B7280",
};

/** Progress ocupa el espacio restante */
export const scoreBarProgress: CSSProperties = {
  flex: 1,
  margin: 0,
};

// ── Celdas de heatmap (ViewMatrix) ─────────────────────────────────────────────

/** Celda base del heatmap — el background y color se calculan en tiempo de ejecución */
export const heatCell: CSSProperties = {
  borderRadius: 4,
  padding: "2px 6px",
  fontVariantNumeric: "tabular-nums",
  fontSize: 12,
  textAlign: "center",
};

// ── Encabezados de Card por documento ──────────────────────────────────────────

/**
 * Devuelve los estilos de `Card.styles.header` para el documento `i`.
 * Usa los tokens de color de la paleta DOC_BG / DOC_BORDER.
 */
export function docCardHeaderStyle(i: number): CSSProperties {
  return {
    background: DOC_BG[i],
    borderColor: DOC_BORDER[i],
  };
}

/**
 * Devuelve el estilo del borde de la Card para el documento `i`.
 */
export function docCardStyle(i: number): CSSProperties {
  return {
    borderColor: DOC_BORDER[i],
  };
}

// ── Texto del título de documento dentro de la Card ────────────────────────────

/**
 * Devuelve el color del texto del título para el documento `i`.
 */
export function docTitleStyle(i: number): CSSProperties {
  return {
    color: DOC_COLORS[i],
  };
}

// ── Celda de heatmap con color dinámico ────────────────────────────────────────

/**
 * Calcula el color de fondo tipo heatmap (azul de antd) para un valor TF-IDF.
 * La opacidad varía linealmente entre 0.12 y 0.84 según el valor relativo al máximo.
 */
export function calcHeatBg(value: number, maxValue: number): string {
  if (value === 0) return "transparent";
  const alpha = 0.12 + 0.72 * (value / maxValue);
  return `rgba(22,119,255,${alpha.toFixed(2)})`;
}

/**
 * Devuelve blanco para celdas oscuras o gris oscuro para celdas claras.
 * El umbral es el 55 % del valor máximo.
 */
export function calcHeatText(value: number, maxValue: number): string {
  return value > maxValue * 0.55 ? "#fff" : "#374151";
}
