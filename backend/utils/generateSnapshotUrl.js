// utils/generateSnapshotUrl.js
import fs from "fs";
import path from "path";
import axios from "axios";

/**
 * Genera una snapshot de Mapbox y la guarda en la carpeta uploads/snapshotMap
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} zoom - opcional, default 14
 * @param {number} width - opcional, default 600
 * @param {number} height - opcional, default 400
 * @returns {string} ruta relativa al archivo guardado
 */
export const generateSnapshotUrl = async (
  latitude,
  longitude,
  zoom = 14,
  width = 600,
  height = 400
) => {
  if (!process.env.MAPBOX_TOKEN) {
    throw new Error("MAPBOX_TOKEN no definido en las variables de entorno");
  }

  const mapboxToken = process.env.MAPBOX_TOKEN;

  // URL de Mapbox Static Image API
  const url = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+ff0000(${longitude},${latitude})/${longitude},${latitude},${zoom}/${width}x${height}?access_token=${mapboxToken}`;

  // Carpeta donde se guardarán las snapshots
  const uploadDir = path.join("uploads", "snapshotMap");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  // Nombre de archivo único
  const filename = `${Date.now()}-${latitude}-${longitude}.png`;
  const filepath = path.join(uploadDir, filename);

  // Descargar la imagen y guardarla
  const response = await axios.get(url, { responseType: "arraybuffer" });
  fs.writeFileSync(filepath, response.data);

  // Retornar ruta relativa para guardarla en MongoDB
  return `/uploads/snapshotMap/${filename}`;
};
