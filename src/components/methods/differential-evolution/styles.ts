/**
 * styles.ts
 *
 * Tokens de diseño y objetos de estilo para el módulo Evolución Diferencial.
 *
 * Sigue el mismo patrón que el módulo tf-idf:
 *  - Se usan los colores semánticos de Ant Design 6.
 *  - Los objetos CSSProperties se exportan para usarse directamente en `style={}`.
 *  - No hay estilos inline en los componentes; todo viene de aquí.
 */

import type { CSSProperties } from "react";

// ── Paleta de estado ────────────────────────────────────────────────────────────
// Colores semánticos antd usados para indicar mejora, neutro y empeoramiento.

/** Verde antd — el trial mejoró al target */
export const COLOR_IMPROVED = "#52c41a";   // colorSuccess
/** Rojo antd — el trial no mejoró */
export const COLOR_NOT_IMPROVED = "#ff4d4f"; // colorError
/** Azul antd — color primario / neutro */
export const COLOR_PRIMARY = "#1677ff";    // colorPrimary
/** Naranja antd — advertencia / resaltado */
export const COLOR_WARNING = "#faad14";    // colorWarning
/** Gris texto secundario */
export const COLOR_SECONDARY = "#6B7280";

// ── Colores por rol en la mutación ─────────────────────────────────────────────
/** Color del vector base a */
export const COLOR_VEC_A = "#1677ff";
/** Color del vector base b */
export const COLOR_VEC_B = "#52c41a";
/** Color del vector base c */
export const COLOR_VEC_C = "#faad14";
/** Color del vector mutante */
export const COLOR_MUTANT = "#722ed1";
/** Color del vector trial */
export const COLOR_TRIAL = "#13c2c2";

// ── Layout raíz ────────────────────────────────────────────────────────────────

/** Contenedor raíz del visualizador */
export const rootContainer: CSSProperties = {
  fontFamily: "'IBM Plex Mono', 'Fira Code', monospace",
  margin: "0 auto",
  padding: "1.5rem 1rem",
};

/** Bloque de encabezado */
export const headerBlock: CSSProperties = {
  marginBottom: "1.5rem",
};

// ── Celdas de vector ───────────────────────────────────────────────────────────

/**
 * Estilo base de una celda de valor numérico de vector.
 * Se usa para mostrar componentes individuales del vector.
 */
export const vectorCell: CSSProperties = {
  fontVariantNumeric: "tabular-nums",
  fontSize: 12,
  textAlign: "right",
};

// ── Badge de mejora ────────────────────────────────────────────────────────────

/**
 * Devuelve el color del tag según si el trial mejoró al target.
 */
export function improvedColor(improved: boolean): string {
  return improved ? COLOR_IMPROVED : COLOR_NOT_IMPROVED;
}

// ── Fondo de fila por estado ───────────────────────────────────────────────────

/**
 * Devuelve el color de fondo de una fila según si hubo mejora.
 * Se aplica como `style` en rowClassName de antd Table.
 */
export function rowBg(improved: boolean): CSSProperties {
  return {
    backgroundColor: improved ? "#f6ffed" : "#fff1f0",
  };
}

// ── Barra de convergencia ──────────────────────────────────────────────────────

/**
 * Calcula el color de la barra de fitness según su posición relativa al máximo.
 * Verde cuando es bajo (bueno), rojo cuando es alto (malo).
 */
export function fitnessBarColor(value: number, max: number): string {
  if (max === 0) return COLOR_PRIMARY;
  const ratio = value / max;
  if (ratio < 0.33) return COLOR_IMPROVED;
  if (ratio < 0.66) return COLOR_WARNING;
  return COLOR_NOT_IMPROVED;
}

// ── ScoreBar (reutilizada) ─────────────────────────────────────────────────────

export const scoreBarWrapper: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  minWidth: 200,
};

export const scoreBarValue: CSSProperties = {
  fontSize: 12,
  fontVariantNumeric: "tabular-nums",
  minWidth: 60,
  textAlign: "right",
  color: COLOR_SECONDARY,
};

export const scoreBarProgress: CSSProperties = {
  flex: 1,
  margin: 0,
};
