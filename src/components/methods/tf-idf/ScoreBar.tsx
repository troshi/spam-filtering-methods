/**
 * ScoreBar.tsx
 *
 * Barra de progreso proporcional usada para visualizar valores TF, IDF y TF-IDF.
 *
 * Recibe:
 *  - value: el valor a representar
 *  - max: el valor máximo de referencia (determina el 100 %)
 *  - color: color de relleno de la barra (viene de DOC_COLORS)
 */

import { Progress } from "antd";
import { Typography } from "antd";
import { scoreBarWrapper, scoreBarValue, scoreBarProgress } from "./styles";

const { Text } = Typography;

export interface ScoreBarProps {
  value: number;
  max: number;
  color: string;
}

/**
 * Convierte `value / max` en un porcentaje entero y renderiza
 * un Progress de antd junto al valor numérico formateado a 4 decimales.
 */
export default function ScoreBar({ value, max, color }: ScoreBarProps) {
  // Porcentaje redondeado para el componente Progress (0-100)
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div style={scoreBarWrapper}>
      <Progress
        percent={percent}
        showInfo={false}
        strokeColor={color}
        size="small"
        style={scoreBarProgress}
      />
      <Text style={scoreBarValue}>{value.toFixed(4)}</Text>
    </div>
  );
}
