/**
 * read-spam-file.ts
 *
 * Utilidad para parsear el CSV de spam en el navegador (sin Node.js / fs).
 *
 * El CSV tiene el formato:
 *   v1,v2,,,
 *   ham,"texto del mensaje",,,
 *   spam,"texto del mensaje",,,
 *
 * Se importa como string raw con el sufijo `?raw` de Vite:
 *   import spamCsv from '../assets/spam.csv?raw';
 *   const docs = parseSpamCsv(spamCsv, 50);
 *
 * Nota: no usa `fs` ni `csv-parser` porque esas APIs son de Node.js y no
 * están disponibles en el bundle del navegador generado por Vite.
 */

import type { Document } from "../components/methods/tf-idf/types";

/**
 * Parsea el contenido raw de un CSV de spam y devuelve los primeros `limit` documentos.
 *
 * @param csvContent  String completo del CSV (obtenido con `import '...csv?raw'`)
 * @param limit       Número máximo de filas a devolver (por defecto 50)
 */
export function parseSpamCsv(csvContent: string, limit = 50): Document[] {
  const lines = csvContent
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // Saltar la cabecera (primera línea: "v1,v2,,,")
  const dataLines = lines.slice(1);

  const documents: Document[] = [];

  for (let i = 0; i < dataLines.length && documents.length < limit; i++) {
    const line = dataLines[i];

    // Parsear la línea teniendo en cuenta que v2 puede estar entre comillas
    // y puede contener comas internas.
    const parsed = parseCsvLine(line);
    if (parsed.length < 2) continue;

    const text = parsed[1].trim();
    if (!text) continue;

    documents.push({
      id: documents.length + 1,
      label: parsed[0].trim() as "ham" | "spam",
      text,
    });
  }

  return documents;
}

/**
 * Parsea una línea CSV respetando campos entre comillas dobles.
 * Maneja comillas escapadas ("") dentro de un campo entrecomillado.
 *
 * Ejemplo:
 *   ham,"Go until jurong, crazy...",,,
 *   → ["ham", "Go until jurong, crazy...", "", "", ""]
 */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Comilla doble escapada dentro de un campo entrecomillado
        current += '"';
        i++;
      } else {
        // Alternar estado de "dentro de comillas"
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      fields.push(current);
      current = "";
    } else {
      current += ch;
    }
  }

  fields.push(current);
  return fields;
}
