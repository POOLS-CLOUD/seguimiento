// Arranque de la nube (va suelto en el repositorio de la página): abre estado.enc con NUBE_CLAVE y deja el código y
// los datos de la app en la carpeta de destino. No escribe nada en el registro. Uso: node nube-arranque.js estado.enc app
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

const [, , origen, destino] = process.argv;
const b = Buffer.from(fs.readFileSync(origen, 'utf8').trim(), 'base64');
const d = crypto.createDecipheriv('aes-256-gcm', Buffer.from(process.env.NUBE_CLAVE || '', 'base64'), b.subarray(0, 12));
d.setAuthTag(b.subarray(12, 28));
const archivos = JSON.parse(zlib.gunzipSync(Buffer.concat([d.update(b.subarray(28)), d.final()])));
const base = path.resolve(destino);
for (const [r, b64] of Object.entries(archivos)) {
  const p = path.resolve(base, r);
  if (!p.startsWith(base + path.sep)) continue;
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, Buffer.from(b64, 'base64'));
}
